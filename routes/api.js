var express = require('express'),
    router = express.Router(),
    Service = require('../models/service');
    User = require('../models/user'),
    Log = require('../models/reportLog');
    Report = require('../models/report');
    ObjectId = require('mongodb').ObjectID;

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


router.get('/get-dept-data/:id', function(req, res) {
    var rep = [];
    Service.findOne({ "_id": new ObjectId(req.params.id) },function(err, service) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)
        Report.find({ service : service._id }).populate('user').sort([['created_at', 'asc']]).exec(function(err, reports) {
            var serviceRe = service.toJSON();
            serviceRe['reports'] = reports;
            res.json(serviceRe); // return all todos in JSON format
        });
    });
});



router.post('/insert-service', function(req, res) {
    Service.create({
        name : req.body.name,
        eSType : req.body.type,
        //location :  {lat : req.body.lat, lon : req.body.long},
        loc : [ req.body.long, req.body.lat ]
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




router.get('/get-report-log/:id', function(req, res) {
    Report.findById(req.params.id, function(err, report) {

        if(!err) {
            if( report.handle != 2 ) {
                report.handle = 1;
            }
            report.save(function(err) {
                if(!err) {
                    Log.find({ "report": new ObjectId(req.params.id) }).sort([['created_at', 'descending']]).exec(function (err, logs) {
                        if (err)
                            res.send(err)

                        res.json(logs); // return all todos in JSON format
                    });
                }
            });
        }

    });
});





router.post('/end-report', function(req, res) {
    Report.findById(req.body.report, function(err, report) {

        if(!err) {
            report.handle = 2;
            report.save(function(err) {
                if (err)
                    res.send(err)

                res.json(report); // return all todos in JSON format
            });
        }

    });
});

module.exports = router;