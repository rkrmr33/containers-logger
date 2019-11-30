'use strict';
const mongoose = require('mongoose');

const conf = require('../config');

// connect to mongo
mongoose.connect(conf.DB_CONN_STR, { 
    connectTimeoutMS:1000, 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
    })
    .then(() => {
        console.info('[+] connected to db');
    })
    .catch(exception => {
        console.error(exception);
    });

// Log model
const logSchema = new mongoose.Schema({
    containerId: { type: String, index: true },
    timeLogged:  { type: Date, default: Date.now },
    source:      { type: String },
    log:         { type: String }
});
const Log = mongoose.model('Log', logSchema);

module.exports.newLog = (log) => {
    const logModel = new Log({
        containerId: log.containerId,
        source: log.source,
        log: log.log
    });

    return logModel.save();
};

module.exports.getLogs = (containerId) => {
    let promisePending = true;
    const promise = new Promise((resolve, reject) => {
        // there is a problem with the mongoose timeout, so that's plan b.
        setTimeout(() => {
            if (promisePending) {
                reject(new Error('db timeout'));
            }
        }, 3000);
        
        Log.find({ containerId }).wtimeout(3000).exec((err, data) => {
            if (promisePending) {
                if (err) {
                    reject(err);
                }
                resolve(data);
                promisePending = false;
            }
        });
    });

    return promise;
};