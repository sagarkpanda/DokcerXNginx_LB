<h1> Load Balacing Python (flask) application using NGINX </h1>

<b> Full article on : </b> </br><a href = "https://medium.com/@sagarkrp/how-to-configure-nginx-to-load-balance-multiple-servers-nginx-docker-compose-c8e1d746f02b" target ="_blank"><img src = "https://img.shields.io/badge/medium-%23E4405G.svg?&style=for-the-badge&logo=medium&logoColor=black&white"></a>

Prerequisite:

    Docker and Docker compose.

Dockerfile:
------------

```
# using alpine varinat of python image
FROM python:alpine3.17

# define working directory
WORKDIR /flaskapp

# copy everything to working directory
COPY . .

# intstall required python packes (flask and gunicorn for this example)
RUN pip install -r requirements.txt

# start application with guincorn
CMD gunicorn --bind 0.0.0.0:3000 hello:app
```

nginx.conf:
-----------
```
nginx.conf:

events{
    worker_connections 100;
}

http{

server{
    listen 80;

    location /{
        proxy_pass http://flaskapp:3000/;
    }
}
}

```

In this example, we don’t need local nginx instance, and its better to stop nginx if its running on your host since in this example we are exposing nginx on 80, it will conflict otherwise.

Here the proxy_pass transfers the request to flaskapp:3000 which is our python application.

docker-compose.yaml:
------------------

```
version: '3'

services:
    flaskapp:
      build:
          context: app
      ports:
        - "3000"
    nginx:
        image: nginx:1.24.0
        volumes:
          - ./nginx.conf:/etc/nginx/nginx.conf
        depends_on:
            - flaskapp
        ports:
          - "80:80"
```

Lets create the containers (more than 1 to see load balancing

```
docker compose up -d --scale flaskapp=3
```

This launches 3 instances of the “flaskapp” container and a nginx container.

Check all the running containers with docker ps:

```
$ docker ps

CONTAINER ID   IMAGE               COMMAND                  CREATED              STATUS              PORTS                                         NAMES
3479b1e2e677   nginx:1.24.0        "/docker-entrypoint.…"   About a minute ago   Up About a minute   0.0.0.0:80->80/tcp, :::80->80/tcp             flaskapp-nginx-1
64f5725ab5b8   flaskapp-flaskapp   "/bin/sh -c 'gunicor…"   About a minute ago   Up About a minute   0.0.0.0:32773->3000/tcp, :::32773->3000/tcp   flaskapp-flaskapp-1
41ff26ba1ff8   flaskapp-flaskapp   "/bin/sh -c 'gunicor…"   About a minute ago   Up About a minute   0.0.0.0:32774->3000/tcp, :::32774->3000/tcp   flaskapp-flaskapp-2
1e201d31fbb7   flaskapp-flaskapp   "/bin/sh -c 'gunicor…"   About a minute ago   Up About a minute   0.0.0.0:32775->3000/tcp, :::32775->3000
```

Time to browse our application. </br>
Every refresh shows different hostnames from the above list of container IDs (Except the first one, since its Nginx container). Round Robin is the default lb algorithm.

![pylb](https://user-images.githubusercontent.com/42873729/233832356-bca161a6-300f-4918-8410-5cd100d6d0ef.gif)
