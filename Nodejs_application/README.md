
<h1> Load Balacing Nodejs application using NGINX </h1>


<b> Full article on : </b> </br><a href = "https://medium.com/@sagarkrp/how-to-configure-nginx-to-load-balance-multiple-servers-nginx-docker-compose-c8e1d746f02b" target ="_blank"><img src = "https://img.shields.io/badge/medium-%23E4405G.svg?&style=for-the-badge&logo=medium&logoColor=black&white"></a>

Prerequisite:

    Docker
    Nginx

<h2> Install Nginx and nodejs, use the command below: </h2>

``` 
sudo apt update && sudo apt install nginx -y
sudo apt install nodejs 
```

Nodejs is required only to run the application locally. You can skip if you want.

Building our application:

The server.js in our main application that runs on port 2000 and when its run it prints the hostname.

To run the application locally, you can use “npm run start”.
Build and run the container:

Since we need to see Load Balancing same application, we need to create multiple instances of the app.

But we’ll use Docker to spin up 3 servers in and our application will transfer request to all servers and we should see hostname changing with each request we make (the default laod balancing algorithm is Round Robin).

Dockerfile:
------------

```
# Using node image as base
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
RUN npm i express
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 2000
CMD [ "npm", "run", "start"]

```

To Build the docker images and run use the below commands:

``` docker build -t nlb:1.0 .
docker run -d -p 2000:2000 nlb:1.0
```

Lets run more containers in different ports.

```
┌──[13:54:13]─[0]─[labputer:~/Documents/Docker/Nginx_LB]
└──| docker run -d -p 3000:2000 nlb:1.0
927e3765aeee5d2615f0375f6ede30902d0ac9600de8085fac6400ae437a83e1
┌──[13:54:16]─[0]─[labputer:~/Documents/Docker/Nginx_LB]
└──| docker run -d -p 4000:2000 nlb:1.0
f75486b51aabe02337082e0f7c1b025631f43c60aeb9a4b723592687c9d73dff

```

Now browse the ip or url with port 2000,3000 and 4000. We should see a response with hostname.

Note: The hostname here are the IDs of docker containers.

But wait, that’s nothing exiting, we don’t have any load balancing. That’s right, we’ll setup nginx to act as a load balancer to the 3 containers and we should be able to see varying hostname changes with single ip (the default load balancing algorithm is Round Robin).

To configure nginx as load balancer, we must edit the nginx.conf file under /etc/nginx. We need to http black here like below:

```

http {

       upstream beservers{
               server 127.0.0.1:2000;
               server 127.0.0.1:3000;
               server 127.0.0.1:4000;
       }
       
```  

Note: the “besevers” is just an identification that we’ll use in our virtual host configuration.

Now all the requests coming from all these different servers (ports in this example) will be transferred to “beserver”, but what is this name how does it forward the request. For that we’ll be using proxy pass.

Add the following block to the default site or create a new site.

```
location / {
                proxy_pass http://beservers/;
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }
 ```

I m going to create a new site under /etc/nginx/sites-available called example.com (can be any name). And create a symlink to sites-enabled.

#example.com

```
server {
        listen 80;
        server_name example.com #this is your website url
        root /usr/share/nginx/html;
        try_files index.html =404;

        location / {
        proxy_pass http://beservers/;

        }
}

```
```
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/

```

Now, lets browse our application. Now, lets browse our application. 
These hostnames are coming from Docker containers. use “docker ps” to verify their IDs with the ones from here.

![node](https://user-images.githubusercontent.com/42873729/233830893-49a43588-1c13-4c2b-9fe8-5bfc0b93c488.gif)

