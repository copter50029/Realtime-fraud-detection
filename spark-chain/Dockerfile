FROM jupyter/pyspark-notebook:latest

COPY requirements.txt /
COPY pySparkNb.ipynb /home/jovyan
RUN pip install --no-cache-dir -r /requirements.txt
