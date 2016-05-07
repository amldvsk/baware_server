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


    function getReportLog(id) {
        return $http({
            method: 'GET',
            url: 'api/get-report-log/'+id,
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }
        });
    }


    function endReport(data) {
        return $http({
            method: 'POST',
            url: 'api/end-report',
            data:$.param(data),
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        });
    }



    return {
        getServices : getServices,
        getDeptData : getDeptData,
        getAddressFromCoor : getAddressFromCoor,
        insertNewService : insertNewService,
        getReportLog : getReportLog,
        endReport : endReport,
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
    var socket = null;
    var currentUser = null;
    var currentReport = null;
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

        var lat = result.data.loc[1];
        var lon = result.data.loc[0];


        $scope.map = { center: { latitude: (lat), longitude: (lon) }, zoom: 10 };

        for(var i = 0; i < result.data.reports.length; i++) {
            result.data.reports[i].newMsg = false;
            addNewCall(result.data.reports[i]);
        }
        //$scope.calls = result.data.reports;

    });

    connectToSocket();

    function connectToSocket() {

        var deptArr =  ['police', 'fire', 'medical'];

        socket = io.connect(window.location.host+'/'+deptArr[dept-1]);

        socket.emit('dispatchJoind', { dispatchId :  deptId });

        socket.on('newCall', function(call) {
            console.log(call);
            call.report.newMsg = true;
            addNewCall(call.report);
        });


        socket.on('message', function(msg) {
            if( msg.report == currentReport ) {
                var ms = { dispatch : msg.dispatch, msg : msg.msg, time : msg.created_at };
                $scope.$apply(function() {
                    $scope.msgs.push( ms );
                });
            } else {


                for(var i = 0 ; i < $scope.calls.length; i++) {
                    if( $scope.calls[i].report._id == msg.report ) {
                        $scope.calls[i].newMsg = true;
                    }
                }

            }


        });
    }




    $scope.calls = [];
    $scope.msgs = [];


    $scope.sendMsg = function() {
        if( !$scope.message ||  $scope.message.trim().length == 0) {
            return;
        }

        // $scope.msgs.push( { dispatch : 1, msg : $scope.message.trim(), time : new Date() });
        var msg = { dispatch : true, msg : $scope.message.trim(), report : currentReport, dispatchId : deptId }
        socket.emit('message', msg);
        $scope.message = undefined;
    }



    $scope.markers = [];
    function addNewCall(data) {
        // console.log(data);
        $scope.videoActive = true;
        var marker = {
            id: 0,
            coords: {
                latitude: data.user.loc[1],
                longitude: data.user.loc[0]
            },
            options: { draggable: false },
            events: {
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
        $scope.markers.push(marker);
        $scope.map = { center: { latitude: data.user.loc[1], longitude: data.user.loc[0] }, zoom: 16 };


        getAddress(data, data.user.loc[1], data.user.loc[0], marker);


        startPlayer();
    }



    function getAddress(data, lat, lon, marker) {
        BawareService.getAddressFromCoor(lat, lon).then(function(result) {
            //$scope.msgs.push( { dispatch : 0, msg : data.report.msg, time : data.report.created_at });
            $scope.calls.unshift( { id : 1,location : { lat : data.user.loc[1], lng : data.user.loc[0], address : result.data.results[0].formatted_address, marker : marker } , report : data, newMsg : data.newMsg } );
        });
    }




    $scope.focusOnMarker = function(call) {
        call.newMsg = false;

        $scope.map = { center: { latitude: call.location.lat, longitude: call.location.lng }, zoom: 16 };
        currentUser = call.report.user._id;
        currentReport = call.report._id;
        if( call.report.handle == 0 )
            socket.emit('connectedToUser', { user : currentUser, dispatch : deptId, report : currentReport });
        if( call.report.handle != 2 )
            call.report.handle = 1;
        BawareService.getReportLog(call.report._id).then(function(result) {
            $scope.msgs = [];

            for(var i = 0; i < result.data.length; i++) {
                $scope.msgs.unshift( { dispatch : result.data[i].dispatch, msg : result.data[i].msg, time : result.data[i].created_at });
            }


        });

    }


    $scope.action = function(type) {

        if( type == 1 ) {
            var msg = { dispatch : true,  msg : 'כוחות הצלה בדרך אליך', report : currentReport, dispatchId : deptId, type : type }
            socket.emit('message', msg);
        }

        if( type == 3 ) {
            var msg = { dispatch : true,  msg : 'האירוע הסתיים', report : currentReport, dispatchId : deptId, type : type }
            socket.emit('message', msg);

            BawareService.endReport({ report : currentReport }).then(function(result) {
                for(var i = 0 ; i < $scope.calls.length; i++) {
                    if( $scope.calls[i].report._id == msg.report ) {
                        $scope.calls[i].report.handle = 2;
                    }
                }
            });

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