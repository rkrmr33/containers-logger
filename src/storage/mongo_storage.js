'use strict';
const mongoose = require('mongoose');

const conf = require('../config');

mongoose.connect(conf.DB_CONN_STR, { 
    connectTimeoutMS:1000, 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
    })
    .then(() => {
        console.log('[+] connected to db'); // TODO: remove
    })
    .catch(exception => {
        console.log(exception);
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

    console.log('reached');

    return logModel.save({ wtimeout: 1000 });
};

module.exports.getContainer = (id) => {
    return Container.findOne({ id });
}

module.exports.getLogs = (containerId) => {
    return new Promise((resolve, reject) => {
        console.log('reached');
        Log.find({ containerId }).wtimeout(1000).exec((err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
};