$(document).foundation();



jwplayer.key = "D1v8Fw6eKkzR6cKxgcciMrRu5JJVMgFNOuwgjg=="
var map;
var data = [];
var jw_width = 640, jw_height = 500;
var markers = [];



//$(document).ready(function() {
//    init();
//});
//
//
//$(window).on('resize', function() {
//    init();
//});
//
//function init() {
//    console.log($(window).height());
//    $('#map').css({
//        height : $(window).height() - $('nav').height() - 50
//    });
//
//    $('.chat-log-messages ul').css({
//        height : $(window).height() - 160
//    });
//}

function startPlayer(id) {
    jwplayer('player').setup({
        height: jw_height,
        width: jw_width,
        stretching: 'exactfit',
        sources: [{
            file: 'rtmp://37.139.20.85:1935/live/'+id
        }],
        rtmp: {
            bufferlength: 3
        }
    });

    jwplayer("player").onMeta(function(event) {
        var info = "";
        for (var key in data) {
            info += key + " = " + data[key] + "<BR>";
        }
        // print("event", event);
    });

    jwplayer('player').play();
}




var socket = io('http://37.139.20.85:3000');
socket.on ('new', function(msg) {
    console.log (msg);
    startPlayer(msg.userId);
    CentralPark = new google.maps.LatLng(parseFloat(msg.lat), parseFloat(msg.long));
    addMarker(CentralPark, parseFloat(msg.lat), parseFloat(msg.long), msg.userId);
});


socket.on ('connectionClosed', function(msg) {
    console.log (msg);
    deleteMarker(msg);
});




function initialize() {

    var myLatlng = new google.maps.LatLng(31.220414, 34.802358);
    var mapOptions = {
        zoom: 10,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        oomControl: false,
        scaleControl: false,
        scrollwheel: false
    }





    map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);






    //Resize Function
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });



}

function addMarker(location, lat, lng, userId) {
    marker = new google.maps.Marker({
        position: location,
        map: map,
        user : userId,
    });

    var infowindow = new google.maps.InfoWindow({
        content: 'Latitude: ' + location.lat() +
        '<br>Longitude: ' + location.lng()
    });

    map.panTo( new google.maps.LatLng( lat, lng ) );
    map.setZoom(16);
    map.setCenter(marker.getPosition());
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
        startPlayer(marker.user);
    });


    markers[userId] = marker;


    $('.list-view table').append('<tr><td>'+ markers.length+1 +'</td><td>'+ userId +'</td></tr>');


}


function deleteMarker(userId) {
    console.log(markers);
    markers[userId].setMap(null);
}

google.maps.event.addDomListener(window, 'load', initialize);

