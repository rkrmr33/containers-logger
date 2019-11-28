'use strict';
const Docker = require('dockerode');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const getAllContainers = () => docker.listContainers({ all: true });

const getContainer = (id) => {
    const container = docker.getContainer(id);
    
    return container.inspect().then(_container => {
            console.log(_container);
        return {
            Id: _container.Id,
            Image: _container.Config.Image,
            State: _container.State.Status,
            Status: undefined,
            Names: [ _container.Name ]
        };
    });
};

module.exports = { getContainer, getAllContainers };