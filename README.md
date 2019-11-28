# containers-logger

1. verify that the docker daemon process is running on your machine by running:
```
docker info
```

2. start the app server by running:
```
docker build -t containers-logger .
docker run -p 8888:8888 -d --rm containers-logger
```

3. open your browser and go to: http://localhost:8888/

4. interact with the containers logger application.