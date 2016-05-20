// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Report = require('../models/report');

// create a schema
var userSchema = new Schema({
    // location: {
    //     lat: { type: Number, required: true },
    //     lon: { type: Number, required: true },
    // },
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    phoneId : String,
    created_at: Date,
    updated_at: Date
});


// on every save, add the date
userSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});



userSchema.statics.addNewUser = function (userData, cb) {
    this.findOne({ phoneId : userData.phoneId }, function(err, userr) {

        if(!userr) {
            user = new User();
            user.loc = [ userData.log, userData.lat ];
            user.phoneId =  userData.phoneId;
            user.save(function(err) {
                if(!err) {

                    Report.addNewReport({ service : userData.service, user : user, loc : [ userData.log, userData.lat ] }, function(data) {
                        var u = data.toJSON();
                        u.user = user;
                        cb({
                            report : u
                        });
                    });


                } else {
                    console.log(err);
                }
            });
        } else {
            Report.addNewReport({ service : userData.service, user : userr }, function(data) {
                var u = data.toJSON();
                u.user = userr;
                cb({
                    report : u
                });
            });
        }

    });
};


// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;