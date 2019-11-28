'use strict';

const express = require('express');
const PORT = 8888;
const HOST = '0.0.0.0';

const server = express();

server.get('/', (req, res) => {
    res.send('hello, world!\n');
});

server.listen(PORT, HOST);

console.log(`[+] server running on: ${HOST}:${PORT}`);