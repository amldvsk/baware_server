// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Log = require('../models/reportLog');
var request = require("request");

// create a schema
var reportSchema = new Schema({
    user:  {type : mongoose.Schema.ObjectId, ref : 'User'} ,
    service:  {type : mongoose.Schema.ObjectId, ref : 'Service'} ,
    handle : { type: Number, default: 0 },
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    created_at: Date,
    updated_at: Date
});


// on every save, add the date
reportSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});



reportSchema.statics.addNewReport = function (report,cb) {
    reportNew = new Report();
    reportNew.user = report.user._id;
    reportNew.service =  report.service;
    reportNew.loc = report.loc
    reportNew.save(function(err) {
        if(!err) {

            log = new Log();
            log.report = reportNew;
            getAdressFromCoor( report.loc[1], report.loc[0] , function(msg) {
                log.msg = msg;
                log.dispatch = false;
                log.save(function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        cb(reportNew);
                    }
                });
            });

        } else {
            console.log(err);
        }
    });
};



function getAdressFromCoor(lat, lng, cb) {

    var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=false&language=he';

    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            cb('<span>התקבלה קריאה חדשה מ</span> - <strong>'+body.results[0].formatted_address+'</strong>');
        }
    })


}

// the schema is useless so far
// we need to create a model using it
var Report = mongoose.model('Report', reportSchema);

// make this available to our users in our Node applications
module.exports = Report;