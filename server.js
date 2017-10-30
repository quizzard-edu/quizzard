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
var users = require('./server/users.js');
var questions = require('./server/questions.js');
var lb = require('./server/leaderboard.js');
var log = require('./server/log.js');
var logger = log.logger;
var pug = require('pug');
var common = require('./server/common.js');
var analytics = require('./server/analytics.js');

var app = express();
var port = process.env.QUIZZARD_PORT || 8000;

var upload = multer({ dest: 'uploads/' });

/* print urls of all incoming requests to stdout */
app.use(function(req, res, next) {
    logger.info("Request path: %s",req.url);
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

db.initialize(function() {
    log.init(function() {
        app.listen(port, function() {
            logger.info('Server listening on http://localhost:%s.', port);
        });
    });
});

/* main page */
app.get('/', function(req, res) {
    /* if the user has already logged in, redirect to home */
    if (req.session.user){
        return res.redirect('home');
    }

    return res.status(401).render('login');
});

/* check username and password and send appropriate response */
app.post('/login', function(req, res) {
    if (req.session.user) {
        req.session.destroy();
    }

    if(!req.body.user || !req.body.passwd){
        return res.status(400).send('missing requirement');
    }

    var username = req.body.user.toLowerCase();
    var password = req.body.passwd;

    logger.info('Attempted login by user %s', username);

    users.checkLogin(username, password, function(err, user) {
        if(err){
            logger.info('User %s failed logged in.', username);
            req.session.user = null;
            return res.status(403).send(err);
        }

        if(user){
            logger.info('User %s logged in.', username);
            req.session.user = user;
            return res.status(200).send('success');
        }
    });
});

/* End a user's session. */
app.get('/logout', function(req, res) {
    if (req.session.user) {
        logger.info('User %s logged out.', req.session.user.id);
        req.session.destroy();
    }

    return res.redirect('/');
});

/* Display the home page. */
app.get('/home', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type == common.userTypes.ADMIN) {
        return res.redirect('/admin');
    }

    var request = { user : req.session.user, questionsStatus : 'unanswered' };
    users.getQuestionsList(request, function(err, results) {
        if (err) {
            return res.status(500).send();
        }

        users.getStudentById(req.session.user.id, function(err, userFound) {
            if (err) {
                return res.status(500).send();
            }

            return res.status(200).render('home', {
                user: userFound,
                questions: results
            });
        });
    });
});

/* Display the leaderboard page. */
app.get('/leaderboard', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    return res.render('leaderboard', { user: req.session.user });
});

/* Display the admin page. */
app.get('/admin', function(req,res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (!req.session.user.type == common.userTypes.ADMIN) {
        return res.redirect('/home');
    }

    return res.render('admin', { user: req.session.user });
});

/* Display the about page. */
app.get('/about', function(req,res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    return res.render('about', { user: req.session.user });
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
const mcForm = pug.compileFile('views/mc-answer.pug');
const tfForm = pug.compileFile('views/tf-answer.pug');
const leaderboardTable = pug.compileFile('views/leaderboard-table.pug');

/* Fetch and render the leaderboard table. Send HTML as response. */
app.get('/leaderboard-table', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var ft, shrt;

    ft = true;
    shrt = false;

    if (req.query.fullTable == 'false')
        ft = false;
    if (req.query.longTable == 'false')
        shrt = true;

    lb.leaderboard(req.session.user.id, shrt, function(leader) {
        var html = leaderboardTable({
            fullTable: ft,
            shortTable: shrt,
            leaderboard: leader,
            userid: req.session.user.id
        });

        return res.status(200).send(html);
    });
});

/* Send the student table HTML. */
app.get('/studentlist', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (typeof req.query.active === 'undefined') {
        return res.status(500).send('Could not fetch student list');
    }

    /* only fetch student list once, then store it */
    users.getStudentsListWithStatus(req.query.active === 'true', function(err, studentlist) {
        if (err) {
            return res.status(500).send('Could not fetch student list');
        }

        var html = studentTable({
            students: studentlist
        });

        return res.status(200).send(html);
    });
});

