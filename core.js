function sendPostRequest(url, formData, resolve = null, reject = null) {
    let xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        handleRequest(this, resolve, reject)
    };

    xhr.send(formData);
}

function sendGetRequest(url, resolve = null, reject = null) {
    let xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        handleRequest(this, resolve, reject)
    };

    xhr.send();
}

function handleRequest(req, resolve = null, reject = null) {
    if (req.readyState !== 4) return;

    if (req.status !== 200) {
        if (reject != null) {
            reject();
        }
        return;
    }

    if (resolve != null) {
        resolve(req.responseText);
    }
}
