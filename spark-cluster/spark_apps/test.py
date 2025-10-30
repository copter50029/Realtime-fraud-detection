# sudo chown -R $USER:$USER /home/copter/Github-Project/Spark-testing/spark_apps in case of permission issues
from pyspark.sql import SparkSession

if __name__ == "__main__":
    spark = SparkSession.builder.appName("HelloJob").getOrCreate()
    for i in range(100):
        print(f"hello {i}")
    spark.stop()