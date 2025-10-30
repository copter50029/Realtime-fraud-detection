from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, to_json, struct, year, month, dayofmonth, hour, minute, udf, when
from pyspark.sql.types import StructType, StructField, DoubleType, StringType, IntegerType, LongType
from pyspark.ml import PipelineModel
from pyspark.sql.functions import to_timestamp
import math

if __name__ == "__main__":
    spark = SparkSession.builder \
    .appName("KafkaFraudDetectionStream") \
    .master("local[*]") \
    .config("spark.jars.packages", "org.apache.spark:spark-streaming-kafka-0-10_2.13:4.0.0,org.apache.spark:spark-sql-kafka-0-10_2.13:4.0.0") \
    .getOrCreate()
    spark.sparkContext.setLogLevel("WARN")
    first_run = True
    # 2. Define schema for Kafka JSON messages (all fields from your item)
    schema = StructType([
        StructField("id", IntegerType()),
        StructField("trans_date_trans_time", StringType()),
        StructField("cc_num", LongType()),
        StructField("merchant", StringType()),
        StructField("category", StringType()),
        StructField("amt", DoubleType()),
        StructField("first", StringType()),
        StructField("last", StringType()),
        StructField("gender", StringType()),
        StructField("street", StringType()),
        StructField("city", StringType()),
        StructField("state", StringType()),
        StructField("zip", IntegerType()),
        StructField("lat", DoubleType()),
        StructField("long", DoubleType()),
        StructField("city_pop", IntegerType()),
        StructField("job", StringType()),
        StructField("dob", StringType()),
        StructField("trans_num", StringType()),
        StructField("unix_time", LongType()),
        StructField("merch_lat", DoubleType()),
        StructField("merch_long", DoubleType())
    ])

    # 3. Read from Kafka topic
    if first_run:
        kafka_df = spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "broker1:29092") \
            .option("subscribe", "transactions") \
            .option("checkpointLocation", "/tmp/spark_checkpoints/kafka_transactions") \
            .option("startingOffsets", "earliest") \
            .load()
        first_run = False
    else:
        kafka_df = spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "broker1:29092") \
            .option("subscribe", "transactions") \
            .option("checkpointLocation", "/tmp/spark_checkpoints/kafka_transactions") \
            .option("startingOffsets", "latest") \
            .load()


    # 4. Parse Kafka JSON (value column is bytes, convert to string)
    json_df = kafka_df.selectExpr("CAST(value AS STRING) AS json_str")
    parsed_df = json_df.select(from_json(col("json_str"), schema).alias("data")).select("data.*")

    # 5. Feature engineering in Spark
    fe_df = parsed_df.withColumn("trans_date_trans_time", to_timestamp("trans_date_trans_time", "M/d/yyyy H:mm")) \
        .withColumn("dob", to_timestamp("dob", "M/d/yyyy")) \
        .withColumn("age", year(col("trans_date_trans_time")) - year(col("dob"))) \
        .withColumn("day", dayofmonth(col("trans_date_trans_time"))) \
        .withColumn("month", month(col("trans_date_trans_time"))) \
        .withColumn("year", year(col("trans_date_trans_time"))) \
        .withColumn("hour", hour(col("trans_date_trans_time"))) \
        .withColumn("minute", minute(col("trans_date_trans_time")))

    def haversine_udf(lat1, lon1, lat2, lon2):
        R = 6371.0
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    haversine = udf(haversine_udf, DoubleType())
    fe_df = fe_df.withColumn("distance_km", haversine(col("lat"), col("long"), col("merch_lat"), col("merch_long")))

    def age_group_udf(age):
        if age is None:
            return None
        if age < 18:
            return "Teen"
        elif age < 25:
            return "Young Adult"
        elif age < 35:
            return "Adult"
        elif age < 50:
            return "Middle-aged"
        elif age < 65:
            return "Senior"
        else:
            return "Elderly"
    age_group = udf(age_group_udf, StringType())
    fe_df = fe_df.withColumn("age_group", age_group(col("age")))

    def distance_group_udf(dist):
        if dist is None:
            return None
        if dist < 0.5:
            return "Very Near"
        elif dist < 3:
            return "Near"
        elif dist < 15:
            return "Moderate"
        elif dist < 50:
            return "Far"
        else:
            return "Very Far"
    distance_group = udf(distance_group_udf, StringType())
    fe_df = fe_df.withColumn("distance_group", distance_group(col("distance_km")))

    # 6. Load trained Spark ML Pipeline model
    model = PipelineModel.load("/opt/spark/pipeline_model") 
    # 7. Run prediction
    predictions_df = model.transform(fe_df)

    # 8. Add is_fraud column (1 if prediction==1, else 0)
    result_df = predictions_df.withColumn("is_fraud", when(col("prediction") == 1.0, 1).otherwise(0))

    # 9. Convert to JSON for Kafka sink (include all fields including feature engineering and is_fraud)
    list_of_newcol = [col("distance_km"),col("distance_group"),col("age")
                    ,col("age_group") ,col("is_fraud")]
    output_columns = [col(c) for c in parsed_df.columns] + list_of_newcol
    output_df = result_df.select(to_json(struct(*output_columns)).alias("value"))

    query_kafka = output_df.writeStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "broker1:29092") \
        .option("topic", "ml_predictions") \
        .option("checkpointLocation", "/tmp/spark_checkpoints/ml_predictions") \
        .outputMode("append") \
        .start()

    query_kafka.awaitTermination()