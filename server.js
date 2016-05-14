var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser')
    morgan = require('morgan')
    path = require('path'),
    Pusher = require('pusher'),
    EServcies = require('./models/service'),
    Report = require('./models/report'),
    ReportLog = require('./models/reportLog'),
    User = require('./models/user');


mongoose = mongoose.connect('mongodb://localhost/baware');

var pusher = new Pusher({
    appId: '203852',
    key: '6b3104cb0a227abfa674',
    secret: 'f75449ab79492cdc97e6',
    encrypted: true
});

var app = express();



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended : true}));
app.use(morgan('dev'));

app.set('views', './public/views');
//app.set('view engine', 'jade');







app.use('/api', require('./routes/api'));



//app.get('/', function(req, res) {
//    res.render('home', {});
//});

app.get('*', function(req, res) {
    res.sendfile('./public/views/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


// EServcies.findNearest( 1, [34.801050, 31.285517] , function(err, locations) {
//     console.log(locations);
// });

EServcies.find({loc: {$near: [34.801050, 31.285517]}},function(err, loc){
    if(err) {
        console.log(err);
    } else {
        console.log(loc);
    }
});

var io = require('socket.io').listen(app.listen(3000, '0.0.0.0', function() {
    console.log('Listening to port:  ' + 3000);
}));


var users = [];

var policeNsp = io.of('/police');
var fireNsp = io.of('/fire');
var medicalNsp = io.of('/medical');

policeNsp.on('connection', function(socket){
    //console.log('user connected to the police');


    socket.on('disconnect', function() {
        console.log('user disconnected');

        var user = users[socket.id];
        policeNsp.emit('connectionClosed', user);
    });

    socket.on('connectToService', function(msg) {
        console.log('new user connected to police');
        EServcies.findNearest( 1, [msg.long, msg.lat] , function(err, locations) {
            var testUser = { phoneId : msg.phoneId, lat: msg.lat, log: msg.long, service : locations[0]._id }

            User.addNewUser(testUser, function(user) {
                socket.join(user.report._id);
                policeNsp.to(user.report._id).emit('reportCreated', {report : user.report._id, dispatch_name : locations[0].name});
                policeNsp.to(locations[0]._id).emit('newCall', user);
            });
        })
    })



    socket.on('connectedToUser', function(msg) {
        console.log('now dispatch is connected to user');
        console.log(msg);
        socket.join(msg.report);
        log = new ReportLog();
        log.report = msg.report;
        log.dispatch = true;
        log.msg = 'נוצר חיבור';
        log.save(function(err) {
            if(err) {
                console.log(err)
            } else {
                policeNsp.to(msg.report).emit('message', log);
            }
        });

    })

    socket.on('message', function(msg) {


        log = new ReportLog();
        log.report = msg.report;
        log.dispatch = msg.dispatch;
        log.msg = msg.msg;
        console.log(msg);
        log.save(function(err) {
            if(err) {
                console.log(err)
            } else {
                policeNsp.to(msg.report).emit('message', log);
            }
        });
    });


    socket.on('dispatchJoind', function(msg) {
        socket.join(msg.dispatchId);
    });

});


fireNsp.on('connection', function(socket){
    console.log('user connected to the fireDp');


    socket.on('disconnect', function() {
        console.log('user disconnected');

        var user = users[socket.id];
        policeNsp.emit('connectionClosed', user);
    });

    socket.on('connectToService', function(msg) {
        console.log('connected to fireDp');
        console.log(msg);
        policeNsp.emit('new', msg);
        users[socket.id] = msg.userId;
    })


    socket.on('message', function(msg) {
        policeNsp.emit('message', msg);
    });

});

medicalNsp.on('connection', function(socket){
    console.log('user connected to the medical');


    socket.on('disconnect', function() {
        console.log('user disconnected');

        var user = users[socket.id];
        policeNsp.emit('connectionClosed', user);
    });

    socket.on('connectToService', function(msg) {
        console.log('connected to medical');
        console.log(msg);
        policeNsp.emit('new', msg);
        users[socket.id] = msg.userId;
    })


    socket.on('message', function(msg) {
        policeNsp.emit('message', msg);
    });

});


//To access Wowza Streaming Engine Manager, go to http://localhost:8088/enginemanager in a web browser.