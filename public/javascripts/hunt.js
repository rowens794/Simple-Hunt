//function that is called in html
function getLocation() {
    //The working next statement.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, errorGettingGPS, {maximumAge: 1, enableHighAccuracy: true});
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    post("/play", {lat: position.coords.latitude, long: position.coords.longitude, position: position}, "post");
}

function post(path, params, method) {
    console.log(params.position);
    method = method || "post"; // Set method to post by default if not specified.
    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

function errorGettingGPS(){
    window.location.href = "/play";
}
