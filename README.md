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

```
mkdir -p ./dags ./logs ./plugins ./config
echo -e "AIRFLOW_UID=$(id -u)" > .env
```

Then, for the first time, initialize the Airflow components:

```
docker-compose up airflow-init
```

After that, clean up the initialization containers:

```
docker compose down --volumes --remove-orphans
```

Finally, start the Airflow services:

```
docker-compose up
```

Make sure everything containers are running:

```
docker ps
```

For accessing the Airflow web interface, open your web browser and navigate to `http://localhost:8080`. Use the following default credentials to log in:

- Username: `airflow`
- Password: `airflow`

For accessing the monitoring tool(control center), open your web browser and navigate to `http://localhost:9092`.

## Help

Sometimes, some services are not running. You can use the following steps to troubleshoot:

1. Click "Run" in Docker Desktop for each service.
2. Check the logs for any errors.
3. Restart the services if necessary.

## Authors

1. Kritsada Ruangthawee

   - GitHub: [kritsada-r](https://github.com/copter50029)

2. Naphat Soontronwnalop

   - GitHub: [naphat-s](https://github.com/MrLonely1423)

3. Teetat Lertsaksereekul

   - GitHub: [teetat-l](https://github.com/teethut)

4. Lee-Anne Junio

   - GitHub: [lee-anne-j](https://github.com/L33by)

5. Kraipich Thanasitvekin
   - GitHub: [kraipich-t](
