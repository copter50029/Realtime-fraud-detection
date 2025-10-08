FROM apache/airflow:3.1.0
COPY requirements.txt /
RUN pip install --no-cache-dir -r /requirements.txt

# HEALTHCHECK CMD curl --fail http://localhost:8080/health || exit 1

# RUN useradd -m airflowuser
# USER airflowuser
