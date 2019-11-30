'use strict';
const mongoose = require('mongoose');

const conf = require('../config');

mongoose.connect(conf.DB_CONN_STR, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('[+] connected to db'); // TODO: remove
    })
    .catch(exception => {
        console.log(exception);
    });

// Log model
const logSchema = new mongoose.Schema({
    containerId: { type: String },
    timeLogged:  { type: Date, default: Date.now },
    source:      { type: String },
    log:         { type: String }
});
const Log = mongoose.model('Log', logSchema);

module.exports.newLog = (log) => {
    const logModel = new Log({
        containerId: log.containerId,
        timeLogged: log.timeLogged,
        source: log.source,
        log: log.log
    });

    return logModel.save();
};

module.exports.getContainer = (id) => {
    return Container.findOne({ id });
}

module.exports.getLogs = (containerId) => {
    return Log.find({ containerId });
}