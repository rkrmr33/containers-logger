function Log(containerId, timeLogged, source, log) {
    this.containerId = containerId;
    this.timeLogged = timeLogged;
    this.source = source;
    this.log = log;
}

module.exports = Log;