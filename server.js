var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var students = require('./server/students.js');
var questions = require('./server/questions.js');
var selector = require('./server/question-selector.js');
var pug = require('pug');

var app = express();
var port = process.env.QUIZZARD_PORT || 8000;

var upload = multer({ dest: 'uploads/' });

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
    } else if (req.session.user.admin) {
        res.redirect('/admin')
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

app.get('/question', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (req.session.user == null)
        res.redirect('/')
    else if (req.session.question == null)
        res.redirect('/home')
    else
        res.render('question', {
            user: req.session.user,
            question: req.session.question
        });
});

app.get('/admin', function(req,res) {
    if (req.session.user == null)
        res.redirect('/');
    else if (!req.session.user.admin)
        res.redirect('/home')
    else
        res.render('admin', { user: req.session.user });
});

app.get('/about', function(req,res) {
    if (req.session.user == null)
        res.redirect('/')
    else
        res.render('about', { user: req.session.user });
});

/* Pre-compiled Pug views */
const studentTable = pug.compileFile('views/account-table.pug');
const accountForm = pug.compileFile('views/account-creation.pug');
const accountEdit = pug.compileFile('views/account-edit.pug');
const questionTable = pug.compileFile('views/question-table.pug');
const questionForm = pug.compileFile('views/question-creation.pug');
const statistics = pug.compileFile('views/statistics.pug');

/* refetch users from database instead of using stored list */
var refetch = false;

/* send the student table html */
app.get('/studentlist', function(req, res) {
    if (req.session.adminStudentList == null || refetch) {
        /* only fetch student list once, then store it */
        students.getUsers(false, function(studentlist) {
            req.session.adminStudentList = studentlist;
            var html = studentTable({
                students: studentlist
            });
            res.status(200).send(html);
        });
    } else {
        var html = studentTable({
            students: req.session.adminStudentList
        });
        res.status(200).send(html);
    }
});

app.post('/sortaccountlist', function(req, res) {
    if (req.session.adminStudentList == null) {
        var html = studentTable({
            students: []
        });
        res.status(200).send(html);
    } else {
        students.sortAccounts(req.session.adminStudentList, req.body.type,
                                req.body.asc == 'true', function(result) {
            var html = studentTable({
                students: result
            });
            res.status(200).send(html);
        });
    }
});

/* send the account creation form html */
app.get('/accountform', function(req, res) {
    var html = accountForm();
    res.status(200).send(html);
});

/* send the account creation form html */
app.get('/questionform', function(req, res) {
    var html = questionForm();
    res.status(200).send(html);
});