/* Sort the list of student accounts by the specified criterion. */
app.post('/sortaccountlist', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (!req.session.adminStudentList) {
        var html = studentTable( { students : [] });

        return res.status(200).send(html);
    }

    students.sortAccounts(
        req.session.adminStudentList,
        req.body.type,
        req.body.asc == 'true',
        function (err, result) {
            if (err) {
                return res.status(500).send('Could not fetch student list');
            }

            var html = studentTable( { students : result } );

            return res.status(200).send(html);
        }
    );
});

/* Send the account creation form HTML. */
app.get('/accountform', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var html = accountForm();

    return res.status(200).send(html);
});

/* Send the question creation form HTML. */
app.get('/questionform', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    return res.status(200).render('question-creation',{
        questionType: common.questionTypes
    });
});

app.get('/answerForm', function(req, res){
    switch (req.query.qType){
        case common.questionTypes.REGULAR.value:
            res.status(200).render(
                common.questionTypes.REGULAR.template,{
                answerForm:true});
            break;
        case common.questionTypes.MULTIPLECHOICE.value:
            res.status(200).render(
                common.questionTypes.MULTIPLECHOICE.template,{
                answerForm:true});
            break;
        case common.questionTypes.TRUEFALSE.value:
            res.status(200).render(
                common.questionTypes.TRUEFALSE.template,{
                answerForm:true});
            break;
        default:
            return res.status(400).send('Please select an appropriate question Type.')
    }
})

/* Return a formatted date for the given timestamp. */
var creationDate = function(timestamp) {
    const months = ['Jan', 'Feb', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(timestamp);

    return months[date.getMonth() - 1] + ' ' + date.getDate() + ' ' + date.getFullYear();
}

/* Send the account editing form HTML. */
app.get('/accounteditform', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    users.getStudentById(req.query.userid, function(err, student){
        if (err || !student) {
            return res.status(500).send('Could not fetch user information');
        }

        var html = accountEdit({
            user: student,
            cdate: student.ctime
        });

        return res.status(200).send(html);
    });
});

/* Send the question table HTML. */
app.get('/questionlist', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var request = {};
    request.user = req.session.user;
    request.questionsStatus = req.query.type;

    users.getQuestionsList(request, function(err, questionsList){
        if (err) {
            return res.status(500).send('Could not fetch questions list');
        }

        req.session.adminQuestionList = null;
        var html = null;

        if (req.session.user.type == common.userTypes.ADMIN) {
            html = questionTable({ questions : questionsList });
        } else {
            html = questionList({ questions : questionsList });
        }

        return res.status(200).send(html);
    });

    /* If this is the first time accessing it, fetch list from database.
    questions.findQuestions(
        0,
        common.sortTypes.SORT_DEFAULT,
        null,
        function(err, questionlist) {
            if (err) {
                return res.status(500).send('Could not fetch questions list');
            }

            req.session.adminQuestionList = questionlist;
            var html = questionTable({
                questions: questionlist
            });

            return res.status(200).send(html);
        }
    );*/
});

/* Send the question editing form HTML. */
app.post('/questionedit', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var qId = parseInt(req.body.questionid);
    questions.lookupQuestionById(qId, function(err, question){
        if(err){
            res.status(500).send('Question not found');
        }

        var html = questionEdit({
            question: question,
            getQuestionForm: function(){
                switch (question.type){
                    case common.questionTypes.REGULAR.value:
                        return regexForm({adminQuestionEdit:true, question:question})
                    case common.questionTypes.MULTIPLECHOICE.value:
                        return mcForm({adminQuestionEdit:true, question:question})
                    case common.questionTypes.TRUEFALSE.value:
                        return tfForm({adminQuestionEdit:true, question:question})
                    default:
                        return res.redirect('/')
                        break;
                }
            }
        });

        return res.status(200).send({
            html: html,
            qtext: question.text,
            qrating: parseInt(question.rating)
        });
    });
});

/* Send the application statistics HTML. */
app.get('/statistics', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        res.status(403).send('Permission Denied');
    }

    questions.getQuestionsList(function(err, questionslist) {
        if (err) {
            res.status(500).send(err);
        }

        users.getStudentsList(function(err, studentslist) {
            if (err) {
                res.status(500).send(err);
            }

            var html = statistics({
                students: studentslist,
                questions: questionslist
            });

            return res.status(200).send(html);
        });
    });
});

app.get('/sortlist', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    return res.status(200).send(common.sortTypes);
});

const questionList = pug.compileFile('views/questionlist.pug');

