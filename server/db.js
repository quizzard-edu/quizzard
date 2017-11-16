/*
db.js

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

var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var logger = require('./log.js');
var common = require('./common.js');
var bcrypt = require('bcryptjs');

var DB_HOST = process.env.DB_HOST || 'localhost';
var DB_PORT = process.env.DB_PORT || 27017;
var DB_NAME = process.env.DB_NAME || 'quizzard';

var db = new Db(DB_NAME, new Server(DB_HOST, DB_PORT));

var nextQuestionNumber = 0;
var usersCollection;
var questionsCollection;
var analyticsCollection;

/* Open a connection to the database. */
exports.initialize = function(callback) {
    db.open(function(err, db) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }

        logger.log('Connection to Quizzard database successful.');
        usersCollection = db.collection('users');
        questionsCollection = db.collection('questions');
        analyticsCollection = db.collection('analytics');

        getNextQuestionNumber(function() {
            logger.log(common.formatString('next question number: {0}', [nextQuestionNumber]));
            return callback();
        });
    });
}

// Users functions
// Add USER to usersCollection in the database
exports.addStudent = function(student, callback){
    addUser(student, callback);
}

exports.addAdmin = function(admin, callback){
    addUser(admin, callback);
}

var addUser = function(user, callback) {
    usersCollection.findOne({_id: user._id}, function(err, obj) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        if (obj) {
            return callback('exists', null);
        }

        usersCollection.insert(user, function(err, res) {
            return callback(err, user);
        });
    });
}

/* Return an array of users in the database. */
exports.getAdminsList = function(callback) {
    getUsersList({type: common.userTypes.ADMIN}, {id: 1}, callback);
}

exports.getStudentsList = function(callback) {
    getUsersList({type: common.userTypes.STUDENT}, {id: 1}, callback);
}

exports.getUsersList = function(callback) {
    getUsersList({}, {id: 1}, callback);
}

exports.getStudentsListWithStatus = function(status, callback) {
    getUsersList({type: common.userTypes.STUDENT, active: status}, {id: 1}, callback);
}

/* Return an array of users in the database, sorted by rank. */
var getUsersList = function(findQuery, sortQuery, callback){
    usersCollection.find(findQuery).sort(sortQuery).toArray(function(err, docs) {
        if (err) {
            return callback(err, []);
        }

        return callback(null, docs);
    });
}

exports.getStudentsListSorted = function(lim, callback){
    usersCollection.find({type: common.userTypes.STUDENT})
            .sort({points: -1})
            .limit(lim)
            .toArray(function(err, docs) {
        if (err) {
            return callback(err, []);
        }

        return callback(null, docs);
    });
}

exports.getUserById = function(userId, callback) {
    getUserById(userId, callback);
}

/*
 * Check if the account given by user and pass is valid.
 * user type of null
 */
exports.checkLogin = function(userId, pass, callback) {
    usersCollection.findOne({username : userId}, function(err, obj) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        if (!obj) {
            return callback('notExist', null);
        }

        if (!obj.active) {
            return callback('notActive', null);
        }

        validatePassword(obj, pass, function(err, valid) {
            if (err) {
                return callback(err, null);
            }
            if (valid) {
                delete obj.password;
                return callback(null, obj);
            }
            return callback('invalid', null);
        });
    });
}

/*
 * Check the hash of pass against the password stored in userobj.
 */
var validatePassword = function(userobj, pass, callback) {
    bcrypt.compare(pass, userobj.password, function(err, obj) {
        callback(err, obj);
    });
}

// cleanup the users collection
exports.removeAllUsers = function(callback){
    common.rmrf(common.fsTree.HOME, 'Users', function (err, result) {
        if(err){
            logger.error(err);
            return callback(err, null);
        }

        common.mkdir(common.fsTree.HOME, 'Users', function (err, result) {
            if(err){
                logger.error(err);
                return callback(err, null);
            }

            usersCollection.remove({}, function(err, obj) {
                if (err) {
                    logger.error(err);
                    return callback(err, null);
                }

                logger.log('All users have been removed');
                return callback(null, obj);
            });
        });
    });
}

