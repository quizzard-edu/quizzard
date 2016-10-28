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

app.get('/logout', function(req, res) {
    if (req.session.user != null) {
        console.log('User %s logged out', req.session.user.id);
        req.session.destroy();
        res.status(200).send();
    } else {
        res.status(500).send();
    }
});

app.get('/home', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (req.session.user == null) {
        res.redirect('/')
    } else {
        if (req.session.questions == null) {
            /* fetch some questions from the database if the user doesn't have any */
            selector.findQuestions(10, selector.findTypes.SORT_RANDOM,
                                   req.session.user, function(results) {
                req.session.questions = results;
                res.render('home', {
                    user: req.session.user,
                    questions: results
                });
            });
        } else {
            res.render('home', {
                user: req.session.user,
                questions: req.session.questions
            });
        }
    }
});

app.get('/sortlist', function(req, res) {
    res.status(200).send(selector.findTypes);
});

const questionList = pug.compileFile('views/questionlist.pug');

/* send back a sorted question list */
app.post('/sortlist', function(req, res) {
    var type;

    for (type in selector.findTypes) {
        if (req.body.sort == selector.findTypes[type])
            break;
    }

    selector.sortQuestions(req.session.questions, selector.findTypes[type],
                           function(results) {
        var html = questionList({
            questions: results
        });
        res.status(200).send(html);
    });
});

/* user requests a question; look it up by id and store it in session */
app.post('/questionreq', function(req, res) {
    questions.lookupQuestion(parseInt(req.body.id), function(result) {
        if (result == 'failure' || result == 'invalid') {
            res.status(500).send();
        } else {
            req.session.question = result;
            res.status(200).send();
        }
    });
});

/* check if the submitted answer is correct */
app.post('/submitanswer', function(req, res) {
    questions.checkAnswer(req.session.question, req.body.answer,
                          req.session.user, function(result) {
        var data = {};

        data.result = result;
        console.log(req.session.user);
        console.log(req.session.question);
        if (result == 'failed-update') {
            res.status(500).send(data);
        } else if (result == 'correct') {
            data.points = req.session.question.basePoints;
            /* remove question from questions list, TODO: fetch new one */
            for (var ind in req.session.questions) {
                if (req.session.questions[ind].id == req.session.question.id)
                    break;
            }
            req.session.questions.splice(ind, 1);
            req.session.question = null;
        } else {
            /* TODO: reload sidebar stats, save in data.html */
        }
        res.status(200).send(data);
    });
});

app.get('/question', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (req.session.user == null)
        res.redirect('/')
    else if (req.session.question == null)
        res.redirect('/home')
    else
        res.render('question', { question: req.session.question });
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
