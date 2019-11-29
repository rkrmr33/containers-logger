'use strict';
const Router = require('express').Router;
const router = new Router();

router.get('/roi', (req, res) => {
    res.send('hello world');
});

module.exports = router;