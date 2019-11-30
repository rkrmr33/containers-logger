'use strict';
const Router = require('express').Router;
const EventEmitter = require('events').EventEmitter;

const util = require('./util');

const router = new Router();

const logsEmitter = new EventEmitter();

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
        console.log(e);
        res.sendStatus(500);
    }
});

router.delete('/api/container/:id/logs', (req, res) => {
    const id = req.params.id;
    try {
        util.detachFromContainer(id);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

const handleStdout = (log) => {
    log = log.toString().trim();

    if (log !== '') {
        console.log(`[stdout]: ${log}`);
    }
}

const handleStderr = (log) => {
    log = log.toString().trim();

    if (log !== '') {
        console.log(`[stderr]: ${log}`);
    }
}

// const Log = require('./models/log');

// for (let i = 1; i < 100; ++i) {
//     setTimeout(() => {
//         console.log('emitting: 8288100fdb18');
//         logsEmitter.emit('8288100fdb18', new Log(1, 1231231, new Date().toUTCString(), 'stdout', 'hello world'));
//     }, 1000 * i);
// }

module.exports = router;