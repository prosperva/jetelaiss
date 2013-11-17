var allMarkers = new Array;
var currentMap;

var latlng_toInitialize;
var markers_toInitialize;
var map_initialized = false;

var map_dialogBox;

var pageBeforeMap;

function addMarkerLocation(lat, lng)
{
    var markerPos = getLatLngObj(lat, lng);

    allMarkers.push(markerPos);
}

function leaveMap()
{
    $.mobile.changePage($(pageBeforeMap), { transition: "none"} );
}

function showDefaultMap()
{
    var defaultCenter = getLatLng(40.714623, -74.006605 );

    var markerPos = getLatLngObj(40.714623, -74.007605);

    var markers = new Array();

    markers.push(markerPos);

    showMap(defaultCenter, markers);
}

function showMarker(lat,lng)
{
    if(lat == 0 && lng == 0)
    {
        map_dialogBox("Désolé l’endroit sélectionné est inconnu.");
        return;
    }
    
    if(!navigator.onLine)
    {
        map_dialogBox("La connexion au réseau n’est pas disponible. Veuillez réessayer plus tard.");
        return;
    }
    
    window.plugins.googleAnalyticsPlugin.trackPageview("/outbound/map");
        
    var latlng = getLatLng(lat, lng );
    
    var markerPos = getLatLngObj(lat, lng);

    var markers = new Array();

    markers.push(markerPos);

    latlng_toInitialize = latlng;

    markers_toInitialize = markers;

    map_initialized = true;
    
    pageBeforeMap = $.mobile.activePage;
    $.mobile.changePage($("#map"), { transition: "none"} );
}

function showMarkerArray(lat, lng, markers)
{
    if(!navigator.onLine)
    {
        map_dialogBox("La connexion au réseau n’est pas disponible. Veuillez réessayer plus tard.");
        return;
    }
        
    window.plugins.googleAnalyticsPlugin.trackPageview("/outbound/map");
    
    var latlng = getLatLng(lat, lng );

    latlng_toInitialize = latlng;

    markers_toInitialize = markers;

    map_initialized = true;

    pageBeforeMap = $.mobile.activePage;
    $.mobile.changePage($("#map"), { transition: "none"} );
}

function InitializeMap()
{
    if(map_initialized)
    {
        showMap(latlng_toInitialize, markers_toInitialize);
    }
    else
    {
        showDefaultMap();
    }
}

//shows the map, by sending null in markers, allMarkers will be shown.
function showMap(latlng, markers)
{
    var myOptions =
    {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    var mapContainer = document.getElementById('map-container');    

    currentMap = new google.maps.Map(mapContainer, myOptions);

    //Should a specific array of markers be used, or all added markers.
    if(markers == null)
    {
        for( var allIndex = 0; allIndex < allMarkers.length; ++allIndex)
        {
            // Creating a marker and positioning it on the map
            var marker = new google.maps.Marker
            ({
                position: allMarkers[allIndex].latlng,
                map: currentMap
            });
        }
    }
    else
    {
        for( var markerIndex = 0; markerIndex < markers.length; ++markerIndex)
        {
            // Creating a marker and positioning it on the map
            var marker = new google.maps.Marker
            ({
                position: markers[markerIndex].latlng,
                map: currentMap
            });
        }
    }
}

function getLatLng(lat, lng)
{
    return new google.maps.LatLng(lat, lng);
}

function getLatLngObj(lat, lng)
{
    var poss = new google.maps.LatLng(lat, lng);

    var latLngObj =
    {
        latlng: poss
    };

    return latLngObj;
}