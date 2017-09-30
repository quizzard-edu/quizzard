/*
The main server script

Copyright (C) 2016  Alexei Frolov, Larry Zhang
Developed at University of Toronto

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var db = require('./server/db.js');
var students = require('./server/students.js');
var questions = require('./server/questions.js');
var lb = require('./server/leaderboard.js');
var log = require('./server/log.js');
var logger = log.logger;
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
    logger.info('Attempted login by user %s', req.body.user);
    students.checkLogin(req.body.user, req.body.passwd, function(obj) {
        if (obj) {
            req.session.user = obj;
            logger.info('User %s logged in.', req.body.user);
            res.status(200).send('success');
        } else {
            res.status(200).send('invalid');
        }
    });
});

/* Process a password changing request. */
app.post('/changepass', function(req, res) {
    if (!req.session.user) {
        res.status(500).send();
        return;
    }

    if (req.body.newpass != req.body.newpass2) {
        res.status(200).send('mismatch');
        return;
    }

    students.checkLogin(req.session.user.id, req.body.currpass, function(u) {
        if (u) {
            u.password = req.body.newpass;
            students.updateAccount(u.id, u, true, function(result) {
                if (result == 'success') {
                    logger.info('User %s changed their password.', u.id);
                    req.session.user = u;
                }
                res.status(200).send(result);
            });
        } else {
            res.status(200).send('invalid');
        }
    });
});

/* End a user's session. */
app.get('/logout', function(req, res) {
    if (req.session.user != null) {
        logger.info('User %s logged out.', req.session.user.id);
        req.session.destroy();
        res.status(200).send();
    } else {
        res.status(500).send();
    }
});

/* Display the home page. */
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
                req.session.answeredQuestions = false;
                res.render('home', {
                    user: req.session.user,
                    questions: results
                });
            });
        } else {
            res.render('home', {
                user: req.session.user,
                questions: req.session.questions,
                answered: req.session.answeredQuestions
            });
        }
    }
});

/* Display the question page. */
app.get('/question', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (req.session.user == null)
        res.redirect('/')
    else if (req.session.question == null)
        res.redirect('/home')
    else
        res.render('question', {
            user: req.session.user,
            question: req.session.question,
            answered: req.session.questionAnswered,
            preview: false
        });
});

/* Display the leaderboard page. */
app.get('/leaderboard', function(req, res) {
    if (req.session.user == null)
        res.redirect('/')
    else
        res.render('leaderboard', { user: req.session.user, });
});

/* Display the admin page. */
app.get('/admin', function(req,res) {
    if (req.session.user == null)
        res.redirect('/');
    else if (!req.session.user.admin)
        res.redirect('/home')
    else
        res.render('admin', { user: req.session.user });
});

/* Display the about page. */
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
const questionEdit = pug.compileFile('views/question-edit.pug');
const statistics = pug.compileFile('views/statistics.pug');

const regexForm = pug.compileFile('views/regex-answer.pug');
const multipleChoiceForm = pug.compileFile('views/mc-answer.pug');

const leaderboardTable = pug.compileFile('views/leaderboard-table.pug');

/* Fetch and render the leaderboard table. Send HTML as response. */
app.post('/leaderboard-table', function(req, res) {
    var ft, shrt;

    ft = true;
    shrt = false;

    if (req.body.fullTable == 'false')
        ft = false;
    if (req.body.longTable == 'false')
        shrt = true;

    lb.leaderboard(req.session.user.id, shrt, function(leader) {
        var html = leaderboardTable({
            fullTable: ft,
            shortTable: shrt,
            leaderboard: leader,
            userid: req.session.user.id
        });
        res.status(200).send(html);
    });
});

/* refetch users from database instead of using stored list */
var refetch = false;

