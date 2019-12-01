'use strict';
const Router = require('express').Router;
const EventEmitter = require('events').EventEmitter;
const csvParser = require('json2csv').Parser;

const util = require('./util');

const router = new Router();

const logsEmitter = new EventEmitter();

// connect to live log stream
router.get('/api/container/:id/logs/stream', (req, res) => {
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

router.get('/api/container/:id/logs', (req, res) => {
    const id = req.params.id;

    util.getContainerAndLogs(id)
    .then((args) => {
        const container = args.container;
        const logs = args.logs;
        
        if (!container || !logs) {
            res.status(404).send('container not found');
        }

        res.send(logs);
    })
    .catch(exception => {
        console.error(exception);
        res.status(500).send('could not get logs');
    });
});

router.get('/api/container/:id/logs.csv', (req, res) => {
    const id = req.params.id;

    util.getContainerAndLogs(id)
    .then((args) => {
        const container = args.container;
        let logs = args.logs;
        
        if (!container || !logs) {
            res.status(404).send('container not found');
        }

        const csv = parseLogsToCSV(logs);
        if (csv) {
            res.send(csv);
        } else {
            res.status(500).send('could not create csv');
        }
    })
    .catch(exception => {
        console.error(exception);
        res.status(500).send('could not get logs');
    });
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

const parseLogsToCSV = (logs) => {
    // add index to logs
    let i = 1;
    logs = logs.map(log => {
        log['No.'] = i++;
        
        return log;
    });

    const fields = ['No.', 'containerId', 'timeLogged', 'source', 'log'];
    const opts = { fields };

    try {
        const parser = new csvParser(opts);
        const csv = parser.parse(logs);

        return csv;
    } catch (exception) {
        console.error(exception);
    }
};

module.exports = router;