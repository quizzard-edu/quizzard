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

const Db = require('mongodb').Db;
const Server = require('mongodb').Server;
const logger = require('./log.js');
const common = require('./common.js');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_NAME || 'quizzard';

const db = new Db(DB_NAME, new Server(DB_HOST, DB_PORT));

var usersCollection;
var questionsCollection;
var analyticsCollection;
var settingsCollection;

var nextQuestionNumber = 0;

/**
 * Open a connection to the database
 *
 * @param {function} callback
 */
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
        settingsCollection = db.collection('settings');

        getNextQuestionNumber(function() {
            logger.log(common.formatString('next question number: {0}', [nextQuestionNumber]));
            return callback();
        });
    });
}

/**
 * add a student
 *
 * @param {object} student
 * @param {function} callback
 */
exports.addStudent = function(student, callback){
    addUser(student, callback);
}

/**
 * add a user
 *
 * @param {object} admin
 * @param {function} callback
 */
exports.addAdmin = function(admin, callback){
    addUser(admin, callback);
}

/**
 * add a user
 *
 * @param {object} user
 * @param {function} callback
 */
var addUser = function(user, callback) {
    usersCollection.findOne({$or:[{_id: user._id}, {username: user.username}]}, function(err, obj) {
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

/**
 * get admin list
 *
 * @param {function} callback
 */
exports.getAdminsList = function(callback) {
    getUsersList({type: common.userTypes.ADMIN}, {username: 1}, callback);
}

/**
 * get student list
 *
 * @param {function} callback
 */
exports.getStudentsList = function(callback) {
    getUsersList({type: common.userTypes.STUDENT}, {username: 1}, callback);
}

/**
 * get users list
 *
 * @param {function} callback
 */
exports.getUsersList = function(callback) {
    getUsersList({}, {username: 1}, callback);
}

/**
 * get students list with status
 *
 * @param {string} status
 * @param {function} callback
 */
exports.getStudentsListWithStatus = function(status, callback) {
    getUsersList({type: common.userTypes.STUDENT, active: status}, {username: 1}, callback);
}

/**
 * Return an array of users in the database, sorted by rank
 *
 * @param {object} findQuery
 * @param {object} sortQuery
 * @param {function} callback
 */
var getUsersList = function(findQuery, sortQuery, callback){
    usersCollection.find(findQuery).sort(sortQuery).toArray(function(err, docs) {
        if (err) {
            return callback(err, []);
        }

        return callback(null, docs);
    });
}

/**
 * get students list sorted
 *
 * @param {int} lim
 * @param {function} callback
 */
exports.getStudentsListSorted = function(lim, callback){
    usersCollection.find({type: common.userTypes.STUDENT})
            .sort({points: -1})
            .limit(lim)
            .toArray(function(err, docs) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, docs);
    });
}

/**
 * get user by id
 *
 * @param {string} userId
 * @param {function} callback
 */
exports.getUserById = function(userId, callback) {
    getUserById(userId, callback);
}

/**
 * Check if the account given by user and pass is valid
 * user type of null
 *
 * @param {string} userId
 * @param {string} pass
 * @param {function} callback
 */
exports.checkLogin = function(userId, pass, callback) {
    usersCollection.findOne({username : userId}, function(err, obj) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        if (!obj) {
            return callback('userNotExist', null);
        }

        if (!obj.active) {
            return callback('userNotActive', null);
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

/**
 * Check the hash of pass against the password stored in userobj
 *
 * @param {object} userobj
 * @param {string} pass
 * @param {function} callback
 */
var validatePassword = function(userobj, pass, callback) {
    bcrypt.compare(pass, userobj.password, function(err, obj) {
        callback(err, obj);
    });
}

/**
 * cleanup the users collection
 *
 * @param {function} callback
 */
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

/**
 * get student by id
 *
 * @param {string} studentId
 * @param {function} callback
 */
exports.getStudentById = function(studentId, callback) {
    getUserById(studentId, callback);
}

/**
 * get admin by id
 *
 * @param {string} adminId
 * @param {function} callback
 */
exports.getAdminById = function(adminId, callback) {
    getUserById(adminId, callback);
}

/**
 * get user by id
 *
 * @param {string} userId
 * @param {function} callback
 */
var getUserById = function(userId, callback){
    usersCollection.findOne({_id : userId}, function(err, obj) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        return callback(null, obj);
    });
}

/**
 * update user by id
 *
 * @param {string} userId
 * @param {object} info
 * @param {function} callback
 */
exports.updateUserById = function(userId, info, callback){
    updateUserById(userId, info, callback);
}

/**
 * update student by id
 *
 * @param {string} userId
 * @param {object} info
 * @param {function} callback
 */
exports.updateStudentById = function(userId, info, callback){
    updateUserById(userId, info, callback);
}

/**
 * update admin by id
 *
 * @param {string} userId
 * @param {object} info
 * @param {function} callback
 */
exports.updateAdminById = function(userId, info, callback){
    updateUserById(userId, info, callback);
}

/**
 * update user by id
 *
 * @param {string} userId
 * @param {object} info
 * @param {function} callback
 */
var updateUserById = function(userId, info, callback){
    var currentDate = new Date().toString();
    var query = { _id : userId };
    var update = {};

    update.$addToSet = {};
    update.$inc = {};
    update.$pull = {};
    update.$set = { mtime : currentDate };
    update.$push = {};

    if ('username' in info) {
        update.$set.username = info.username;
    }

    if ('fname' in info) {
        update.$set.fname = info.fname;
    }

    if ('lname' in info) {
        update.$set.lname = info.lname;
    }

    if ('email' in info) {
        update.$set.email = info.email;
    }

    if ('points' in info && parseInt(info.points)) {
        update.$set.points = parseInt(info.points);
    }

    if ('rating' in info && parseInt(info.rating)) {
        update.$push.ratings = {
            question: info.questionId,
            date: currentDate,
            rating: info.rating
        }
    }

    if (typeof info.active !== 'undefined') {
        update.$set.active = info.active;
    }

    if (common.isEmptyObject(update.$addToSet)) {
        delete update.$addToSet;
    }

    if (common.isEmptyObject(update.$inc)) {
        delete update.$inc;
    }

    if (common.isEmptyObject(update.$set)) {
        delete update.$set;
    }

    if (common.isEmptyObject(update.$pull)) {
        delete update.$pull;
    }

    if (common.isEmptyObject(update.$push)) {
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

/**
 * update user password
 *
 * @param {object} query
 * @param {object} update
 * @param {string} password
 * @param {function} callback
 */
exports.updateUserPassword = function(query, update, password, callback) {
    updateUserPassword(query, update, password, callback);
}

/**
 * update user password
 *
 * @param {object} query
 * @param {object} update
 * @param {string} password
 * @param {function} callback
 */
var updateUserPassword = function(query, update, password, callback) {
    bcrypt.hash(password, 11, function(err, hash) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        if (update.$set && !common.isEmptyObject(update.$set)) {
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

/**
 * update users collection directly by a query
 *
 * @param {object} query
 * @param {object} update
 * @param {function} callback
 */
exports.updateUserByQuery = function (query, update, callback) {
    usersCollection.update(query, update, function(err, obj) {
        return callback(err, obj);
    });
}

/**
 * Questions functions
 * Add QUESTION to questionsCollection in the database
 *
 * @param {object} question
 * @param {function} callback
 */
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

/**
 * cleanup the users collection
 *
 * @param {function} callback
 */
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

/**
 * get next question number
 *
 * @param {function} callback
 */
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

/**
 * get the list of questions sorted
 *
 * @param {object} findQuery
 * @param {object} sortQuery
 * @param {function} callback
 */
exports.getQuestionsList = function(findQuery, sortQuery, callback) {
    questionsCollection.find(findQuery).sort(sortQuery).toArray(function(err, docs) {
        if (err) {
            return callback(err, null);
        }

        for (q in docs) {
            docs[q].firstAnswer = docs[q].correctAttempts[0] ? docs[q].correctAttempts[0].userId : 'No One';
        }

        return callback(null, docs);
    });
}

/**
 * Extract a question object from the database using its ID
 *
 * @param {object} findQuery
 * @param {function} callback
 */
exports.lookupQuestion = function(findQuery, callback) {
    questionsCollection.findOne(findQuery, function(err, question) {
        if (err) {
            return callback(err, null);
        }

        if (!question) {
            return callback('No question found', null);
        }

        /* necessary for later database update */
        question.firstAnswer = question.correctAttempts[0] ? question.correctAttempts[0].userId : 'No One';
        return callback(null, question);
    });
}

/**
 * update a question record based on its id
 *
 * @param {string} questionId
 * @param {object} request
 * @param {function} callback
 */
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

    if ('minpoints' in request) {
      update.$set.minpoints = request.minpoints;
    }

    if ('maxpoints' in request) {
      update.$set.maxpoints = request.maxpoints;
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

    if (common.isEmptyObject(update.$addToSet)) {
        delete update.$addToSet;
    }

    if (common.isEmptyObject(update.$push)) {
        delete update.$push;
    }

    if (common.isEmptyObject(update.$set)) {
        delete update.$set;
    }

    if (common.isEmptyObject(update.$pull)) {
        delete update.$pull;
    }

    if (common.isEmptyObject(update.$inc)) {
        delete update.$inc;
    }

    questionsCollection.update(query, update, function(err, info) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, 'success');
    });
}

/**
 * update users collection directly by a query
 *
 * @param {object} query
 * @param {object} update
 * @param {function} callback
 */
exports.updateQuestionByQuery = function (query, update, callback) {
    questionsCollection.update(query, update, function(err, obj) {
        return callback(err, obj);
    });
}

/**
 * reset all settings to default
 *
 * @param {function} callback
 */
exports.resetAllSettings = function (callback) {
    resetAllSettings(callback);
}

/**
 * reset all settings to default
 *
 * @param {function} callback
 */
var resetAllSettings = function (callback) {
    settingsCollection.remove({}, function (err, result) {
        if (err) {
            return callback(err, null);
        }

        var defaultSettings = {};
        defaultSettings._id = common.getUUID();

        defaultSettings['general'] = {};
        defaultSettings['student'] = {};
        defaultSettings['question'] = {};
        defaultSettings['discussionboard'] = {};

        defaultSettings.general['active'] = true;
        defaultSettings.general['leaderboardLimit'] = 3;

        defaultSettings.student['editNames'] = true;
        defaultSettings.student['editEmail'] = true;
        defaultSettings.student['editPassword'] = true;

        defaultSettings.question['defaultTopic'] = null;
        defaultSettings.question['defaultMinPoints'] = 10;
        defaultSettings.question['defaultMaxPoints'] = 100;
        defaultSettings.question['timeoutEnabled'] = true;
        defaultSettings.question['timeoutPeriod'] = 1;

        defaultSettings.discussionboard['visibility'] = common.discussionboardVisibility.ALL;
        defaultSettings.discussionboard['dislikesEnabled'] = true;

        settingsCollection.insert(defaultSettings, function (err, obj) {
            if (err) {
                return callback(err, null);
            }

            return callback(null, 'ok');
        });
    });
}

/**
 * get all settings objects from the collection
 *
 * @param {function} callback
 */
exports.getAllSettings = function (callback) {
    getAllSettings(callback);
}

/**
 * get all settings objects from the collection
 *
 * @param {function} callback
 */
var getAllSettings = function (callback) {
    settingsCollection.findOne({}, function (err, obj) {
        if (err) {
            return callback (err, null);
        }

        if (!obj) {
            resetAllSettings(callback);
        }

        return callback (null, obj);
    });
}

/**
 * add student analytics
 * if there are no records of the student, create a new record
 * if there are recards of the student, get the last recard and compute the deltas
 *
 * @param {string} studentId
 * @param {string} date
 * @param {object} info
 * @param {function} callback
 */
exports.addStudentAnalyticsWithDate = function (studentId, date, info, callback) {
    var query = {_id: studentId};
    var update = {};

    analyticsCollection.findOne(query, function(err, student) {
        if (err) {
            return callback(err, null);
        }

        if (!student) {
            info.correctAttemptsDelta = 0;
            info.wrongAttemptsDelta = 0;
            info.totalAttemptsDelta = 0;
            info.pointsDelta = 0;
            info.accuracyDelta = 0;
            update._id = studentId;
            update.dates = [{date: date, info: info}];

            analyticsCollection.insert(update, function(err, obj){
                if (err) {
                    return callback(err, null);
                }
                return callback(null, obj);
            });
        }

        if (student) {
            info.correctAttemptsDelta = info.correctAttemptsCount - student.dates[student.dates.length-1].info.correctAttemptsCount;
            info.wrongAttemptsDelta = info.wrongAttemptsCount - student.dates[student.dates.length-1].info.wrongAttemptsCount;
            info.totalAttemptsDelta = info.totalAttemptsCount - student.dates[student.dates.length-1].info.totalAttemptsCount;
            info.pointsDelta = info.points - student.dates[student.dates.length-1].info.points;
            info.accuracyDelta = info.accuracy - student.dates[student.dates.length-1].info.accuracy;
            update.$push = {dates: {date: date, info: info}};

            analyticsCollection.update(query, update, function(err, info) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, info);
            });
        }
    });
}

exports.getTimeBasedAnalytics = function (findQuery, callback) {
    analyticsCollection.findOne(findQuery, function (err, data) {
        if (err) {
            return callback(err, null);
        }

        if (!data) {
            return callback('invalid search query', null);
        }

        return callback(null, data);
    });
}

/**
 * update settings object
 *
 * @param {object} findQuery
 * @param {object} updateQuery
 * @param {function} callback
 */
exports.updateSettings = function (findQuery, updateQuery, callback) {
    settingsCollection.update(findQuery, updateQuery, callback);
}
