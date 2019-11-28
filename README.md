# containers-logger

1. verify that the docker daemon process is running on your machine by running:
```
docker info
```

2. start the app by running:
```
docker build -t container-logger .
docker run -p 8888:8888 -d container-logger

```