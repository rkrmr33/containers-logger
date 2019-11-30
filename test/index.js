'use strict';
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock'});
const streams = require('stream');

const attachedContainers = new Map();

var outStream = new streams.PassThrough();
    outStream.on('data', function(chunk){
        if (chunk.toString() !== '') {
            console.log('[out] ' + chunk.toString('utf8'));
        }
});

var errStream = new streams.PassThrough();
    errStream.on('data', function(chunk) {
        if (chunk.toString() !== '') {
            console.log('[err] ' + chunk.toString('utf8'));
        }
    });

const container = docker.getContainer('8288100fdb18');

console.log(container);

const attachToContainer = container => {
    container.attach({ stream: true, stdout: true, stderr: true })
        .then(stream => {
            console.log('reached');
            container.modem.demuxStream(stream, outStream, errStream);

            stream.on('end', () => {
                outStream.end('');
                errStream.end('');
            });

            attachedContainers.set(container.Id, stream);
        })
        .catch(exception => console.log(exception));
};

const detachFromContainer = container => {
    attachedContainers.get(container.Id).destroy();
};

attachToContainer(container);



setTimeout(() => {
    console.log(attachedContainers);
}, 5000);


setTimeout(() => {
    detachFromContainer(container);
    console.log('test done!');
}, 10000);