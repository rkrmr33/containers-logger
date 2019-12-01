'use strict';
const Docker = require('dockerode');
const streams = require('stream');

const storage = require('./storage/mongo_storage');
const Log = require('./models/log');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const attachedContainers = new Map();

const shortId = (id) => id.substring(0, 12);

module.exports.getAllContainers = () => {
    return storage.getAllContainers()
        .then(storedContainers => docker.listContainers({ all: true })
            .then(liveContainers => {
                let allContainers = storedContainers;
                
                liveContainers.forEach(container => {
                    const id = shortId(container.Id);
                    allContainers[id] = {
                            id: id,
                            image: container.Image,
                            state: container.State,
                            status: container.Status,
                            names: container.Names,
                            logging: attachedContainers.has(id)
                        };
                });
                
                return allContainers;
            })
            .catch(exception => {
                console.error('[-] could get containers from dockerd: ' + exception);
            })
        )
        .catch(exception => {
            console.error('[-] could get containers from db: ' + exception);
        });
}

module.exports.getContainer = (id) => {
    const container = docker.getContainer(id);
    
    return container.inspect()
        .then(_container => {
            const id = shortId(_container.Id);
            
            return {
                id: id,
                image: _container.Config.Image,
                state: _container.State.Status,
                status: undefined,
                names: [ _container.Name ],
                logging: attachedContainers.has(id)
            };
        })
        .catch(exception => {
            // container was removed, look for it in storage
            return storage.getContainer(id);
        });
};

const processLog = (containerId, source, data, cb) => {
    data = data.toString().trim();

    if (data !== '') {
        const log = new Log(containerId, null, source, data);
        storage.newLog(log)
            .then(doc => {
                cb(doc);
            })
            .catch(exception => {
                console.error('[-] could not store to db: ' + exception);
            });
    }
}

module.exports.attachToContainer = (id, stdoutCB, stderrCB) => {
    const container = docker.getContainer(id);
    
    container.attach({ stream: true, stdout: true, stderr: true })
    .then(stream => {
        const outStream = new streams.PassThrough();
        outStream.on('data', data => processLog(id, 'stdout', data, stdoutCB));

        const errStream = new streams.PassThrough();
        errStream.on('data', data => processLog(id, 'stderr', data, stderrCB));

        container.modem.demuxStream(stream, outStream, errStream);

        stream.on('end', () => {
            outStream.end();
            errStream.end();
        });

        attachedContainers.set(shortId(container.id), stream);
        
        // add logged container to storage
        this.getContainer(id)
        .then(_container => {
            storage.newLoggedContainer(_container);
        })
        .catch(exception => {
            console.error('[-] could not store to db: ' + exception);
        });
    });
}

module.exports.detachFromContainer = (id) => {
    const stream = attachedContainers.get(id);
    if (!stream) {
        throw new Error('container was not logged before');
    } else {
        stream.destroy();
        attachedContainers.delete(id);
    }
};

module.exports.getContainerAndLogs = (id) => {
    return this.getContainer(id)
        .then(container => storage.getLogs(id)
            .then(logs => ({ container, logs }))
        )
        .catch(exception => console.error('[-] container was not found: ' + id));
};
