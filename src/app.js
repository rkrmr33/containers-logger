'use strict';
const express = require('express');

const util = require('./util');
const conf = require('./config');
const apiRouter = require('./api');

const storage = require('./storage/mongo_storage');

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
        });
});

// container page
server.get('/container/:id', (req, res) => {
    util.getContainerAndLogs(req.params.id)
        .then((args) => {
            const container = args.container;
            const logs = args.logs;
            if (!container) {
                res.redirect('/404');
            }

            res.render('log', { container, logs });
        })
        .catch(exception => {
            console.log(exception);
            res.redirect('/404');
        });
});

server.get('/404', (req, res) => {
    res.render('404');
});

server.listen(conf.PORT, conf.HOST, () => {
    console.log(`[+] server running on: ${conf.HOST}:${conf.PORT}`);
});
