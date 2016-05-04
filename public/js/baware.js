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
    });

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
            },
            click : function( marker, eventName, args ) {
                console.log(marker);
            }
        }
    };
    $timeout(function() {
        $scope.videoActive = true;
        $scope.markers.push(marker);
        $scope.map = { center: { latitude: 31.253168, longitude: 34.789222 }, zoom: 16 };
        getAddress(31.253168, 34.789222);
    }, 5000);


    function getAddress(lat, lon) {
        BawareService.getAddressFromCoor(lat, lon).then(function(result) {
            $scope.msgs.push( { dispatch : 0, msg : ' קריאה חדשה נכנסת מ '+result.data.results[0].formatted_address });
            $scope.calls.push( { id : 1,location : { lat : lat, lng : lon, address : result.data.results[0].formatted_address } } );
        });
    }


}

})();