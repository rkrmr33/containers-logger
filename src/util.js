'use strict';
const Docker = require('dockerode');
const streams = require('stream');

const storage = require('./storage/mongo_storage');
const Log = require('./models/log');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const attachedContainers = new Map();

const shortId = (id) => id.substring(0, 12);

module.exports.getAllContainers = () => {
    return docker.listContainers({ all: true })
        .then(containers => containers.map(container => {
                return {
                    id: container.Id,
                    image: container.Image,
                    state: container.State,
                    status: container.Status,
                    names: container.Names,
                    logging: attachedContainers.has(shortId(container.Id))
                };
            })
        )
}

module.exports.getContainer = (id) => {
    const container = docker.getContainer(id);
    
    return container.inspect()
        .then(_container => {
        return {
            id: _container.Id,
            image: _container.Config.Image,
            state: _container.State.Status,
            status: undefined,
            names: [ _container.Name ],
            logging: attachedContainers.has(shortId(_container.Id))
        };
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
                console.log('[-] could not store to db: ' + exception);
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

        console.log('attached to container');

        attachedContainers.set(shortId(container.id), stream);
    });
}

module.exports.detachFromContainer = (id) => {
    console.log('detached container:' + id);

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
            .then(logs => { 
                return { container, logs };
            })
        );
};
