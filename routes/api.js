var express = require('express'),
    router = express.Router(),
    Service = require('../models/service');
    User = require('../models/user');

router.get('/', function(req, res) {
    res.send('api is working');
});


router.get('/get-services', function(req, res) {
    Service.find(function(err, services) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(services); // return all todos in JSON format
    });
});


router.post('/insert-service', function(req, res) {
    Service.create({
        name : req.body.name,
        eSType : req.body.type,
        location :  {lat : req.body.lat, lon : req.body.long},
    }, function(err, service) {
        if (err)
            res.send(err);
        Service.find(function(err, services) {
            if (err)
                res.send(err)
            res.json(services);
        });
    });
});



module.exports = router;