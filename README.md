# containers-logger

1. verify that the docker daemon process is running on your machine by running:
```
docker info
```

2. start the app server by running inside the cloned directory:
```
cd containers-logger
docker-compose -d
```

3. open your browser and go to: http://localhost:8888/

4. interact with the containers logger application.

5. to stop the application run:
```
docker-compose stop
```