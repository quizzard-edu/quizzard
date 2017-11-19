/*
users.js

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

var bcrypt = require('bcryptjs');
var db = require('./db.js');
var logger = require('./log.js');
var common = require('./common.js');

/**
 * Create a student USER, if the USER object is valid
 *
 * @param {object} user
 * @param {function} callback
 */
exports.addAdmin = function (user, callback) {
    if (!user.fname || !user.lname || !user.username || !user.password) {
        logger.error('Failed to create a new admin, missing requirements');
        return callback('failure', null);
    }

    bcrypt.hash(user.password, 11, function(err, hash) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        var currentDate = new Date().toString();
        var userToAdd = {};

        userToAdd._id = common.getUUID();
        userToAdd.username = user.username.toLowerCase();
        userToAdd.fname = user.fname;
        userToAdd.lname = user.lname;
        userToAdd.ctime = currentDate;
        userToAdd.atime = currentDate;
        userToAdd.mtime = currentDate;
        userToAdd.email = user.email ? user.email : '';
        userToAdd.type = common.userTypes.ADMIN;
        userToAdd.password = hash;
        userToAdd.active = true;
        userToAdd.ratings = [];

        db.addAdmin(userToAdd, function (err, userObj) {
            if(err){
                if (err === 'failure') {
                    logger.error(common.formatString('Failed to create admin {0}, database issue', [userToAdd.username]));
                } else if (err === 'exists') {
                    logger.error(common.formatString('Admin {0} already exists', [userToAdd.username]));
                }
                return callback(err, null);
            }

            common.mkdir(common.fsTree.USERS, userToAdd._id, function (err, result) {
                logger.log(common.formatString('Creating user {0} directory: {1} {2}', [userToAdd.username, userToAdd._id, err ? err : result]));
            });

            logger.log(common.formatString('Admin {0} created', [userToAdd.username]));
            return callback(null, userObj);
        });
    });
}

/**
 * Create a student USER, if the USER object is valid
 *
 * @param {object} user
 * @param {function} callback
 */
exports.addStudent = function (user, callback) {
    if (!user.fname || !user.lname || !user.username || !user.password) {
        logger.error('Failed to create a new student, missing requirements');
        return callback('failure', null);
    }

    bcrypt.hash(user.password, 11, function (err, hash) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        var currentDate = new Date().toString();
        var userToAdd = {};

        userToAdd._id = common.getUUID();
        userToAdd.username = user.username.toLowerCase();
        userToAdd.fname = user.fname;
        userToAdd.lname = user.lname;
        userToAdd.ctime = currentDate;
        userToAdd.atime = currentDate;
        userToAdd.mtime = currentDate;
        userToAdd.email = user.email ? user.email : '';
        userToAdd.type = common.userTypes.STUDENT;
        userToAdd.password = hash;
        userToAdd.active = true;
        userToAdd.ratings = [];

        userToAdd.points = 0.0;
        userToAdd.correctAttempts = [];
        userToAdd.wrongAttempts = [];
        userToAdd.totalAttempts = [];
        userToAdd.correctAttemptsCount = 0;
        userToAdd.wrongAttemptsCount = 0;
        userToAdd.totalAttemptsCount = 0;

        db.addStudent(userToAdd, function (err, userObj) {
            if (err) {
                if (err === 'failure') {
                    logger.error(common.formatString('Failed to create student {0}, database issue', [userToAdd.username]));
                } else if (err === 'exists') {
                    logger.error(common.formatString('Student {0} already exists', [userToAdd.username]));
                }

                return callback(err, null);
            }

            common.mkdir(common.fsTree.USERS, userToAdd._id, function (err, result) {
                logger.log(common.formatString('Creating user {0} directory: {1} {2}', [userToAdd.username, userToAdd._id, err ? err : result]));
            });

            logger.log(common.formatString('Student {0} created', [userToAdd.username]));
            return callback(null, userObj);
        });
    });
}

/**
 * Update the account with ID userid in the student database.
 * The user argument holds the complete new object to insert.
 * Fail if the ID has changed and the new ID already belongs
 * to a user.
 *
 * @param {string} userId
 * @param {object} info
 * @param {function} callback
 */
exports.updateUserById = function (userId, info, callback) {
    db.updateUserById(userId, info, callback);
}

