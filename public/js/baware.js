(function () {
    'use strict';
var app = angular.module('baware', ['ui.router', 'luegg.directives', 'uiGmapgoogle-maps']);

app.config(function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {


    uiGmapGoogleMapApiProvider.configure({
        isreal: true
    });


    $urlRouterProvider.otherwise('/');

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('/', {
            url: '/',
            templateUrl : '../views/dispatch/welcome.html',
            controller : 'MainController'
        })


        .state('dept', {
            url: '/dept/:dept/:id',
            templateUrl : '../views/dispatch/dash.html',
            controller : 'DispatchController'
        })

});


app.controller('MainController', ['$scope' ,MainController]);
app.controller('DispatchController', ['$scope' , '$timeout', '$http',DispatchController]);



function MainController($scope) {
        console.log('MainController');

}

function DispatchController($scope, $timeout, $http) {
    console.log('DispatchController');

    $scope.map = { center: { latitude: 31.220414, longitude: 34.802358 }, zoom: 10 };

    $scope.calls = [
        { id : 1,location : { lat : 54, lng : 56, address : '' } },
        { id : 2,location : { lat : 54, lng : 56 } },
        { id : 3,location : { lat : 54, lng : 56 } },
        { id : 4,location : { lat : 54, lng : 56 } },
        { id : 5,location : { lat : 54, lng : 56 } },
        { id : 6,location : { lat : 54, lng : 56 } },
        { id : 7,location : { lat : 54, lng : 56 } },
        { id : 8,location : { lat : 54, lng : 56 } },
        { id : 9,location : { lat : 54, lng : 56 } },
        { id : 10,location : { lat : 54, lng : 56 } },
        { id : 11,location : { lat : 54, lng : 56 } },
        { id : 12,location : { lat : 54, lng : 56 } },
    ];


    $scope.msgs = [
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 1, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 1, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 1, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 1, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 1, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 1, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 0, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
        { dispatch : 1, msg : 'adasasdasdasd sa das das das das das a sd asd as dasd asdas dasd ' },
    ];


    $scope.sendMsg = function() {
        if( !$scope.message ||  $scope.message.trim().length == 0) {
            return;
        }

        $scope.msgs.push( { dispatch : 1, msg : $scope.message.trim() });
        $scope.message = undefined;
    }



    $scope.markers = [];
    var marker = {
        id: 0,
        coords: {
            latitude: 31.253168,
            longitude: 34.789222
        },
        options: { draggable: true },
        events: {
            dragend: function (marker, eventName, args) {
                $log.log('marker dragend');
                var lat = marker.getPosition().lat();
                var lon = marker.getPosition().lng();
                $log.log(lat);
                $log.log(lon);

                $scope.marker.options = {
                    draggable: true,
                    labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
                    labelAnchor: "100 0",
                    labelClass: "marker-labels"
                };
            }
        }
    };
    $timeout(function() {
        $scope.markers.push(marker);
        $scope.map = { center: { latitude: 31.253168, longitude: 34.789222 }, zoom: 16 };
        getAddress(31.253168, 34.789222);
        $scope.videoActive = true;
    }, 5000);


    function getAddress(lat, lon) {
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&sensor=false&language=he').then(function(result) {
            $scope.msgs.push( { dispatch : 0, msg : ' קריאה חדשה נכנסת מ '+result.data.results[0].formatted_address });
            $scope.calls.push( { id : 1,location : { lat : lat, lng : lon, address : result.data.results[0].formatted_address } } );
        });
    }


}

})();