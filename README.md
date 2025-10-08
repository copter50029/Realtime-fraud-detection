# Realtime Fraud Detection

[![Super Linter](https://github.com/copter50029/Realtime-fraud-detection/actions/workflows/main.yml/badge.svg)](https://github.com/copter50029/Realtime-fraud-detection/actions/workflows/main.yml)
[![contributors](https://img.shields.io/github/contributors/copter50029/Realtime-fraud-detection)](https://github.com/copter50029/Realtime-fraud-detection/graphs/contributors)
[![forks](https://img.shields.io/github/forks/copter50029/Realtime-fraud-detection)](https://github.com/copter50029/Realtime-fraud-detection/network/members)
[![license](https://img.shields.io/github/license/copter50029/Realtime-fraud-detection)](https://github.com/copter50029/Realtime-fraud-detection/blob/main/LICENSE)

## Realtime Fraud Detection

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
mkdir -p ./dags ./logs ./plugins ./config
echo -e "AIRFLOW_UID=$(id -u)" > .env
```

Then, for the first time, initialize the Airflow components:

```bash
docker-compose up airflow-init
```

After that, clean up the initialization containers:

```bash
docker compose down --volumes --remove-orphans
```

Finally, start the Airflow services:

```bash
docker-compose up
```

Make sure everything containers are running:

```bash
docker ps
```
