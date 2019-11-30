'use strict';

let dataStream = undefined;
let counter = 0;
let scrollTarget = undefined;

window.onload = function () {
    scrollTarget = document.getElementById('scrollTarget');
    const containerId = document.getElementById('containerId').innerText;
    const isLogging = document.getElementById('loggingIndicator');
    counter = document.getElementById('counter').innerHTML;

    scrollDown(scrollTarget);

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
        startLogging(containerId);
    }
}

function startLogging(id) {
    const logTable = document.getElementById('logTable');
    dataStream = new EventSource(`/api/container/${id}/logs`);
    
    dataStream.onerror = e => {
        console.log(e);
        dataStream.close();
    }

    dataStream.addEventListener(id, event => {
        const log = JSON.parse(event.data);

        logTable.innerHTML += 
            '<tr>' +
                '<td class="number">' + (++counter) + '</td>' +
                '<td class="time-logged">' + log.timeLogged + '</td>' +
                '<td class="source">' + log.source + '</td>' +
                '<td class="left aligned log">' + log.log + '</td>' +
            '</tr>';

        scrollDown(scrollTarget);
    });
}

function stopLogging() {
    if (dataStream) {
        dataStream.close();
        dataStream = undefined;
    }
}

function scrollDown(scrollTarget) {
    if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: 'smooth' });
    }
}