/*
Copyright (C) 2016
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

const bcrypt = require('bcryptjs');
const db = require('./db.js');
const logger = require('./log.js');
const common = require('./common.js');
const settings = require('./settings.js');
const vfs = require('./virtualFileSystem.js');

/**
 * Create a student USER, if the USER object is valid
 *
 * @param {object} user
 * @param {function} callback
 */
exports.addAdmin = function (user, callback) {
    if (!user.fname || !user.lname || !user.username || !user.password) {
        logger.error('Failed to create a new admin, missing requirements');
        return callback(common.getError(2005), null);
    }

    bcrypt.hash(user.password, 11, function(err, hash) {
        if (err) {
            logger.error(err);
            return callback(common.getError(1009), null);
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
        userToAdd.picture = null;
        userToAdd.ratings = [];

        db.addAdmin(userToAdd, function (err, userObj) {
            if(err){
                if (err === 'failure') {
                    logger.error(common.formatString('Failed to create admin {0}, database issue', [userToAdd.username]));
                } else if (err === 'exists') {
                    logger.error(common.formatString('Admin {0} already exists', [userToAdd.username]));
                }
                return callback(common.getError(2005), null);
            }

            vfs.mkdir(common.vfsTree.USERS, userToAdd._id, common.vfsPermission.OWNER, function (err, result) {
                logger.log(common.formatString('Creating user {0} directory: {1} {2}', [userToAdd.username, userToAdd._id, err ? err : 'ok']));
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
        return callback(common.getError(2007), null);
    }

    bcrypt.hash(user.password, 11, function (err, hash) {
        if (err) {
            logger.error(err);
            return callback(common.getError(1009), null);
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
        userToAdd.picture = null;
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

            vfs.mkdir(common.vfsTree.USERS, userToAdd._id, common.vfsPermission.OWNER, function (err, result) {
                logger.log(common.formatString('Creating user {0} directory: {1} {2}', [userToAdd.username, userToAdd._id, err ? err : 'ok']));
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
 * get the user object by username if exists
 *
 * @param {string} adminId
 * @param {function} callback
 */
exports.getUserByUsername = function (username, callback) {
    db.getUserObject({username: username}, callback);
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
        return callback(common.getError(2009), null);
    }

    if (user.type === common.userTypes.ADMIN) {
        if (typeof request.active !== 'boolean') {
            return callback(common.getError(1000), null);
        }
        db.getQuestionsListforAdmin({'deleted':{$ne:request.active}}, sortQuery, function (err, docs){
            return callback(err, docs);
        });
    }

    if (user.type === common.userTypes.STUDENT) {
        questionsQuery.visible = true;

        db.getQuestionsList(questionsQuery, sortQuery, function (err, docs) {
            if (err) {
                return callback(common.getError(3017), null);
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

    if (request.newfname) {
        update.$set.fname = request.newfname;
    }

    if (request.newlname) {
        update.$set.lname = request.newlname;
    }

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
 *
 * If smallBoard is true, return points leaderboard with top 3 entries.
 *
 * @param {string} userid
 * @param {boolean} smallBoard
 * @param {function} callback
 */
exports.getLeaderboard = function (userid, smallBoard, callback) {
    getStudentsListSorted(0, function(err, studentlist) {
        if (err) {
            logger.error('Leaderboard error: ' + err);
            return callback(common.getError(2020), []);
        }

        var leaderboardList = [];

        if (smallBoard) {
            var rank;
            var prevRank;

            for (var i = 0; i < studentlist.length; ++i) {
                var currentStudent = studentlist[i];

                // Students with the same number of points have the same rank
                if (i === 0) {
                    rank = 1;
                    prevRank = rank;
                } else {
                    if (studentlist[i - 1].points === currentStudent.points) {
                        rank = prevRank;
                    } else {
                        rank = i + 1;
                        prevRank = rank;
                    }
                }

                var student = {
                    displayName:`${currentStudent.fname} ${currentStudent.lname[0]}.`,
                    points:currentStudent.points,
                    userRank: rank
                }

                // Adds the current student to the mini leaderboard
                if (currentStudent._id === userid) {
                    leaderboardList.push(student);
                }

                // Push only students with the top 3 number of poitns to mini leaderboard
                if (i < 3 && currentStudent._id !== userid) {
                    leaderboardList.push(student);
                }
            }
        }

        else {
            // This is the number of people that will be shown on the leaderboard
            leaderboardLimit = settings.getLeaderboardLimit();

            for (var i = 0; i < leaderboardLimit; ++i) {
                var currentStudent = studentlist[i];

                var student = {
                    displayName:`${currentStudent.fname} ${currentStudent.lname[0]}.`,
                    picture: currentStudent.picture,
                    points:currentStudent.points,
                    accuracy:(currentStudent.totalAttemptsCount === 0)
                        ? 0
                        : ((currentStudent.correctAttemptsCount / currentStudent.totalAttemptsCount) * 100).toFixed(2),
                    attempt:(currentStudent.totalAttemptsCount === 0)
                        ? 0
                        : (currentStudent.points / currentStudent.totalAttemptsCount).toFixed(2),
                    overall:(currentStudent.totalAttemptsCount === 0)
                        ? 0
                        : (currentStudent.points *
                        ((currentStudent.correctAttemptsCount/currentStudent.totalAttemptsCount) +
                        (currentStudent.points/currentStudent.totalAttemptsCount))).toFixed(2)
                }

                leaderboardList.push(student);
            }
        }
        return callback(err, leaderboardList);
    });
}

/**
 * Fetch a list of students to display in the leaderboard.
 *
 * @param {function} callback
 */
exports.getFullLeaderboard = function (callback) {
    getStudentsListSorted(0, function(err, studentlist) {
        if (err) {
            logger.error('Leaderboard error: ' + err);
            return callback(common.getError(2020), []);
        }

        var leaderboardList = [];
        for (var i = 0; i < studentlist.length; ++i) {
            var currentStudent = studentlist[i];
            var student = {
                _id:currentStudent._id,
                points:currentStudent.points,
                correctAttemptsCount:currentStudent.correctAttemptsCount,
                accuracy:(currentStudent.totalAttemptsCount === 0)
                    ? 0
                    : ((currentStudent.correctAttemptsCount / currentStudent.totalAttemptsCount) * 100).toFixed(2),
                attempt:(currentStudent.totalAttemptsCount === 0)
                    ? 0
                    : (currentStudent.points / currentStudent.totalAttemptsCount).toFixed(2),
                overall:(currentStudent.totalAttemptsCount === 0)
                    ? 0
                    : (currentStudent.points *
                    ((currentStudent.correctAttemptsCount/currentStudent.totalAttemptsCount) +
                    (currentStudent.points/currentStudent.totalAttemptsCount))).toFixed(2)
            }
            leaderboardList.push(student);
        }
        return callback(err, leaderboardList);
    });
}

/**
 * Adds the user's feedback into the database
 *
 * @param {string} uuid
 * @param {string} subject
 * @param {string} message
 * @param {funciton} callback
 */
exports.addFeedback = function(uuid, subject, message, callback) {

    if (!uuid || !subject || !message) {
        logger.error('Failed to add user feedback, missing requirements');
        return callback(common.getError(8000), null);
    }

    var feedback = {};

    feedback.uuid = uuid;
    feedback.subject = subject;
    feedback.message = message;
    feedback.time = common.getDate();

    db.addFeedback(feedback, function(err, result) {
        if (err) {
            return callback(common.getError(8000), null);
        }

        return callback(null, 'success');
    });
}

/**
 * Get all the feedback stored in the collection
 *
 * @param {function} callback
 */
exports.getFeedback = function (callback) {
    db.getFeedback(callback);
}

exports.updateUserPicture = function (userId, pictureId, callback) {
    db.updateUserByQuery({_id: userId}, {$set: {picture: pictureId}}, callback);
}
