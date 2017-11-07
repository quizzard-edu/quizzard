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
var fileUpload = require('express-fileupload');
var db = require('./server/db.js');
var users = require('./server/users.js');
var questions = require('./server/questions.js');
var lb = require('./server/leaderboard.js');
var log = require('./server/log.js');
var logger = log.logger;
var pug = require('pug');
var common = require('./server/common.js');
var analytics = require('./server/analytics.js');
var json2csv = require('json2csv');
var fs = require('fs');
var csv2json = require('csvtojson');

var app = express();
var port = process.env.QUIZZARD_PORT || 8000;

/* print urls of all incoming requests to stdout */
app.use(function(req, res, next) {
    logger.info("Request path: %s",req.url);
    next();
});

app.set('view engine', 'pug');
app.use(fileUpload());
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
    if ('user' in req.session) {
        req.session.destroy();
        return res.status(400).send('Invalid Request');
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
    users.getQuestionsListByUser(request, function(err, results) {
        if (err) {
            return res.status(500).send();
        }

        users.getStudentById(req.session.user.id, function(err, userFound) {
            if (err) {
                return res.status(500).send();
            }

            return res.status(200).render('home', {
                user: userFound,
                questions: results,
                getQuestionIcon: function(type) {
                    for (var i in common.questionTypes) {
                        if (type === common.questionTypes[i].value) {
                            return common.questionTypes[i].icon;
                        }
                    }
                    return 'help';
                }
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
const regexForm = pug.compileFile('views/question_types/regex-answer.pug');
const mcForm = pug.compileFile('views/question_types/mc-answer.pug');
const tfForm = pug.compileFile('views/question_types/tf-answer.pug');
const chooseAllForm = pug.compileFile('views/question_types/chooseAll-answer.pug');
const matchingForm = pug.compileFile('views/question_types/matching-answer.pug');
const orderingForm = pug.compileFile('views/question_types/ordering-answer.pug');
const leaderboardTable = pug.compileFile('views/leaderboard-table.pug');
const questionList = pug.compileFile('views/questionlist.pug');
const discussionBoard = pug.compileFile('views/discussion.pug');

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
                common.questionTypes.REGULAR.template,{answerForm:true});
            break;
        case common.questionTypes.MULTIPLECHOICE.value:
            res.status(200).render(
                common.questionTypes.MULTIPLECHOICE.template,{answerForm:true});
            break;
        case common.questionTypes.TRUEFALSE.value:
            res.status(200).render(
                common.questionTypes.TRUEFALSE.template,{answerForm:true});
            break;
        case common.questionTypes.CHOOSEALL.value:
            res.status(200).render(
                common.questionTypes.CHOOSEALL.template,{answerForm:true});
            break;
        case common.questionTypes.MATCHING.value:
            res.status(200).render(
                common.questionTypes.MATCHING.template,{answerForm:true});
            break;        
        case common.questionTypes.ORDERING.value:
            res.status(200).render(
                common.questionTypes.ORDERING.template,{answerForm:true});
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

    var userId = req.session.user.id;
    users.getUserById(userId, function(err, user){
        if (err || !user) {
            res.status(400).send('bad request, user does not exist');
        }

        var request = {};
        request.questionsStatus = req.query.type;
        request.user = user;
        users.getQuestionsListByUser(request, function(err, questionsList){
            if (err) {
                return res.status(500).send('Could not fetch questions list');
            }

            var html = null;
            if (req.session.user.type === common.userTypes.ADMIN) {
                html = questionTable({
                    questions : questionsList,
                    questionType: function(type){
                        for (var i in common.questionTypes) {
                            if (type === common.questionTypes[i].value) {
                                return common.questionTypes[i].name;
                            }
                        }
                        return 'UNKNOWN';
                    }
                 });
            }

            if (req.session.user.type === common.userTypes.STUDENT) {
                html = questionList({
                    questions : questionsList,
                    getQuestionIcon: function(type) {
                        for (var i in common.questionTypes) {
                            if (type === common.questionTypes[i].value) {
                                return common.questionTypes[i].icon;
                            }
                        }
                        return 'help';
                    }
                 });
            }

            return res.status(200).send(html);
        });
    });
});

/* Send the question editing form HTML. */
app.get('/questionedit', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var qId = req.query.questionid;
    questions.lookupQuestionById(qId, function(err, question){
        if(err){
            logger.log(err);
            return res.status(500).send(err);
        }

        if(!question){
            return res.status(400).send('Question not found');
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
                    case common.questionTypes.CHOOSEALL.value:
                        return chooseAllForm({adminQuestionEdit:true, question:question})
                    case common.questionTypes.MATCHING.value:
                        return matchingForm({adminQuestionEdit:true, question:question})
                    case common.questionTypes.ORDERING.value:
                        return orderingForm({adminQuestionEdit:true, question:question})
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

    questions.getAllQuestionsList(function(err, questionslist) {
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

    questions.lookupQuestionById(req.query._id, function(err, questionFound) {
        if (err) {
            logger.error(err);
            return res.status(500).send(err);
        }

        if (!questionFound) {
            return res.status(404).render('page-not-found');
        }

        if (!questionFound.visible && req.session.user.type === common.userTypes.STUDENT) {
            return res.status(400).send('Question is not available');
        }

        var answeredList = common.getIdsListFromJSONList2(questionFound.correctAttempts);
        var hasQrating = false;
        for (var i in questionFound.ratings) {
            if (questionFound.ratings[i].user === req.session.user.id) {
                hasQrating = true;
            }
        }
        return res.status(200).render('question-view', {
            user: req.session.user,
            question: questionFound,
            answered: (answeredList.indexOf(req.session.user.id) !== -1),
            isAdmin : function() {
                return req.session.user.type === common.userTypes.ADMIN;
            },
            hasQrating: hasQrating,
            getQuestionForm: function(){
                switch (questionFound.type){
                    case common.questionTypes.REGULAR.value:
                        return regexForm({studentQuestionForm:true})
                    case common.questionTypes.MULTIPLECHOICE.value:
                        return mcForm({studentQuestionForm:true, question:questionFound})
                    case common.questionTypes.TRUEFALSE.value:
                        return tfForm({studentQuestionForm:true, question:questionFound})
                    case common.questionTypes.CHOOSEALL.value:
                        return chooseAllForm({studentQuestionForm:true, question:questionFound})
                    case common.questionTypes.MATCHING.value:
                        // randomize the order of the matching
                        questionFound.leftSide = common.randomizeList(questionFound.leftSide);
                        questionFound.rightSide = common.randomizeList(questionFound.rightSide);
                        return matchingForm({studentQuestionForm:true, question:questionFound})
                    case common.questionTypes.ORDERING.value:
                        return orderingForm({studentQuestionForm:true, question:questionFound})
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

    var questionId = req.body.questionId;
    var answer = req.body.answer;
    var userId = req.session.user.id;

    questions.lookupQuestionById(questionId,function(err, question){
        if(err){
            logger.error(err);
            return res.status(500).send(err);
        }

        if(!question){
            logger.error('Could not find the question %s', questionId);
            return res.status(400).send('Could not find the question');
        }

        logger.info('User %s attempted to answer question %s with "%s"', userId, questionId, answer);

        var value = questions.verifyAnswer(question, answer);
        var points = question.points;
        var text = value ? 'correct' : 'incorrect';
        var status = value ? 200 : 500;
        var response = {text: text, points: points};

        if (req.session.user.type === common.userTypes.ADMIN) {
            return res.status(status).send(response);
        }

        users.submitAnswer(userId, questionId, value, points, answer, function(err, result){
            if(err){
                logger.error(err);
                return res.status(500).send(err);
            }

            questions.submitAnswer(questionId, userId, value, points, answer, function(err, result) {
                if(err){
                    logger.error(err);
                    return res.status(500).send(err);
                }

                return res.status(status).send(response);
            });
        });
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
 * Add a question to the database.
 * The request body contains the question to be added.
 */
app.put('/questionadd', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    questions.addQuestion(req.body, function(err, qId) {
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

    var qid = req.body.id;
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
app.post('/submitQuestionRating', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    return submitQuestionRating(req, res);
});

// question rating from both students and admins
var submitQuestionRating = function (req, res) {
    var userId = req.session.user.id;
    var questionId = req.body.qId;
    var rating = parseInt(req.body.rating);

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).send('bad rating');
    }

    questions.submitRating(questionId, userId, rating, function(err, result) {
        if (err) {
            return res.status(500).send('could not submit rating');
        }

        users.submitRating(userId, questionId, rating, function(err, result) {
            if (err) {
                return res.status(500).send('could not submit rating');
            }

            return res.status(200).send('rating submitted');
        });
    });
}

// get discussion board
app.get('/getDiscussionBoard', function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    var questionId = req.query.questionId;
    questions.lookupQuestionById(questionId, function (err, question) {
        if (err) {
            logger.error(err);
            return res.status(500).send(err);
        }

        if (!question) {
            logger.error('Could not find the question %s', questionId);
            return res.status(400).send('Could not find the question');
        }

        users.getUsersList((err, userObj) => {
            if (err) {
                return res.status(500).send('Could not get the list of students');
            }

            var usersList = {};
            for (var i in userObj) {
                var user = userObj[i];
                usersList[user.id] = user.fname + ' ' + user.lname;
            }

            var discussionHtml = discussionBoard({
                comments: question.comments,
                getCurrentUser: () =>{
                    var userId = req.session.user.id;
                    if (!usersList[userId]) {
                        return 'UNKNOWN';
                    }
                    return usersList[userId];
                },
                getFirstLastName: (userId) => {
                    if (!usersList[userId]) {
                        return 'UNKNOWN';
                    }
                    return usersList[userId];
                },
                isLiked: (likesList) => {
                    return likesList.indexOf(req.session.user.id) !== -1;
                },
                isDisliked: (dislikesList) => {
                    return dislikesList.indexOf(req.session.user.id) !== -1;
                },
                highlightMentionedUser: (comment) => {
                    var userId = req.session.user.id;
                    if (!usersList[userId]) {
                        return '@UNKNOWN';
                    }

                    var fullName = '@' + usersList[userId];
                    var newComment = '';
                    if (comment.indexOf(fullName) > -1) {
                        var parts = comment.split(fullName);
                        for (var i = 0; i < parts.length-1; i++) {
                            newComment += parts[i] + '<b>' + fullName + '</b>';
                        }
                        newComment += parts[parts.length-1];
                    } else {
                        newComment = comment;
                    }
                    return newComment;
                }
            });

            return res.status(200).send(discussionHtml);
        });
    });
});

// add comments to a question
app.post('/addCommentToQuestion', function (req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var questionId = req.body.questionId;
    var comment = req.body.commentText;
    var userId = req.session.user.id;

    questions.addComment(questionId, userId, comment, function (err, question) {
        if (err) {
            logger.error(err);
            return res.status(500).send(err);
        }

        return res.status(200).send('Ok');
    });
});

// add reply to a comment
app.post('/addReplyToComment', function (req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var commentId = req.body.commentId;
    var reply = req.body.replyText;
    var userId = req.session.user.id;

    questions.addReply(commentId, userId, reply, function (err, question) {
        if (err) {
            logger.error(err);
            return res.status(500).send(err);
        }

        return res.status(200).send('Ok');
    });
});

// vote on a comment
app.post('/voteOnComment', function (req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var commentId = req.body.commentId;
    var vote = parseInt(req.body.vote);
    var userId = req.session.user.id;

    if (!vote || (vote !== 1 && vote !== -1)) {
        return res.status(400).send('Vote is invalid');
    }

    logger.info(commentId, vote, userId);

    questions.voteComment(commentId, vote, userId, function (err, value) {
        if (err) {
            logger.error(err);
            return res.status(500).send(err);
        }

        return res.status(200).send(value);
    });
});

// vote on a reply
app.post('/voteOnReply', function (req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var replyId = req.body.replyId;
    var vote = parseInt(req.body.vote);
    var userId = req.session.user.id;

    if (!vote || (vote !== 1 && vote !== -1)) {
        return res.status(400).send('Vote is invalid');
    }

    logger.info(replyId, vote, userId);

    questions.voteReply(replyId, vote, userId, function (err, value) {
        if (err) {
            logger.error(err);
            return res.status(500).send(err);
        }

        return res.status(200).send(value);
    });
});

// gets the users that have answered the question
app.get('/usersToMentionInDiscussion', function (req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var questionId = req.query.questionId;
    questions.lookupQuestionById(questionId, function (err, question){
        if (err) {
            return res.status(500).send('could not find the question');
        }

        if (!question) {
            return res.status(400).send('Invalid questionId');
        }

        var answeredList = [];
        for (var i in question.correctAttempts) {
            answeredList.push(question.correctAttempts[i].id);
        }
        users.getUsersList(function (err, usersList) {
            if (err) {
                return res.status(500).send('could not find the list of users');
            }
            var totalList = [];
            for (var i in usersList) {
                var user = usersList[i];
                if (req.session.user.id !== user.id &&
                    (user.type === common.userTypes.ADMIN
                        || answeredList.indexOf(user.id) !== -1)) {
                    totalList.push(user.fname+' '+user.lname);
                }
            }

            return res.status(200).send(totalList);
        });
    });
});

// questions list of topics
app.get('/questionsListofTopics', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    questions.getAllQuestionsList(function(err, docs) {
        if (err) {
            return res.status(500).send('could not get the list of questions topics');
        }

        var topicsList = [];
        for (var i in docs) {
            if (topicsList.indexOf(docs[i].topic) === -1) {
                topicsList.push(docs[i].topic);
            }
        }

        return res.status(200).send(topicsList);
    });
});

/* get the list of students' ids*/
app.get('/studentsListofIdsNames', function(req, res) {
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
            idsList.push(studentList[s].id + ' - ' + studentList[s].fname + ' ' + studentList[s].lname);
        }
        return res.status(200).send(idsList);
    });
});

/* Display accounts export form */
app.get('/accountsExportForm', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    users.getStudentsList(function(err, studentsList) {
        if (err) {
            return res.status(500).send('Failed to get students list');
        }

        return res.status(200).render('users/accounts-export-form', {
            user: req.session.user,
            students: studentsList
        });
    });
});

/* Display accounts import form */
app.get('/accountsImportForm', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    return res.status(200).render('users/accounts-import-form', {
        user: req.session.user
    });
});

/* Display accounts export form */
app.post('/accountsExportFile', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    var requestedList = req.body.studentsList;
    var totalCount = requestedList.length;
    var studentsCount = 0;
    var studentsList = [];

    for (var i in requestedList) {
        users.getStudentById(requestedList[i], function(err, studentFound) {
            if (err || !studentFound) {
                res.status(500).send('Could not find a student from the export list');
            }

            studentsList.push(studentFound);
            studentsCount++;
            if (studentsCount === totalCount) {
                var fields = ['id', 'fname', 'lname', 'email'];
                var fieldNames = ['Username', 'First Name', 'Last Name', 'Email'];
                var csvData = json2csv({ data: studentsList, fields: fields, fieldNames: fieldNames });
                var file = 'exportJob-students-'+new Date().toString()+'.csv';

                fs.writeFile('uploads/'+file, csvData, function(err) {
                    if (err) {
                        logger.error(err);
                        return res.status(500).send('Export job failed');
                    }
                    return res.status(200).render('users/accounts-export-complete', {
                        file: file
                    });
                });
            }
        });
    }
});

// import the students' list file
app.post('/accountsImportFile', function (req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    var uploadedFile = req.files.usercsv;
    var newFile = 'uploads/importJob-students-' + uploadedFile.name;
    if (!uploadedFile || uploadedFile.mimetype !== 'text/csv') {
        return res.status(400).send('Invalid file format');
    }

    uploadedFile.mv(newFile, function(err) {
        if (err) {
            logger.error(err);
            return res.status(500).send(err);
        }

        logger.info('Uploaded: ', newFile);

        var importedList = [];
        csv2json().fromFile(newFile).on('json', function(jsonObj) {
            var userObj = {};
            userObj['id'] = jsonObj['Username'];
            userObj['fname'] = jsonObj['First Name'];
            userObj['lname'] = jsonObj['Last Name'];
            userObj['email'] = jsonObj['Email'];
            importedList.push(userObj);
        }).on('done', function(err) {
            if (err) {
                return res.status(500).send('Failed to parse the csv file');
            }

            return res.status(200).render('users/accounts-import-list', {
                students: importedList
            });
        });
    });
});

// import the students' list file
app.post('/accountsImportList', function (req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.type !== common.userTypes.ADMIN) {
        return res.status(403).send('Permission Denied');
    }

    if (!req.body.selectedList) {
        return res.status(400).send('Invalid students\' list');
    }

    var inputLen = req.body.selectedList.length;
    var inputList = req.body.selectedList;
    var added = 0;
    var failed = 0;
    var exist = 0;
    var total = 0;

    if (inputLen === 0) {
        return res.status(200).send('ok');
    }

    for (var i in inputList) {
        var inputUser = inputList[i];
        var userToAdd = {
            fname: inputUser.fname,
            lname: inputUser.lname,
            id: inputUser.username,
            email: inputUser.email,
            password: 'KonniChiwa'
        };
        users.addStudent(userToAdd, function (err, userObj) {
            total++;

            if (err) {
                if (err === 'exists') {
                    exist++;
                } else {
                    failed++;
                }
            } else {
                added++;
            }

            if (total === inputLen) {
                return res.status(200).render('users/accounts-import-complete',{
                    added: added,
                    failed: failed,
                    exist: exist,
                    total: total
                });
            }
        });
    }
});

/* download */
app.get('/download', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var fileName = req.query.file;
    var filePath = __dirname+'/uploads/'+fileName;
    return res.download(filePath, fileName, function (err) {
        if (err) {
            logger.error(err);
        }
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
