// Defined outside the function to allow reference to it when checking if there is a banner already on screen.
if (typeof bannerTimeout !== 'undefined'){
    var bannerTimeout;
}

// Displays an error banner with a given message.
function alertBanner(message) {
    // If a banner already exists, remove its content.
    if (document.getElementById("individualAlertBanner")) {
        // Stop the timeout for the existing banner.
        clearTimeout(bannerTimeout);
        document.getElementById("individualAlertBanner").remove();
    }
    // Create content for the new banner.
    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<div id="individualAlertBanner" class="alert-banner"><div>' + message +'</div><button onclick="closeAlert(this)" '
        + 'type="button" class="alert-close button-close" data-bs-dismiss="alert" aria-label="Close">'
        + '<img id="closeBannerButton" src="img/close.png"></button></div>';

    docReady(() => {
        // Find the container for the banner and add the new content.
        let alertContainer = document.querySelector('.alertContainer');
        alertContainer.append(wrapper);
        // Start a timeout for the banner to dissapear after 3 seconds.
        bannerTimeout = setTimeout(function(){
            alertContainer.innerHTML = "";
        }, 3000);
    })
}

// Check document is ready to use
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

// Close alert
function closeAlert(event) {
    event.parentNode.remove();
}

// Code for ajax functions
var ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};

// For sending an ajax request
ajax.send = function (url, callback, method, data, async) {
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

// For ajax get requests
ajax.get = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
};

// For ajax post requests
ajax.post = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), async)
};