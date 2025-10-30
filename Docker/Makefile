packages=org.apache.spark:spark-streaming-kafka-0-10_2.12:3.5.0,org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0

build:
	docker compose build

build-yarn:
	docker compose -f docker-compose.yarn.yml build

build-yarn-nc:
	docker compose -f docker-compose.yarn.yml build --no-cache

build-nc:
	docker compose build --no-cache

build-progress:
	docker compose build --no-cache --progress=plain

down:
	docker compose down --volumes --remove-orphans

down-yarn:
	docker compose -f docker-compose.yarn.yml down --volumes --remove-orphans

run:
	make down && docker compose up

run-scaled:
	make down && docker compose up --scale spark-worker=3

run-d:
	make down && docker compose up -d

run-yarn:
	make down-yarn && docker compose -f docker-compose.yarn.yml up

run-yarn-scaled:
	make down-yarn && docker compose -f docker-compose.yarn.yml up --scale spark-yarn-worker=3

stop:
	docker compose stop

stop-yarn:
	docker compose -f docker-compose.yarn.yml stop


submit:
	docker exec da-spark-master spark-submit --master spark://spark-master:7077 --deploy-mode client ./apps/$(app)

submit-da-book:
	make submit app=data_analysis_book/$(app)

submit-yarn-test:
	docker exec da-spark-yarn-master spark-submit --master yarn --deploy-mode cluster ./examples/src/main/python/pi.py

submit-yarn-cluster:
	docker exec da-spark-yarn-master spark-submit --master yarn --deploy-mode cluster ./apps/$(app)

rm-results:
	rm -r book_data/results/*

submit-test:
	docker exec da-spark-master spark-submit --master spark://spark-master:7077 apps/test.py

Submit_ML:
	docker exec da-spark-master spark-submit --master spark://spark-master:7077 --packages \
	org.apache.spark:spark-streaming-kafka-0-10_2.13:4.0.0,\
	org.apache.spark:spark-sql-kafka-0-10_2.13:4.0.0 \
	apps/spark-ml.py

turn-on-dag:
	docker exec docker-airflow-apiserver-1 airflow dags unpause spark_stream