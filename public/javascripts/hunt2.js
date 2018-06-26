//function that is called in html
function getLocation() {
    //The working next statement.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, errorGettingGPS, {maximumAge: 0, enableHighAccuracy: true});
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    
    params = {lat: position.coords.latitude, long: position.coords.longitude};

    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/play");

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
        }
    }
    //clear watch position
    navigator.geolocation.clearWatch(position);

    document.body.appendChild(form);
    form.submit();
}

function errorGettingGPS(){
    window.location.href = "/play";
}