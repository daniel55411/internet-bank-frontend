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

function addAlert(modalId) {
    $(modalId).modal('show');

    setTimeout(function () {
        $(modalId).modal('hide');
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
            addAlert('#alert-success');
            console.log(res);
        }, function (error) {
            addAlert('#alert-dangerous');
            console.log(error);
        }, {'Accept': 'application/json', 'Content-Type': 'application/json'});
}

function getCriteria(type) {
    let sortOrder = $(`#${type}-sort-order`).val(),
        sortField = $(`#${type}-sort-field`).val(),
        size = $(`#${type}-size`).val();

    return `?sort-order=${sortOrder}&sort-field=${sortField}&size=${size}`;
}

skeletonRow = {
    "card-payment": ['id', 'cardNumber', 'cardDate', 'transferAmount', 'commentary', 'email', 'unsafe'],
    "requested-payment": ['id', 'accountNumber', 'tin', 'bic', 'vat', 'transferAmount', 'email', 'phoneNumber']
};

function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function createRow(data, type) {
    let tableRow = '';

    for (let key in skeletonRow[type]) {
        tableRow += `<td>${data[skeletonRow[type][key]]}</td>`;
    }

    return `<tr>${tableRow}</tr>`;
}

function getPayments(address, type, event, page) {
    event.preventDefault();

    let data = jsonForm(type),
        criteria = getCriteria(type);

    console.log(data);

    if (page) {
        criteria += `&page=${page}`;
    }

    sendPostRequest(address + criteria,
        data,
        function (arr) {
            let rows = '',
                data = JSON.parse(arr),
                array = 'content' in data ? data['content'] : data,
                page = $(`#${type}-page`);


            for (let key in array) {
                rows += createRow(array[key], type);
            }

            $(`#${type}s tbody`).html(rows);
            if ('content' in data && (page.children().length - 2 !== data.totalPages || page.css('display') === 'none')) {
                page.find('.index-page').remove();
                page.css('display', 'flex');

                let list = '';

                for (let i = 0; i < data.totalPages; i++) {
                    list += `<li class="page-item ${data.number === i ? 'active' : ''} index-page"><a class="page-link index-link" href="#">${i}</a></li>`;
                }

                $(`#${type}-page .first`).after(list);

                $(`#${type}-page .index-link`).click(function (e) {
                    $(`#${type}-page .index-page.active`).removeClass('active');
                    $(this).parent().addClass('active');

                    getPayments(address, type, e, $(this).text());
                });
            } else if (!('content' in data)) {
                page.find('.index-page').remove();
                page.css('display', 'none');
            }
        }, function (err) {
            console.log(err);
            addAlert('#alert');
        }, {'Accept': 'application/json', 'Content-Type': 'application/json'});

}
