var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');


mongoose = mongoose.connect('mongodb://localhost/baware');

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
app.set('view engine', 'jade');

app.use('/api', require('./routes/api'));


app.get('/', function(req, res) {
    res.render('home', {});
});

var io = require('socket.io').listen(app.listen(3000, '0.0.0.0', function() {
    console.log('Listening to port:  ' + 3000);
}));


var users = [];

io.on('connection', function(socket){
    console.log('a user connected');


    socket.on('disconnect', function() {
        console.log('user disconnected');

        var user = users[socket.id];
        io.emit('connectionClosed', user);
    });

    socket.on('connectToService', function(msg) {
        console.log('connectToService');
        console.log(msg);
        io.emit('new', msg);
        users[socket.id] = msg.userId;
    })





});