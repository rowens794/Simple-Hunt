
L.mapbox.accessToken = "pk.eyJ1Ijoicm93ZW5zNzk0IiwiYSI6ImNqaXdpYWpmNzFtZmIzd212aDFkNTNmYTQifQ.fh-c8Th3fFbnoV9-mE3DCA";

// Replace 'mapbox.streets' with your map id.
var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = L.map('map')
    .addLayer(mapboxTiles)
    .setView([38.352515, -81.640284], 12);

var cssIcon = L.divIcon({
    // Specify a class name we can refer to in CSS.
    className: 'map-marker-icon',
    // Set marker width and height
    iconSize: [5, 5]
    });

//parse the locs variable that was passed into the pug file and add each pair to the map
locs = JSON.parse("["+locs+"]");
var locArray = [];
for (i=0; i<locs.length; i++){
    if (i%2 == 1){
        //append point to map and clear array
        locArray.push(locs[i]);
        L.marker(locArray,{icon: cssIcon}).addTo(map);
        console.log(locArray);
        locArray = [];
    }else{
        //create new array
        locArray.push(locs[i]);
    } 
}