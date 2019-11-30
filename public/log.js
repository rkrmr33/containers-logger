'use strict';

let dataStream = undefined;

window.onload = function () {
    const containerId = document.getElementById('containerId').innerText;
    const isLogging = document.getElementById('loggingIndicator');

    // listen for changes
    isLogging.addEventListener('click', e => {
        if (isLogging.checked) {
            startLogging(containerId);
        } else {
            stopLogging();
        }
    });

    // check if need to connect to stream
    if (isLogging.checked) {
        console.log("reareraeraer");
        startLogging(containerId);
    }
}

function startLogging(id) {
    const logTable = document.getElementById('logTable');
    dataStream = new EventSource(`/api/container/${id}/logs`);
    
    dataStream.onopen = e => console.log('connected to stream');
    dataStream.onerror = e => {
        console.log(e);
        dataStream.close();
    }

    dataStream.addEventListener(id, event => {
        const log = JSON.parse(event.data);

        logTable.innerHTML = 
            '<tr>' +
                '<td class="number">' + log.number + '</td>' +
                '<td class="time-logged">' + log.timeLogged + '</td>' +
                '<td class="source">' + log.source + '</td>' +
                '<td class="left aligned log">' + log.log + '</td>' +
            '</tr>' + logTable.innerHTML;
    });
}

function stopLogging() {
    if (dataStream) {
        dataStream.close();
        dataStream = undefined;
    }
}