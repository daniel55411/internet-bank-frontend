function sendPostRequest(url, formData, resolve = null, reject = null, headers={}) {
    let xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);
    xhr.withCredentials = true;

    for (let key in headers) {
        if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
        }
    }

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
            reject(req.response);
        }
        return;
    }

    if (resolve != null) {
        resolve(req.response);
    }
}

function addAlert(el, html) {
    let newElement = createElementFromHTML(html);
    el.prepend(newElement);

    setTimeout(function () {
        newElement.parentNode.removeChild(newElement);
    }, 3000)
}

//https://stackoverflow.com/a/494348
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

function convertFormToJson(form) {
    if (form instanceof FormData) {
        let object = {};

        form.forEach((value, key) => object[key] = value);

        return object;
    }
}
