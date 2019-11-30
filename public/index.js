'use strict';

const loggingClicked = (e, id) => {
    const containerIdCell = document.getElementById(id);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (4 === xhr.readyState && 200 === xhr.status) {
            console.log("request succeeded!");
        } else {
            console.log("request failed!");
        }
    }    

    if (e.checked) {
        // ask to start logging
        xhr.open('POST', `/api/container/${id}/logs`);
    } else {
        // ask to stop logging
        xhr.open('DELETE', `/api/container/${id}/logs`);
    }

    xhr.send(null);
};