/* Respond with an HTML-formatted list of questions to display. */
app.post('/fetchqlist', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var type = common.sortTypes.SORT_RANDOM;
    var ans = false;

    if (req.body.type == 'answered') {
        type |= common.sortTypes.QUERY_ANSWERED | common.sortTypes.QUERY_ANSONLY;
        ans = true;
    }

    var request = {};
    request.user = req.session.user;
    request.questionsStatus = req.body.type;

    users.getQuestionsList(request, function(err, questionsList){
        if (err) {
            return res.status(500).send('Could not fetch questions list');
        }

        req.session.adminQuestionList = null;
        var html = questionList({
            questions: questionsList
        });

        return res.status(200).send(html);
    });

    /*
    questions.findQuestions(10, type, req.session.user, function(err, results) {
        req.session.questions = results;
        req.session.answeredQuestions = ans;
        var html = questionList({
            questions: results
        });

        return res.status(200).send(html);
    });*/
});

/* Sort question list by specified criterion and send new HTML. */
app.post('/sortlist', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var type;

    for (type in common.sortTypes) {
        if (req.body.sort == common.sortTypes[type]) {
            break;
        }
    }

    questions.sortQuestions(req.session.questions, common.sortTypes[type],
        function(err, results) {
          var html = questionList({
              questions: results
          });

          return res.status(200).send(html);
        }
    );
});

/* Display the question page. */
app.get('/question', function(req, res) {
    /* if the user has not yet logged in, redirect to login page */
    if (!req.session.user) {
        return res.redirect('/');
    }

    questions.lookupQuestionById(parseInt(req.query.id), function(err, questionFound) {
        if (err || !questionFound) {
            return res.status(500).send();
        }

        if (!questionFound.visible) {
            return res.status(400).send('Question is not available');
        }
        return res.status(200).render('question', {
            user: req.session.user,
            question: questionFound,
            answered: !(questionFound.answered.indexOf(req.session.user.id) === -1),
            preview: false,
            getQuestionForm: function(){
                switch (questionFound.type){
                    case common.questionTypes.REGULAR.value:
                        return regexForm({studentQuestionForm:true})
                    case common.questionTypes.MULTIPLECHOICE.value:
                        return mcForm({studentQuestionForm:true, question:questionFound})
                    case common.questionTypes.TRUEFALSE.value:
                        return tfForm({studentQuestionForm:true, question:questionFound})
                    default:
                        break;
                }
            }
        });
    });
});

/* check if the submitted answer is correct */
app.post('/submitanswer', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    questions.checkAnswer(
        parseInt(req.body.questionId),
        req.session.user,
        req.body.answer,
        function(err, value) {
            var result = value.correct ? value : 'incorrect';
            var status = value.correct ? 200 : 500;
            return res.status(status).send(result);
        }
    );
});

/*
 * Create a new user.
 * The request body contains an incomplete student object with attributes
 * from the fields in the user creation form.
 * If the user ID already exists, creation fails.
 * Otherwise, the user is inserted into the database and added
 * to the active admin student list.
 */
app.put('/useradd', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    users.addStudent(req.body, function(err, result) {
        if (err) {
            return res.status(500).send(err);
        }

        return res.status(201).send('User created');
    });
});

/*
 * Delete a user with from the database.
 * The request body is an object with a single 'userid' field,
 * containing the ID of the user to be deleted.
 */
app.post('/setUserStatus', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    users.setUserStatus(req.body.userid, req.body.active === 'true' , function(err, result) {
        if (err) {
            return res.status(500).send('Failed to deactivate student account');
        }

        return res.status(200).send('Student account has been deactivcated');
    });
});

/*
 * Modify a user object in the database.
 * The request body contains a user object with the fields to be modified.
 */
app.post('/usermod', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var userId = req.body.originalID;
    var updateId = req.body.id ? req.body.id : userId;

    users.updateStudentById(userId, req.body, function(err, result) {
        if (err) {
            return res.status(500).send();
        }

        users.getStudentById(updateId, function(err, userFound) {
            if (err) {
                return res.status(500).send();
            }

            var html = accountEdit({
                user: userFound,
                cdate: creationDate(userFound.ctime)
            });

            return res.status(200).send({
                result: result,
                html: html
            });
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
    }, function() {
        res.status(200).send('uploaded');
    });
});

/*
 * Add a question to the database.
 * The request body contains the question to be added.
 */
app.put('/questionadd', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    questions.addQuestionByType(req.body.type, req.body, function(err, qId) {
        if (err) {
            return res.status(err.status).send(err.msg);
        }

        if (req.body.rating && parseInt(req.body.rating) > 0 && parseInt(req.body.rating) < 6) {
            req.body.qId = qId;
            return submitQuestionRating(req, res);
        }

        return res.status(201).send('Question created');
    });
});

