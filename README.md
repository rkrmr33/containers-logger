# containers-logger

1. verify that the docker daemon process is running on your machine by running:
```
docker info
```

2. verify that you have docker-compose by running:
```
docker-compose version
```

3. start the app server by running inside the cloned directory:
```
cd containers-logger
sudo docker-compose up --build
```

4. after the application finished loading open your browser and go to: http://localhost:8888/

5. interact with the containers logger application

6. to stop the application run:
```
sudo docker-compose down
```

# Usage:
The main screen shows all of the docker containers on your machine that are in states:
1. Running
2. Created
3. Exited
4. Paused
5. Restarting
6. Dead

To start tracking a container you can click on the checkbox in the 'Logging' column.

To go the a containers log screen you can click on its id or go to: http://localhost:8888/container/[containerID]

If you were tracking a container and the container was removed (by using ```docker container rm [id]``` for example), it would show up as 'removed' and its logs would remain reachable.
If a container was removed before it was tracked it would not show up on the main screen and would not be reachable.

In the log screen you can go through all of the containers tracked logs and also download them as a .csv file by clicking on the download button next to the 'Log' column.