/*
 * Fetch the user object with ID userId in the users database.
 */
exports.getStudentById = function(studentId, callback) {
    getUserById(studentId, callback);
}

exports.getAdminById = function(adminId, callback) {
    getUserById(adminId, callback);
}

var getUserById = function(userId, callback){
    usersCollection.findOne({_id : userId}, function(err, obj) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        return callback(null, obj);
    });
}

// Update a student record using its Id
exports.updateUserById = function(userId, info, callback){
    updateUserById(userId, info, callback);
}

exports.updateStudentById = function(userId, info, callback){
    updateUserById(userId, info, callback);
}

exports.updateAdminById = function(userId, info, callback){
    updateUserById(userId, info, callback);
}

var updateUserById = function(userId, info, callback){
    var currentDate = new Date().toString();
    var query = { _id : userId };
    var update = {};

    update.$addToSet = {};
    update.$inc = {};
    update.$pull = {};
    update.$set = { mtime : currentDate };
    update.$push = {};

    if (info.username) {
        update.$set.username = info.username;
    }

    if (info.fname) {
        update.$set.fname = info.fname;
    }

    if (info.lname) {
        update.$set.lname = info.lname;
    }

    if (info.email) {
        update.$set.email = info.email;
    }

    if (info.rating) {
        update.$push.ratings = {
            question: info.questionId,
            date: currentDate,
            rating: info.rating
        }
    }

    if (typeof info.active !== 'undefined') {
        update.$set.active = info.active;
    }

    if (isEmptyObject(update.$addToSet)) {
        delete update.$addToSet;
    }

    if (isEmptyObject(update.$inc)) {
        delete update.$inc;
    }

    if (isEmptyObject(update.$set)) {
        delete update.$set;
    }

    if (isEmptyObject(update.$pull)) {
        delete update.$pull;
    }

    if (isEmptyObject(update.$push)) {
        delete update.$push;
    }

    if (typeof info.newPassword === 'undefined') {
        usersCollection.update(query, update, function(err, obj) {
            if (err) {
                logger.error(err);
                return callback(err, null);
            }

            return callback(null, 'success');
        });
    } else {
        update.$set.password = info.newPassword;
        updateUserPassword(query, update, info.newPassword, callback);
    }
}

exports.updateUserPassword = function(query, update, password, callback) {
    updateUserPassword(query, update, password, callback);
}

var updateUserPassword = function(query, update, password, callback) {
    bcrypt.hash(password, 11, function(err, hash) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        if (update.$set && !isEmptyObject(update.$set)) {
            update.$set.password = hash;
        } else {
            update.$set = {password: hash};
        }

        usersCollection.update(query, update, function(err, obj) {
            if (err) {
                logger.error(err);
                return callback(err, null);
            }

            return callback(null, 'success');
        });
    });
}

// update users collection directly by a query
exports.updateUserByQuery = function (query, update, callback) {
    usersCollection.update(query, update, function(err, obj) {
        return callback(err, obj);
    });
}

// check if json obejct is empty
var isEmptyObject = function(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

// Questions functions
// Add QUESTION to questionsCollection in the database
exports.addQuestion = function(question, callback) {
    question.number = ++nextQuestionNumber;
    questionsCollection.insert(question, function(err, res) {
        if(err) {
            logger.error(err);
            return callback({status:500, msg:err}, null);
        }

        return callback(null, question.number);
    });
}

// cleanup the users collection
exports.removeAllQuestions = function(callback) {
    common.rmrf(common.fsTree.HOME, 'Questions', function (err, result) {
        if(err){
            logger.error(err);
            return callback(err, null);
        }

        common.mkdir(common.fsTree.HOME, 'Questions', function (err, result) {
            if(err){
                logger.error(err);
                return callback(err, null);
            }

            questionsCollection.remove({}, function(err, res) {
                if(err){
                    logger.error(err);
                    return callback(err, null);
                }

                nextQuestionNumber = 0;
                logger.log('All questions have been removed');
                logger.log(common.formatString('next question: {0}', [nextQuestionNumber]));
                return callback(null, res);
            });
        });
    });
}

// get next question number
var getNextQuestionNumber = function(callback) {
      questionsCollection.find().sort({number: -1}).limit(1).toArray(function(err, docs) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }

        nextQuestionNumber = docs[0] ? docs[0].number : 0;
        return callback(nextQuestionNumber);
    });
}

