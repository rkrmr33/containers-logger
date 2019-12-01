'use strict';
const express = require('express');

const util = require('./util');
const conf = require('./config');
const apiRouter = require('./api');

const server = express();

// middleware
server.use(express.static('public'));
server.use(apiRouter);
server.set('view engine', 'ejs');

// main page
server.get('/', (req, res) => {
    util.getAllContainers()
    .then(containers => {
        res.render('index', { containers });
    })
    .catch(exception => {
        res.redirect('/docker_conn_err');
    });
});

// container page
server.get('/container/:id', (req, res) => {
    util.getContainerAndLogs(req.params.id)
    .then((args) => {
        const container = args.container;
        const logs = args.logs;
        
        if (!container || !logs) {
            res.redirect('/404');
        }

        res.render('log', { container, logs });
    })
    .catch(exception => {
        console.error(exception);
        res.redirect('/404');
    });
});

// 404 page
server.get('/404', (req, res) => {
    res.render('404');
});

// docker connection error page
server.get('/docker_conn_err', (req, res) => {
    res.render('docker_err');
});

server.listen(conf.PORT, conf.HOST, () => {
    console.info(`[+] server running on: ${conf.HOST}:${conf.PORT}`);
});
