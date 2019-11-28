'use strict';

const express = require('express');
const Docker = require('dockerode');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const conf = require('./config');

const server = express();

server.use(express.static('static'));
server.set('view engine', 'ejs');

server.get('/', (req, res) => {
    docker.listContainers({ all: true })
        .then(containers => {
            res.render('index', { containers });
        });
});

server.listen(conf.PORT, conf.HOST, () => {
    console.log(`[+] server running on: ${conf.HOST}:${conf.PORT}`);
});
