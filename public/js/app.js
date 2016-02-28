$(document).foundation();



function initialize() {
    var myLatlng = new google.maps.LatLng(31.220414, 34.802358);
    
    var mapOptions = {
        zoom: 8,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        oomControl: false,
        scaleControl: false,
        scrollwheel: false
    }

    


    var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

    //Callout Content
    var contentString = 'Totseret ha -Arets street ,park ofir 24';
    //Set window width + content
    var infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 500
    });

    //Add Marker
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        icon: imagePath,
        title: 'image title'
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });

    //Resize Function
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);