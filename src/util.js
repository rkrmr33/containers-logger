'use strict';
const Docker = require('dockerode');
const storage = require('./storage/mongo_storage');
const streams = require('stream');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const attachedContainers = new Map();

const shortId = (id) => id.substring(0, 12);

module.exports.getAllContainers = () => {
    return docker.listContainers({ all: true })
        .then(containers => {
            return containers.map(container => {
                console.log(container);
                return {
                    id: container.Id,
                    image: container.Image,
                    state: container.State,
                    status: container.Status,
                    names: container.Names,
                    logging: attachedContainers.has(shortId(container.Id))
                };
            });
        })
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

module.exports.attachToContainer = (id, stdoutCB, stderrCB) => {
    const container = docker.getContainer(id);
    
    container.attach({ stream: true, stdout: true, stderr: true })
    .then(stream => {
        const outStream = new streams.PassThrough();
        outStream.on('data', stdoutCB);

        const errStream = new streams.PassThrough();
        errStream.on('data', stderrCB);

        container.modem.demuxStream(stream, outStream, errStream);

        stream.on('end', () => {
            outStream.end('');
            errStream.end('');
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