exports.getQuestionsList = function(findQuery, sortQuery, callback) {
    questionsCollection.find(findQuery).sort(sortQuery).toArray(function(err, docs) {
        if (err) {
            return callback(err, null);
        }

        for (q in docs) {
            docs[q].firstAnswer = docs[q].correctAttempts[0] ? docs[q].correctAttempts[0].id : 'No One';
        }

        return callback(null, docs);
    });
}

/* Classic Fisher-Yates shuffle. Nothing to see here. */
var shuffle = function(arr) {
    var curr, tmp, rnd;

    curr = arr.length;

    while (curr) {
        rnd = Math.floor(Math.random() * curr);
        --curr;
        tmp = arr[curr];
        arr[curr] = arr[rnd];
        arr[rnd] = tmp;
    }
}

/* Sort questions by the given sort type. */
exports.sortQuestions = function(questions, type, callback) {
    var cmpfn;

    if (type & common.sortTypes.SORT_RANDOM) {
        shuffle(questions);
        return callback(null, questions);
    } else if (type & common.sortTypes.SORT_TOPIC) {
        cmpfn = function(a, b) {
            return a.topic < b.topic ? -1 : 1;
        };
    } else if (type & common.sortTypes.SORT_POINTS) {
        cmpfn = function(a, b) {
            return b.points - a.points;
        };
    } else {
        cmpfn = function(a, b) { return -1; };
    }

    questions.sort(cmpfn);
    return callback(null, questions);
}

/* Extract a question object from the database using its ID. */
exports.lookupQuestion = function(findQuery, callback) {
    questionsCollection.findOne(findQuery, function(err, question) {
        if (err) {
            return callback(err, null);
        }

        if (!question) {
            return callback('No question found', null);
        }

        /* necessary for later database update */
        question.firstAnswer = question.correctAttempts[0] ? question.correctAttempts[0].id : 'No One';
        return callback(null, question);
    });
}

// update a question record based on its id
exports.updateQuestionById = function(questionId, request, callback) {
    var currentDate = new Date().toString();
    var query = {_id: questionId};
    var update = {};

    update.$addToSet = {};
    update.$push = {};
    update.$pull = {};
    update.$set = {};
    update.$inc = {};

    if ('topic' in request) {
      update.$set.topic = request.topic;
    }

    if ('title' in request) {
      update.$set.title = request.title;
    }

    if ('text' in request) {
      update.$set.text = request.text;
    }

    if ('answer' in request) {
      update.$set.answer = request.answer;
    }

    if ('hint' in request) {
      update.$set.hint = request.hint;
    }

    if ('points' in request) {
      update.$set.points = request.points;
    }

    if ('choices' in request) {
      update.$set.choices = request.choices;
    }

    if ('leftSide' in request) {
      update.$set.leftSide = request.leftSide;
    }

    if ('rightSide' in request) {
      update.$set.rightSide = request.rightSide;
    }

    if ('visible' in request) {
        update.$set.visible = request.visible;
    }

    if (isEmptyObject(update.$addToSet)) {
        delete update.$addToSet;
    }

    if (isEmptyObject(update.$push)) {
        delete update.$push;
    }

    if (isEmptyObject(update.$set)) {
        delete update.$set;
    }

    if (isEmptyObject(update.$pull)) {
        delete update.$pull;
    }

    if (isEmptyObject(update.$inc)) {
        delete update.$inc;
    }

    questionsCollection.update(query, update, function(err, info) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, 'success');
    });
}

// update users collection directly by a query
exports.updateQuestionByQuery = function (query, update, callback) {
    questionsCollection.update(query, update, function(err, obj) {
        return callback(err, obj);
    });
}
