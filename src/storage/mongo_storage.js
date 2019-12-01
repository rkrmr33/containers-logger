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

// Container model
const containerSchema = new mongoose.Schema({
    id: { type: String },
    image:       { type: String },
    names:       { type: [String] }
});
const Container = mongoose.model('Container', containerSchema);

module.exports.newLoggedContainer = (container) => {
    const containerModel = new Container({
        id: container.id,
        image: container.image,
        names: container.names
    });

    const promise = new Promise((resolve, reject) => {
        setQueryTimeout(reject, 3000);

        // create container doc if does not exist
        Container.findOne({ id: container.id}, (err, container) => {
            if (err) {
                reject(err);
            }

            if (container) {
                resolve(container);
            } else {
                containerModel.save()
                .then(result => resolve(result))
                .catch(exception => reject(exception));
            }
        });
    });

    return promise;
}

module.exports.getAllContainers = () => {
    const promise = new Promise((resolve, reject) => {
        let allContainers = {};
        setQueryTimeout(reject, 3000);

        Container.find({ }, (err, containers) => {
            if (err) {
                reject(err);
            }

            if (containers) { 
                containers.forEach(container => {
                    allContainers[container.id] = container;
                });
            }
            
            resolve(allContainers);
        });
    });

    return promise;
};

module.exports.getContainer = (id) => {
    const promise = new Promise((resolve, reject) => {
        setQueryTimeout(reject, 3000);

        Container.findOne({ id }, (err, container) => {

            if (err) {
                reject(err);
            }

            resolve(container);
        });
    });

    return promise;
};

module.exports.newLog = (log) => {
    const logModel = new Log({
        containerId: log.containerId,
        source: log.source,
        log: log.log
    });

    return logModel.save();
};

module.exports.getLogs = (containerId) => {
    const promise = new Promise((resolve, reject) => {
        setQueryTimeout(reject, 3000);

        Log.find({ containerId }).wtimeout(3000).exec((err, data) => {
            if (err) {
                reject(err);
            }

            resolve(data);            
        });
    });

    return promise;
};

// there is a problem with the mongoose timeout, so that's plan b.
const setQueryTimeout = (reject, timeout) => {
    setTimeout(() => {
        reject(new Error('db timeout'));
    }, timeout);
};