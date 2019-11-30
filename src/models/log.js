function Log(number, containerId, timeLogged, source, log) {
    this.number = number;
    this.containerId = containerId;
    this.timeLogged = timeLogged;
    this.source = source;
    this.log = log;
}

module.exports = Log;