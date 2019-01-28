function sendPostRequest(url, formData, resolve = null, reject = null, headers = {}, responseType = 'text') {
    let xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);
    xhr.withCredentials = true;
    xhr.responseType = responseType;

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
        console.log(req.status);
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

function clickLink(link) {
    let clickEvent = new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
    });

    link.dispatchEvent(clickEvent);
}

function jsonForm(formName) {
    return JSON.stringify(convertFormToJson(new FormData(document.forms[formName])));
}

function savePayment(address, paymentType, event) {
    event.preventDefault();

    let formData = jsonForm(paymentType);

    console.log(formData);
    if ($(`form[name=${paymentType}] input:invalid`).length !== 0) {
        console.log('Form is invalid');
        return;
    }

    sendPostRequest(address, formData,
        function (res) {
            addAlert($('body'),
                '<div class="alert alert-success" role="alert">\n' +
                '  Оплата прошла успешно' +
                '</div>'
            );
            console.log(res);
        }, function (error) {
            addAlert($('body'),
                '<div class="alert alert-danger" role="alert">\n' +
                '  Что-то пошло не так!' +
                '</div>'
            );
            console.log(error);
        }, {'Accept': 'application/json', 'Content-Type': 'application/json'});
}
