import pytest

#start docker compose before running tests
@pytest.fixture(scope="session", autouse=True)
def setup_docker_compose():
    import subprocess
    import time

    # Start docker compose
    subprocess.run(["docker-compose", "up", "-d"], check=True)

    # Wait for services to be ready (you may need to adjust the sleep time) 2:40 minutes
    time.sleep(160) 
    
    # activate airflow dags (done) # docker exec docker-airflow-apiserver-1 airflow dags unpause spark_stream
    subprocess.run([
        "docker", "exec", "docker-airflow-apiserver-1",
        "airflow", "dags", "unpause", "spark_stream"
    ], check=True) 
    
    # run pySparkNB notebook first 3 cell only
    # docker exec -it spark-master spark-submit --master spark://spark-master:7077 /home/jovyan/work/prediction_job.py
    subprocess.run([
        "docker", "exec", "spark-master",
        "spark-submit", "--master", "spark://spark-master:7077",
        "/home/jovyan/work/prediction_job.py"
    ], check=True)
    

    yield  # This will be the point where tests are run

    # Teardown docker compose
    subprocess.run(["docker-compose", "down"], check=True)
    
