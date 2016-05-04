var express = require('express'),
    router = express.Router(),
    Service = require('../models/service');
    User = require('../models/user');

router.get('/', function(req, res) {
    res.send('api is working');
});

module.exports = router;