/**
 * update student by id
 *
 * @param {string} userId
 * @param {object} info
 * @param {function} callback
 */
exports.updateStudentById = function (userId, info, callback) {
    db.updateStudentById(userId, info, callback);
}

/**
 * update admin by id
 *
 * @param {string} userId
 * @param {object} info
 * @param {function} callback
 */
exports.updateAdminById = function (userId, info, callback) {
    db.updateAdminById(userId, info, callback);
}

/**
 * Return an array of users in the database.
 *
 * @param {function} callback
 */
exports.getAdminsList = function (callback) {
    db.getAdminsList(callback);
}

/**
 * get students list
 *
 * @param {function} callback
 */
exports.getStudentsList = function (callback) {
    db.getStudentsList(callback);
}

/**
 * get students list with status
 *
 * @param {boolean} active
 * @param {function} callback
 */
exports.getStudentsListWithStatus = function (active, callback) {
    db.getStudentsListWithStatus(active, callback);
}

/**
 * get users list
 *
 * @param {function} callback
 */
exports.getUsersList = function (callback) {
    db.getUsersList(callback);
}

/**
 * Return an array of users in the database, sorted by rank.
 *
 * @param {int} lim
 * @param {function} callback
 */
var getStudentsListSorted = function (lim, callback) {
    db.getStudentsListSorted(lim, callback);
}
exports.getStudentsListSorted = getStudentsListSorted;

/**
 * Check if the account given by user and pass is valid.
 * Return account object if it is or null otherwise.
 *
 * @param {string} username
 * @param {string} pass
 * @param {function} callback
 */
exports.checkLogin = function (username, pass, callback) {
    db.checkLogin(username, pass, callback);
}

/**
 * Fetch the user object with ID iserId in the users database.
 *
 * @param {string} userId
 * @param {function} callback
 */
exports.getUserById = function (userId, callback){
    db.getUserById(userId, callback);
}

/**
 * get the admin object by Id if exists
 *
 * @param {string} studentId
 * @param {function} callback
 */
exports.getStudentById = function (studentId, callback) {
    db.getStudentById(studentId, callback);
}

/**
 * get the admin object by Id if exists
 *
 * @param {string} adminId
 * @param {function} callback
 */
exports.getAdminById = function (adminId, callback) {
    db.getStudentById(adminId, callback);
}

/**
 * submit user's answer on a question by updating the collections
 *
 * @param {string} userId
 * @param {string} questionId
 * @param {boolean} correct
 * @param {int} points
 * @param {string} answer
 * @param {function} callback
 */
exports.submitAnswer = function (userId, questionId, correct, points, answer, callback) {
    var currentDate = new Date().toString();
    var query = { _id : userId };
    var update = {};

    update.$inc = {};
    update.$set = { mtime : currentDate };
    update.$push = {};

    query['correctAttempts.questionId'] = { $ne : questionId };
    if (correct) {
        update.$inc.points = points;
        update.$inc.correctAttemptsCount = 1;
        update.$push.correctAttempts = {
            questionId : questionId,
            points : points,
            answer : answer,
            date : currentDate
        };
    } else {
        update.$inc.wrongAttemptsCount = 1;
        update.$push.wrongAttempts = {
            questionId : questionId,
            attempt : answer,
            date : currentDate
        };
    }
    update.$inc.totalAttemptsCount = 1;
    update.$push.totalAttempts = {
        questionId : questionId,
        attempt : answer,
        date : currentDate
    };

    if (common.isEmptyObject(update.$inc)) {
        delete update.$inc;
    }

    if (common.isEmptyObject(update.$set)) {
        delete update.$set;
    }

    if (common.isEmptyObject(update.$push)) {
        delete update.$push;
    }

    db.updateUserByQuery(query, update, function (err,result) {
        return callback(err, result);
    });
}

/**
 * Fetch the question list of userId
 *
 * @param {object} request
 * @param {function} callback
 */
