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


app.controller('MainController', ['$scope' , 'BawareService', '$rootScope',MainController]);
app.controller('DispatchController', ['$scope' , '$timeout', 'BawareService' , '$stateParams' , '$rootScope' ,DispatchController]);
app.factory('BawareService', ['$http' ,BawareService])
app.filter('unsafe', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

function BawareService($http) {

    function getServices() {
        return $http({
            method: 'GET',
            url: 'api/get-services',
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }
        });
    }

    function getDeptData(id) {
        return $http({
            method: 'GET',
            url: 'api/get-dept-data/'+id,
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }
        });
    }

    function getAddressFromCoor(lat, lon) {
        return $http({
            method: 'GET',
            url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&sensor=false&language=he',
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }
        });
    }


    function insertNewService(data) {
        return $http({
            method: 'POST',
            url: 'api/insert-service',
            data:$.param(data),
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        });
    }



    return {
        getServices : getServices,
        getDeptData : getDeptData,
        getAddressFromCoor : getAddressFromCoor,
        insertNewService : insertNewService,
    }
}

function MainController($scope, BawareService, $rootScope) {
    console.log('MainController');

    $rootScope.dept = undefined;
    $scope.newService = {};
    var ser;
    BawareService.getServices().then(function(result) {
        ser = result.data;
        pushData();


    });

    function pushData() {
        $scope.services = {
            police : [],
            medical : [],
            fire : [],
        };
        for(var i = 0; i < ser.length; i++) {
            if( ser[i].eSType == 1 ) {
                $scope.services.police.push(ser[i]);
            } else if( ser[i].eSType == 2 ) {
                $scope.services.medical.push(ser[i]);
            } else {
                $scope.services.fire.push(ser[i]);
            }
        }
    }

    $scope.submitForm = function(valid) {
        if(!valid) return;

        BawareService.insertNewService($scope.newService).then(function(result) {
            console.log(result);
            ser = result.data;
            pushData();
            $scope.newService = {};
        });

    }

}

function DispatchController($scope, $timeout, BawareService, $stateParams, $rootScope) {
    console.log('DispatchController');


    var dept = $stateParams.dept;
    var deptId = $stateParams.id;

    $rootScope.dept = '';

    if( dept == 1 ) {
        $rootScope.dept = 'משטרה';
    } else if( dept == 2 ) {
        $rootScope.dept = 'מגן דוד אדום';
    } else {
        $rootScope.dept = 'מכבי אש';
    }


    BawareService.getDeptData(deptId).then(function(result) {
        $rootScope.dept += ' - '+result.data.name;

        var lat = result.data.location.lat;
        var lon = result.data.location.lon;


        $scope.map = { center: { latitude: (lat), longitude: (lon) }, zoom: 10 };

    });



    $scope.calls = [];


    $scope.msgs = [];


    $scope.sendMsg = function() {
        if( !$scope.message ||  $scope.message.trim().length == 0) {
            return;
        }

        $scope.msgs.push( { dispatch : 1, msg : $scope.message.trim(), time : new Date() });
        $scope.message = undefined;
    }



    $scope.markers = [];
    var marker = {
        id: 0,
        coords: {
            latitude: 31.253168,
            longitude: 34.789222
        },
        options: { draggable: false },
        events: {
            // dragend: function (marker, eventName, args) {
            //
            // },
            click : function( marker, eventName, args ) {
                console.log(marker);
                var lat = marker.getPosition().lat();
                var lon = marker.getPosition().lng();
                marker.options = {
                    draggable: false,
                    labelContent: "lat: " + lat + ' ' + 'lon: ' + lon,
                    labelAnchor: "100 0",
                    labelClass: "marker-labels"
                };
            }
        }
    };
    $timeout(function() {
        $scope.videoActive = true;
        $scope.markers.push(marker);
        $scope.map = { center: { latitude: 31.253168, longitude: 34.789222 }, zoom: 16 };
        getAddress(31.253168, 34.789222, marker);
        startPlayer();
    }, 5000);


    function getAddress(lat, lon, marker) {
        BawareService.getAddressFromCoor(lat, lon).then(function(result) {
            $scope.msgs.push( { dispatch : 0, msg : ' קריאה חדשה נכנסת מ '+'<strong>'+result.data.results[0].formatted_address+'</strong>', time : new Date() });
            $scope.calls.push( { id : 1,location : { lat : lat, lng : lon, address : result.data.results[0].formatted_address, marker : marker } } );
        });
    }


    $scope.focusOnMarker = function(call) {
        $scope.map = { center: { latitude: call.location.lat, longitude: call.location.lng }, zoom: 16 };
    }


    $scope.action = function(type) {

        if( type == 1 ) {
            $scope.msgs.push( { dispatch : 1, msg : 'כוחות הצלה בדרך אליך' , time : new Date()});
        }

    }



    var h = ( $(window).height() / 2 );
    var jw_width = 640, jw_height = h;
    jwplayer.key = "D1v8Fw6eKkzR6cKxgcciMrRu5JJVMgFNOuwgjg=="
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


}

})();