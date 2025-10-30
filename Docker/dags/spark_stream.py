"""
DAG for real-time fraud detection using Airflow streaming and Kafka.
"""

import json
import time

import pandas as pd
import pendulum

from airflow.operators.python import PythonOperator
from airflow.sdk import DAG
from kafka import KafkaProducer

DATA_PATH = "/opt/airflow/data/fraud-data.csv"


def extract_data(data_path):
    """Extracts data from CSV file."""
    data = pd.read_csv(data_path)
    return data


def transform_data(data):
    """Transforms raw data into a list of dictionaries."""
    transformed = []
    for _, row in data.iterrows():
        item = {
            "id": int(row["Unnamed: 0"]),
            "trans_date_trans_time": row["trans_date_trans_time"],
            "cc_num": int(row["cc_num"]),
            "merchant": row["merchant"],
            "category": row["category"],
            "amt": float(row["amt"]),
            "first": row["first"],
            "last": row["last"],
            "gender": row["gender"],
            "street": row["street"],
            "city": row["city"],
            "state": row["state"],
            "zip": int(row["zip"]),
            "lat": float(row["lat"]),
            "long": float(row["long"]),
            "city_pop": int(row["city_pop"]),
            "job": row["job"],
            "dob": row["dob"],
            "trans_num": row["trans_num"],
            "unix_time": int(row["unix_time"]),
            "merch_lat": float(row["merch_lat"]),
            "merch_long": float(row["merch_long"]),
        }
        transformed.append(item)
    return transformed


def load_data(data):
    """Sends transformed data to Kafka topic."""
    producer = KafkaProducer(bootstrap_servers=["broker1:29092"], max_block_ms=5000)
    for record in data:
        producer.send("transactions", json.dumps(record).encode("utf-8"))
        time.sleep(0.5)  # Simulate real-time by adding a delay


with DAG(
    dag_id="spark_stream",
    schedule="@daily",
    start_date=pendulum.datetime(2025, 10, 4, tz="UTC"),
    catchup=False,
) as dag:
    extract_task = PythonOperator(
        task_id="extract_data",
        python_callable=extract_data,
        op_kwargs={"data_path": DATA_PATH},
    )

    transform_task = PythonOperator(
        task_id="transform_data",
        python_callable=transform_data,
        op_kwargs={"data": extract_task.output},
    )

    load_task = PythonOperator(
        task_id="load_data",
        python_callable=load_data,
        op_kwargs={"data": transform_task.output},
    )

extract_task >> transform_task >> load_task  # pylint: disable=pointless-statement