/*
 * Modify a question in the database.
 * Request body contains question's ID and a question object with
 * the fields to be changed.
 */
app.post('/questionmod', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var qid = parseInt(req.body.id);
    var q = req.body.question;

    questions.updateQuestionById(qid, q, function(err, result) {
        if (err){
            return res.status(err.status).send(err.msg);
        }
        return res.status(200).send(result);
    });
});

/*
 * Remove a question from the database.
 * The request body contains the ID of the question to delete.
 */
app.post('/questiondel', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var qid = parseInt(req.body.qid);
    questions.deleteQuestion(qid, function(err, result) {
        if (err) {
            return res.status(500);
        }

        if (req.session.adminQuestionList != null) {
            /* Remove the deleted question from the stored question list. */
            var ind;
            for (ind in req.session.adminQuestionList) {
                if (req.session.adminQuestionList[ind].id == qid) {
                    break;
                }
            }
            req.session.adminQuestionList.splice(ind, 1);
        }

        return res.status(200);
    });
});

// submit question rating from both students and admins
app.post('/submitQuestionRating', function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }
    return submitQuestionRating(req, res);
});

// question rating from both students and admins
var submitQuestionRating = function (req, res) {
    var userId = req.session.user.id;
    var questionId = parseInt(req.body.qId);
    var rating = parseInt(req.body.rating);

    if (rating < 1 || rating > 5) {
        return res.status(400).send('bad rating');
    }

    questions.submitRating(questionId, userId, rating, function(err, result) {
        if (err) {
            return res.status(500).send('could not submit rating');
        }

        users.submitRating(userId, questionId, rating, function(err, result){
            if (err) {
                return res.status(500).send('could not submit rating');
            }

            return res.status(200).send('rating submitted');
        });
    });
}

/* get the list of students' ids*/
app.get('/studentsListofIds', function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    users.getStudentsList(function(err, studentList) {
        if (err) {
            return res.status(500).send('Could not fetch student list');
        }

        var idsList = [];
        for (s in studentList) {
            idsList.push(studentList[s].id);
        }
        return res.status(200).send(idsList);
    });
});

/* Display accounts export form */
app.get('/accountsExportForm', function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    users.getStudentsList(function(err, studentsList) {
        if (err) {
            return res.status(500).send('Failed to get students list');
        }

        return res.status(200).render('users/accounts-export', {
            user: req.session.user,
            students: studentsList
        });
    });
});

/* Display accounts export form */
app.get('/accountsExportFile', function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    users.getStudentsList(function(err, studentsList) {
        if (err) {
            return res.status(500).send('Failed to get students list');
        }

        return res.status(200).render('users/accounts-export', {
            user: req.session.user,
            students: studentsList
        });
    });
});

/* Display accounts import form */
app.get('/accountsImportForm', function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    return res.status(200).render('users/accounts-import', {
        user: req.session.user
    });
});

/* Display some charts and graphs */
app.get('/analytics', function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    return res.status(200).render('analytics', {
        user: req.session.user,
        isAdmin : function() {
            return req.session.user.type === common.userTypes.ADMIN;
        }
    });
});

/* get analytics for a student*/
app.get('/studentAnalytics', function(req,res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    var query = {userId: req.session.user.id, type: req.query.type};

    if (req.session.user.type === common.userTypes.ADMIN) {
        if (!req.query.studentId) {
            return res.status(500).send('no student graphs for admins');
        }
        query.userId = req.query.studentId;
    }

    analytics.getChart(query, function(err, result){
        return res.status(200).send(result);
    });
});

/* get analytics for a admins*/
app.get('/adminAnalytics', function(req,res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    var query = {user: req.session.user, type: req.query.type};

    analytics.getChart(query, function(err, result){
        return res.status(200).send(result);
    });
});

// 404 route
app.use(function(req, res, next){
    return res.status(404).render('page-not-found');
});
