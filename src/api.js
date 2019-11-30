'use strict';
const Router = require('express').Router;
const EventEmitter = require('events').EventEmitter;

const util = require('./util');

const router = new Router();

const logsEmitter = new EventEmitter();

// connect to live log stream
router.get('/api/container/:id/logs', (req, res) => {
    const id = req.params.id;
    
    res.writeHead(200, {
        Connection: 'keep-alive',
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    });

    logsEmitter.addListener(id, (log) => {
        res.write(`event: ${id}\n`);
        res.write(`data: ${JSON.stringify(log)}`);
        res.write('\n\n');
    })

    res.write('retry: 1000\n\n');
});

router.post('/api/container/:id/logs', (req, res) => {
    const id = req.params.id;
    try {
        util.attachToContainer(id, handleStdout, handleStderr);
        res.status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send(`could not attach to container: ${id}`);
    }
});

router.delete('/api/container/:id/logs', (req, res) => {
    const id = req.params.id;
    try {
        util.detachFromContainer(id);
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
    }
});

const handleStdout = (log) => {
    logsEmitter.emit(log.containerId, log);
}

const handleStderr = (log) => {
    logsEmitter.emit(log.containerId, log);
}

module.exports = router;