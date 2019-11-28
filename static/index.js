const loggingClicked = (e, id) => {
    const containerIdCell = document.getElementById(id);

    if (e.checked) { // logging is on
        containerIdCell.innerHTML = '<a href="/container/' + id + '">' + id + '</a>';
    } else {
        containerIdCell.innerHTML = id;
    }
};