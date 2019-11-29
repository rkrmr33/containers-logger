'use strict';

const express = require('express');

const util = require('./util');
const conf = require('./config');

const server = express();

server.use(express.static('static'));
server.set('view engine', 'ejs');

// main page
server.get('/', (req, res) => {
    util.getAllContainers()
        .then(containers => {
            res.render('index', { containers });
        });
});

// container page
server.get('/container/:id', (req, res) => {
    util.getContainer(req.params.id)
        .then(container => {
            // console.log(container);
            res.render('log', { container });
        })
        .catch(exception => {
            res.render('')
        });
});

server.listen(conf.PORT, conf.HOST, () => {
    console.log(`[+] server running on: ${conf.HOST}:${conf.PORT}`);
});
