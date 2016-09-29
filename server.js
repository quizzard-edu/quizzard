var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = 65535;

app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

app.use(express.static(__dirname));

app.listen(port, function() {
    console.log('server listening on http://localhost:%s', port);
});
