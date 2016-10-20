var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var students = require('./server/students.js');
var questions = require('./server/questions.js');
var selector = require('./server/question-selector.js');
var pug = require('pug');

var app = express();
var port = 65535;

/* print urls of all incoming requests to stdout */
app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'test',
    resave: true,
    saveUninitialized: false
}));

/* main page */
app.get('/', function(req, res) {
    /* if the user has already logged in, redirect to home */
    if (req.session.user != null)
        res.redirect('home');
    else
        res.render('login');
});

/* check username and password and send appropriate response */
app.post('/login', function(req, res) {
    console.log('Attempted login by user ' + req.body.user);
    students.checkLogin(req.body.user, req.body.passwd, function(obj) {
        if (obj) {
            req.session.user = obj;
            res.status(200).send('success');
        } else {
            res.status(200).send('invalid');
        }
    });
});

app.get('/home', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (req.session.user == null) {
        res.redirect('/')
    } else {
        selector.findQuestions(10, selector.sortTypes.RANDOM, function(results) {
            res.render('home', { user: req.session.user, questions: results });
        });
    }
});

app.get('/sortlist', function(req, res) {
    res.status(200).send(selector.sortTypes);
});

const questionList = pug.compileFile('views/questionlist.pug');

app.post('/sortlist', function(req, res) {
    var type;

    for (type in selector.sortTypes) {
        if (req.body.sort == selector.sortTypes[type])
            break;
    }

    selector.findQuestions(10, selector.sortTypes[type], function(results) {
        if (results == 'failure') {
        } else if (results == 'invalid-sort') {
            console.log('invalid sort requested');
        } else {
            var html = questionList({
                questions: results
            });
            res.status(200).send(html);
        }
    });
});

app.post('/questionreq', function(req, res) {
    questions.lookupQuestion(parseInt(req.body.id), function(result) {
        if (result == 'failure' || result == 'invalid') {
            res.status(500).send();
        } else {
            req.session.user.question = result;
            res.status(200).send();
        }
    });
});

app.get('/question', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (req.session.user == null)
        res.redirect('/')
    else if (req.session.user.question == null)
        res.redirect('/home')
    else
        res.render('question', { question: req.session.user.question });
});

/* temporary account creation form */
app.get('/createuser', function(req,res) {
    res.render('userform');
});

/* temporary question creation form */
app.get('/createquestion', function(req,res) {
    res.render('questionform');
});

app.post('/useradd', function(req, res) {
    students.createAccount(req.body, function(result) {
        if (result == 'failure')
            res.status(500);
        else
            res.status(200);
        res.send(result);
    });
});

app.post('/questionadd', function(req, res) {
    req.body.basePoints = parseInt(req.body.basePoints);
    req.body.type = questions.QUESTION_REGULAR;
    req.body.hint = '';
    questions.addQuestion(req.body, function(result) {
        if (result == 'failure')
            res.status(500);
        else
            res.status(200);
        res.send(result);
    });
});

app.listen(port, function() {
    console.log('server listening on http://localhost:%s', port);
});
