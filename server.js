var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');


mongoose = mongoose.connect('mongodb://localhost/baware');

var app = express();
app.use(bodyParser.urlencoded( { extended : true } ));
app.use(bodyParser.json());


app.use('/api', require('./routes/api'));


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