/* Send the student table HTML. */
app.get('/studentlist', function(req, res) {
    if (req.session.adminStudentList == null || refetch) {
        /* only fetch student list once, then store it */
        students.getUsers(false, function(studentlist) {
            refetch = false;
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

/* Sort the list of student accounts by the specified criterion. */
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

/* Send the account creation form HTML. */
app.get('/accountform', function(req, res) {
    var html = accountForm();
    res.status(200).send(html);
});

/* Send the question creation form HTML. */
app.get('/questionform', function(req, res) {
    var html = questionForm();
    res.status(200).send(html);
});

app.get('/re', function(req, res){
    var html = regexForm();
    res.status(200).send(html);
});

app.get('/mc', function(req, res){
    var html = multipleChoiceForm();
    res.status(200).send(html);
});

/* Return a formatted date for the given timestamp. */
var creationDate = function(timestamp) {
    const months = ['Jan', 'Feb', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(timestamp);
    return months[date.getMonth() - 1] + ' ' + date.getDate() + ' ' + date.getFullYear();
}

/* Send the account editing form HTML. */
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

/* Send the question table HTML. */
app.get('/questionlist', function(req, res) {
    /* If this is the first time accessing it, fetch list from database. */
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

/* Send the question editing form HTML. */
app.post('/questionedit', function(req, res) {
    var ind;
    for (ind in req.session.adminQuestionList) {
        if (req.session.adminQuestionList[ind].id == req.body.questionid)
            break;
    }
    var html = questionEdit({
        question: req.session.adminQuestionList[ind]
    });
    res.status(200).send({
        html: html,
        qtext: req.session.adminQuestionList[ind].text
    });
});

/* Send the application statistics HTML. */
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

/* Respond with an HTML-formatted list of questions to display. */
app.post('/fetchqlist', function(req, res) {
    var type = selector.findTypes.SORT_RANDOM;
    var ans = false;

    if (req.body.type == 'answered') {
        type |= selector.findTypes.QUERY_ANSWERED | selector.findTypes.QUERY_ANSONLY;
        ans = true;
    }

    selector.findQuestions(10, type, req.session.user, function(results) {
        req.session.questions = results;
        req.session.answeredQuestions = ans;
        var html = questionList({
            questions: results
        });
        res.status(200).send(html);
    });
});

/* Sort question list by specified criterion and send new HTML. */
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

/* User requests a question; look it up by ID and store it in session. */
app.post('/questionreq', function(req, res) {
    questions.lookupQuestion(parseInt(req.body.id), function(result) {
        if (result == 'failure' || result == 'invalid') {
            res.status(500).send();
        } else {
            req.session.question = result;
            if (req.session.user.answeredIds.indexOf(result.id) == -1)
                req.session.questionAnswered = false;
            else
                req.session.questionAnswered = true;
            res.status(200).send();
        }
    });
});

/* check if the submitted answer is correct */
app.post('/submitREanswer', function(req, res) {
    questions.checkAnswer(req.session.question, req.body.answer,
                          req.session.user, function(result) {
        var data = {};

        data.result = result;
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
            req.session.questionAnswered = true;
        } else {
            /* TODO: reload sidebar stats, save in data.html */
        }
        res.status(200).send(data);
    });
});

/* check if the submitted MC answer is correct */
app.post('/submitMCanswer', function(req, res) {
    questions.checkMCAnswer(req.session.question, req.body.answer,
                          req.session.user, function(result) {
        var data = {};

        data.result = result;
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
            req.session.questionAnswered = true;
        } else {
            /* TODO: reload sidebar stats, save in data.html */
        }
        res.status(200).send(data);
    });
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
        } else if (result == 'exists') {
            res.status(200);
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
    var orig, ind, user, newpass;

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

    newpass = !!req.body['password'];

    students.updateAccount(orig, user, newpass, function(result) {
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
    if (!req.file || req.file.mimetype != 'text/csv')
        res.status(200).send('invalid');

    students.parseFile(req.file.path, function(account) {
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
    var questionData = {};
    questionData.basePoints = parseInt(req.body.basePoints);
    questionData.title = req.body.title;
    questionData.topic = req.body.topic;
    questionData.hint = req.body.hint;
    questionData.successMessage = req.body.successMessage;
    questionData.text = req.body.text;

    // correct the question Type in database:
    switch(req.body.type){
        case 're':
            questionData.type = questions.QUESTION_REGULAR;
            questionData.answer = req.body.answer;
            break;
        case 'mc':
            questionData.type = questions.QUESTION_MULTCHOICE;
            // make all answers into a list
            var mcanswers = Object.keys(req.body).filter(function(k) {
                return k.indexOf('mc') == 0;
            }).reduce(function(newData, k) {
                newData[k] = req.body[k];
                return newData;
            }, {});
            questionData.mc_answers =  Object.keys(mcanswers).map(function(key){return mcanswers[key]});
            questionData.mcAnswers_Object = mcanswers;
            questionData.answer = req.body[req.body.radbutton];
            break;
        default:
            res.status(500).send('failure');
            break;
    }
    questions.addQuestion(questionData, function(result) {
        if (result == 'failure') {
            res.status(500);
        } else {
            res.status(200);
            req.session.adminQuestionList.push(questionData);
        }
        res.send(result);
    });
});

/*
 * Modify a question in the database.
 * Request body contains question's ID and a question object with
 * the fields to be changed.
 */
app.post('/questionmod', function(req, res) {
    var qid = parseInt(req.body.id);
    var q = req.body.question;
    var ind;

    for (ind in req.session.adminQuestionList) {
        if (req.session.adminQuestionList[ind].id == qid)
            break;
    }
    var question = req.session.adminQuestionList[ind];

    if (q.basePoints)
        q.basePoints = parseInt(q.basePoints);
    // add switch statement to modify MC / RE question

    /* Add all modified fields. */
    for (field in q) {
        if (!!q[field])
            question[field] = q[field];
    }

    questions.updateQuestion(question, function(result) {
        res.status(200).send(result);
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

/* Respond with question page HTML for a dummy user. */
app.get('/questionpreview', function(req, res) {
    if (!req.query.qid) {
        res.status(400).send();
        return;
    }

    var qid = parseInt(req.query.qid);
    questions.lookupQuestion(qid, function(q) {
        if (q == 'invalid' || q == 'failure') {
            res.status(200).send(q);
            return
        }

        res.render('question', {
            user: 'Username',
            question: q,
            answered: false,
            preview: true
        });
    });
});

db.initialize(function() {
    log.init(function() {
        questions.questionInit(function(id) {
            logger.info('Next question ID initialized to %d.', id);
            app.listen(port, function() {
                logger.info('Server listening on http://localhost:%s.', port);
            });
        });
    });
});
