FROM python:alpine3.17
WORKDIR /flaskapp
COPY . .
RUN pip install -r requirements.txt
CMD gunicorn --bind 0.0.0.0:3000 hello:app