var creationDate = function(timestamp) {
    const months = ['Jan', 'Feb', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(timestamp);
    return months[date.getMonth() - 1] + ' ' + date.getDate() + ' ' + date.getFullYear();
}

/* send the account editing form html */
app.post('/accountedit', function(req, res) {
    /* Find the requested user */
    var ind;
    for (ind in req.session.adminStudentList) {
        if (req.session.adminStudentList[ind].id == req.body.userid)
            break;
    }

    var html = accountEdit({
        user: req.session.adminStudentList[ind],
        cdate: creationDate(req.session.adminStudentList[ind].ctime * 1000)
    });
    res.status(200).send(html);
});

/* send the question table html */
app.get('/questionlist', function(req, res) {
    if (req.session.adminQuestionList == null) {
        selector.findQuestions(0, selector.findTypes.SORT_DEFAULT,
                                    null, function(questionlist) {
            req.session.adminQuestionList = questionlist;
            var html = questionTable({
                questions: questionlist
            });
            res.status(200).send(html);
        });
    } else {
        var html = questionTable({
            questions: req.session.adminQuestionList
        });
        res.status(200).send(html);
    }
});

/* send the application statistics html */
app.get('/statistics', function(req, res) {
    if (req.session.adminQuestionList == null) {
        selector.findQuestions(0, selector.findTypes.SORT_DEFAULT,
                                    null, function(questionlist) {
            req.session.adminQuestionList = questionlist;
            var html = statistics({
                students: req.session.adminStudentList,
                questions: req.session.adminQuestionList
            });
            res.status(200).send(html);
        });
    } else {
        var html = statistics({
            students: req.session.adminStudentList,
            questions: req.session.adminQuestionList
        });
        res.status(200).send(html);
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

/* temporary question creation form */
app.get('/createquestion', function(req,res) {
    res.render('questionform');
});

/*
 * Create a new user.
 * The request body contains an incomplete student object with attributes
 * from the fields in the user creation form.
 * If the user ID already exists, creation fails.
 * Otherwise, the user is inserted into the database and added
 * to the active admin student list.
 */
app.post('/useradd', function(req, res) {
    students.createAccount(req.body, function(result) {
        if (result == 'failure') {
            res.status(500);
        } else {
            if (req.session.adminStudentList != null)
                req.session.adminStudentList.push(req.body);
            res.status(200);
        }
        res.send(result);
    });
});

/*
 * Delete a user with from the database.
 * The request body is an object with a single 'userid' field,
 * containing the ID of the user to be deleted.
 */
app.post('/userdel', function(req, res) {
    students.deleteAccount(req.body.userid, function(result) {
        if (result == 'failure') {
            res.status(500);
        } else {
            if (req.session.adminStudentList != null) {
                /* Remove the deleted user from the stored student list. */
                var ind;
                for (ind in req.session.adminStudentList) {
                    if (req.session.adminStudentList[ind].id == req.body.userid)
                        break;
                }
                req.session.adminStudentList.splice(ind, 1);
            }
            res.status(200);
        }
        res.send();
    });
});

/*
 * Modify a user object in the database.
 * The request body contains a user object with the fields to be modified.
 */
app.post('/usermod', function(req, res) {
    var orig, ind, user;

    orig = req.body.originalID;
    for (ind in req.session.adminStudentList) {
        if (req.session.adminStudentList[ind].id == orig) {
            user = JSON.parse(JSON.stringify(req.session.adminStudentList[ind]));
            break;
        }
    }

    delete req.body.originalID;
    for (var field in req.body)
        user[field] = req.body[field];

    students.updateAccount(orig, user, function(result) {
        if (result == 'success')
            req.session.adminStudentList[ind] = user;

        var html = accountEdit({
            user: req.session.adminStudentList[ind],
            cdate: creationDate(req.session.adminStudentList[ind].ctime * 1000)
        });
        res.status(200).send({
            result: result,
            html: html
        });
    });
});

/*
 * Upload a csv file containing account information.
 * Users are stored in the database.
 */
app.post('/userupload', upload.single('usercsv'), function(req, res) {
    console.log(req.file);
    if (!req.file || req.file.mimetype != 'text/csv')
        res.status(200).send('invalid');

    students.parseFile(req.file, function(account) {
        refetch = true;
    }, function() {
        res.status(200).send('uploaded');
    });
});

/*
 * Add a question to the database.
 * The request body contains the question to be added.
 */
app.post('/questionadd', function(req, res) {
    req.body.basePoints = parseInt(req.body.basePoints);
    req.body.type = questions.QUESTION_REGULAR;
    req.body.hint = '';
    questions.addQuestion(req.body, function(result) {
        if (result == 'failure') {
            res.status(500);
        } else {
            res.status(200);
            req.session.adminQuestionList.push(req.body);
        }
        res.send(result);
    });
});

/*
 * Remove a question from the database.
 * The request body contains the ID of the question to delete.
 */
app.post('/questiondel', function(req, res) {
    var qid = parseInt(req.body.qid);
    questions.deleteQuestion(qid, function(result) {
        if (result == 'failure') {
            res.status(500);
        } else {
            if (req.session.adminQuestionList != null) {
                /* Remove the deleted question from the stored question list. */
                var ind;
                for (ind in req.session.adminQuestionList) {
                    if (req.session.adminQuestionList[ind].id == qid)
                        break;
                }
                req.session.adminQuestionList.splice(ind, 1);
            }
            res.status(200);
        }
        res.send();
    });
});

app.listen(port, function() {
    console.log('server listening on http://localhost:%s', port);
});
