# Realtime Fraud Detection

[![contributors](https://img.shields.io/github/contributors/copter50029/Realtime-fraud-detection)](https://github.com/copter50029/Realtime-fraud-detection/graphs/contributors)
[![forks](https://img.shields.io/github/forks/copter50029/Realtime-fraud-detection)](https://github.com/copter50029/Realtime-fraud-detection/network/members)
[![license](https://img.shields.io/github/license/copter50029/Realtime-fraud-detection)](https://github.com/copter50029/Realtime-fraud-detection/blob/main/LICENSE)

## Overview

A system designed to identify and prevent fraudulent activities in real-time.

## Description

This project leverages machine learning algorithms and real-time data processing to detect and prevent fraudulent activities as they occur.
This project uses Kafka for real-time data streaming, Spark for data processing, and a pre-trained machine learning model (Spark MLlib) for fraud detection.

## Getting Started

### Dependencies

- Requires Docker Desktop to be installed and running.

### Installing

- Data files are located in the `data` directory.
- The pre-trained machine learning model is located in the `model` directory.

### Executing program

- How to run the program
- Step-by-step bullets

In terminal, navigate to the project directory and run:

```bash
mkdir -p ./Data
```
in `Data` folder, place your input data files if you have any.
but we have included sample data files for testing purpose.

Then, change to the `Docker` directory and create necessary folders and set the Airflow user ID in a `.env` file:

```bash
cd Docker/
mkdir -p ./dags ./logs ./plugins ./config
echo -e "AIRFLOW_UID=$(id -u)" > .env
```

In `.env` file, set variables as needed. Default values are provided for reference:

```
# add the following variables to your .env file AIRFLOW_UID will be set automatically
POSTGRES_PASSWORD=airflow
MYSQL_ROOT_PASSWORD=Super_Secret_Password
```

Then, for the first time, initialize the Airflow components:

```bash
docker-compose up airflow-init
```

Wait until the initialization is complete.

After that, clean up the initialization containers:

```bash
docker compose down --volumes --remove-orphans
```

folder structure in `Docker` should be like this:

```
Docker/
├── config/
│   └── airflow.cfg
├── dags/
│   └── spark_stream.py
├── logs/
├── plugins/
├── script/
│   └── init.sql
├── .env
├── .env.spark
├── docker-compose.yaml
├── Dockerfile
├── Makefile
└── requirements.txt
```

we finish setting up airflow components.
Next, if you first time running the project, you to build the custom image for spark worker with the required dependencies:

```bash
cd ../spark-cluster
wget https://archive.apache.org/dist/spark/spark-4.0.1/spark-4.0.1-bin-hadoop3.tgz
docker compose build
```

folder structure in `spark-cluster` should be like this:

```
spark-cluster/
    ├── conf
    │   └── spark-defaults.conf
    └── Dockerfile
    └── entrypoint.sh
    └── requirements.txt
    └── spark-4.0.1-bin-hadoop3.tgz
```

For first time users, need to pre-train ML model
open pyspark/notebook server at `http://localhost:8888` and run the notebook `ML-train.ipynb` to train and save the model.
For training data, following this [link](https://www.kaggle.com/datasets/kartik2112/fraud-detection/data?select=fraudTrain) to download the dataset.

folder structure in `spark-chain` should be like this:

```
spark-cluster/
    ├── ML/
    │   └── pipeline_model/  # Pre-trained ML model saved here
    │   └── ML-train.ipynb
    │   └── fraudTrain.csv
    └── pysparkNb.ipynb # reference notebook for training
    └── Dockerfile
    └── requirements.txt
```

When you have pipeline_model and fraudTrain.csv then you can delete fraudTrain.csv

```bash
rm spark-cluster/ML/fraudTrain.csv
rm spark-cluster/ML-train.ipynb
```

Finally, start all services:

```bash
cd ../Docker
make run-d
# or make run-scaled for scaled spark cluster
```

wait until all services are up and running.
Next, open Airflow webserver at `http://localhost:8080` and trigger the DAG named `spark_stream` to start the fraud detection process.
or use command line to trigger the DAG:

```bash
make turn-on-dag
```

Next , send spark job to spark cluster using the command below:

```bash
make Submit_ML
```

you can monitor data flow in Kafka topics using control center at `http://localhost:9021`

Next , you can see web dashboard for monitoring results (Next.js framework) 
```bash
cd web-dashboard
npm install i
npm run dev
```

## Authors

- **Kritsada Ruangthawee** - 2320110188 - Lead Developer - [GitHub-Profile](https://github.com/copter50029)
- **Naphat Soontornwanlop** - 2320110139 - Machine Learning Developer - [GitHub-Profile](https://github.com/MrLonely1423)
- **Lee-Anne Carlo I. Junio** - 2320110162 - Web Developer - [GitHub-Profile](https://github.com/L33by)
- **Teetat Lertsaksereekul** - 2320110170 - Data Engineer - [GitHub-Profile](https://github.com/TeetatL)
- **Kraipich Thanasitvekin** - 2320110196 - Web Developer - [GitHub-Profile](https://github.com/NoWMoNz)
