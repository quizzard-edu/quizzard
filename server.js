var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js');

var app = express();
var port = 65535;

app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
    res.render('login');
});

app.post('/login', function(req, res) {
    console.log('Attempted login by user ' + req.body.user);
    db.checkLogin(req.body.user, req.body.passwd, function(obj) {
        if (obj) {
            res.redirect('/home');
        } else {
            res.status(200).send('invalid');
        }
    });
});

app.get('/home', function(req, res) {
    res.render('home');
});

app.listen(port, function() {
    console.log('server listening on http://localhost:%s', port);
});
