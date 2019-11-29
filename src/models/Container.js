'use strict';
const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
    id:      { type: String },
    image:   { type: String },
    state:   { type: String },
    status:  { type: String },
    names:   { type: String },
    logging: { type: Boolean } 
});

const Container = mongoose.model('Container', containerSchema);

module.exports = Container;