exports.getQuestionsListByUser = function (request, callback) {
    var questionsQuery = {};
    var sortQuery = {number: 1};
    var user = request.user;
    var questionsStatus = request.questionsStatus;

    if (!user) {
        return callback('No user object', null);
    }

    if (user.type === common.userTypes.ADMIN) {
        db.getQuestionsList(questionsQuery, sortQuery, function (err, docs){
            return callback(err, docs);
        });
    }

    if (user.type === common.userTypes.STUDENT) {
        questionsQuery.visible = true;

        db.getQuestionsList(questionsQuery, sortQuery, function (err, docs) {
            if (err) {
                return callback(err, null);
            }

            var compareList = common.getIdsListFromJSONList(user.correctAttempts, 'questionId');
            var answeredList = [];
            var unansweredList = [];

            for (q in docs) {
                if (compareList.indexOf(docs[q]._id) === -1) {
                    unansweredList.push(docs[q]);
                } else {
                    answeredList.push(docs[q]);
                }
            }

            var returnList = (questionsStatus === 'answered') ? answeredList : unansweredList;
            return callback(null, returnList);
        });
    }
}

/**
 * set the status of the user to active or in-active
 *
 * @param {string} studentId
 * @param {boolean} newStatus
 * @param {function} callback
 */
exports.setUserStatus = function (studentId, newStatus, callback) {
    db.updateUserById(studentId,{active: newStatus}, callback);
}

/**
 * adding rating to question collection
 *
 * @param {string} userId
 * @param {string} questionId
 * @param {int} rating
 * @param {function} callback
 */
exports.submitRating = function (userId, questionId, rating, callback) {
    db.updateUserById(userId, {questionId: questionId, rating: rating}, callback);
}

/**
 * update user's profile based on the given infomation
 *
 * @param {string} userId
 * @param {object} request
 * @param {function} callback
 */
exports.updateProfile = function (userId, request, callback) {
    var query = {_id: userId};
    var update = {};

    update.$set = {};

    if (request.newemail) {
        update.$set.email = request.newemail;
    }

    if (request.newpassword) {
        update.$set.password = request.newpassword;
        return db.updateUserPassword(query, update, request.newpassword, function (err, result) {
            return callback(err, result);
        });
    }

    db.updateUserByQuery(query, update, function (err,result) {
        return callback(err, result);
    });
}

/**
 * Fetch a list of students to display in the leaderboard.
 * The list is sorted by decreasing points.
 * Add rank to each student entry.
 *
 * If shrt is true, return leaderboard with max eight entries.
 *
 * @param {string} userid
 * @param {boolean} shrt
 * @param {function} callback
 */
exports.getLeaderboard = function (userid, shrt, callback) {
    getStudentsListSorted(0, function(err, studentlist) {
        if (err) {
            logger.error(err);
            return (err, []);
        }

        var rank = 0;
        var last = -1;
        var userind;

        /* assign ranks to each student */
        for (var i = 0; i < studentlist.length; ++i) {
            /* subsequent users with same amount of points have same rank */
            if (studentlist[i].points !== last) {
                rank = i + 1;
                last = studentlist[i].points;
            }
            studentlist[i].rank = rank;

            if (studentlist[i]._id === userid) {
                userind = i;
            }
        }

        if (shrt) {
            if (studentlist.length < 8) {
                callback(studentlist);
                return;
            }

            var lb = [];
            /* represents a '...' entry in the leaderboard table */
            var dots = { rank: 0 };

            /*
             * If the user is in the top 6, display the top seven
             * students, followed by "...".
             */
            if (userind < 6) {
                for (var i = 0; i < 7; ++i) {
                    lb.push(studentlist[i]);
                }
                lb.push(dots);
            } else {
                /* The top 3 students are always displayed. */
                lb.push(studentlist[0]);
                lb.push(studentlist[1]);
                lb.push(studentlist[2]);

                /*
                 * If the user is in the bottom four,
                 * display the whole bottom four.
                 */
                if (userind >= studentlist.length - 4) {
                    lb.push(dots);
                    for (var i = studentlist.length - 4; i < studentlist.length; ++i) {
                        lb.push(studentlist[i]);
                    }
                } else {
                    /*
                     * Otherwise, display the user with the
                     * students directly above and below them.
                     */
                    lb.push(dots);
                    lb.push(studentlist[userind - 1]);
                    lb.push(studentlist[userind]);
                    lb.push(studentlist[userind + 1]);
                    lb.push(dots);
                }
            }
            callback(lb);
        } else {
            callback(studentlist);
        }
    });
}