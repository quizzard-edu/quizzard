/*
settings.js

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

const db = require('./db.js');
const logger = require('./log.js');
const common = require('./common.js');

/**
 * reset the global settings to their default values
 *
 * @param {function} callback
 */
exports.resetAllSettings = function (callback) {
    db.resetAllSettings (callback);
}

/**
 * check if the class is active
 *
 * @param {funtion} callback
 */
exports.getClassActive = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.general.active);
    });
}

/**
 * set class activation status
 *
 * @param {boolean} isActive
 * @param {funtion} callback
 */
exports.setClassActive = function (isActive, callback) {
    if (Object.prototype.toString.call(isActive) !== '[object Boolean]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'general.active': isActive}}, callback);
}

/**
 * get the limit of rows on the leaderboard
 *
 * @param {funtion} callback
 */
exports.getLeaderboardLimit = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.general.leaderboardLimit);
    });
}

/**
 * set leaderboard limit
 *
 * @param {number} limit
 * @param {funtion} callback
 */
exports.setLeaderboardLimit = function (limit, callback) {
    if (Object.prototype.toString.call(limit) !== '[object Number]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'general.leaderboardLimit': limit}}, callback);
}

/**
 * check if the student can edit their first and last name
 *
 * @param {funtion} callback
 */
exports.getStudentEditNameEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.student.editNames);
    });
}

/**
 * set student edit name enabled
 *
 * @param {boolean} isActive
 * @param {funtion} callback
 */
exports.setStudentEditNameEnabled = function (isActive, callback) {
    if (Object.prototype.toString.call(isActive) !== '[object Boolean]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'student.editNames': isActive}}, callback);
}

/**
 * check if the student can edit their email
 *
 * @param {funtion} callback
 */
exports.getStudentEditEmailEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.student.editEmail);
    });
}

/**
 * set student edit email enabled
 *
 * @param {boolean} isActive
 * @param {funtion} callback
 */
exports.setStudentEditEmailEnabled = function (isActive, callback) {
    if (Object.prototype.toString.call(isActive) !== '[object Boolean]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'student.editEmail': isActive}}, callback);
}

/**
 * check if the student can edit their password
 *
 * @param {funtion} callback
 */
exports.getStudentEditPasswordEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.student.editPassword);
    });
}

/**
 * set student edit password enabled
 *
 * @param {boolean} isActive
 * @param {funtion} callback
 */
exports.setStudentEditPasswordEnabled = function (isActive, callback) {
    if (Object.prototype.toString.call(isActive) !== '[object Boolean]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'student.editPassword': isActive}}, callback);
}

/**
 * get question default topic
 *
 * @param {funtion} callback
 */
exports.getQuestionDefaultTopic = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.question.defaultTopic);
    });
}

/**
 * set question default topic
 *
 * @param {string} topic
 * @param {funtion} callback
 */
exports.setQuestionDefaultTopic = function (topic, callback) {
    if (Object.prototype.toString.call(topic) !== '[object String]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'question.defaultTopic': topic}}, callback);
}

/**
 * get question default min points
 *
 * @param {funtion} callback
 */
exports.getQuestionDefaultMinPoints = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.question.defaultMinPoints);
    });
}

/**
 * get question default min points
 *
 * @param {number} points
 * @param {funtion} callback
 */
exports.setQuestionDefaultMinPoints = function (points, callback) {
    if (Object.prototype.toString.call(points) !== '[object Number]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'question.defaultMinPoints': points}}, callback);
}

/**
 * get question default max points
 *
 * @param {funtion} callback
 */
exports.getQuestionDefaultMaxPoints = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.question.defaultMaxPoints);
    });
}

/**
 * get question default max points
 *
 * @param {number} points
 * @param {funtion} callback
 */
exports.setQuestionDefaultMinPoints = function (points, callback) {
    if (Object.prototype.toString.call(points) !== '[object Number]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'question.defaultMaxPoints': points}}, callback);
}

/**
 * get question timeout enabled
 *
 * @param {funtion} callback
 */
exports.getQuestionTimeoutEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.question.timeoutEnabled);
    });
}

/**
 * set question timeout enabled
 *
 * @param {boolean} isActive
 * @param {funtion} callback
 */
exports.setQuestionTimeoutEnabled = function (isActive, callback) {
    if (Object.prototype.toString.call(isActive) !== '[object Boolean]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'question.timeoutEnabled': isActive}}, callback);
}

/**
 * get question timeout period
 *
 * @param {funtion} callback
 */
exports.getQuestionTimeoutPeriod = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.question.timeoutPeriod);
    });
}

/**
 * set question timeout period
 *
 * @param {number} timeout
 * @param {funtion} callback
 */
exports.setQuestionTimeoutPeriod = function (timeout, callback) {
    if (Object.prototype.toString.call(timeout) !== '[object Number]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'question.timeoutPeriod': timeout}}, callback);
}

/**
 * get discussionboard visibility enabled
 *
 * @param {funtion} callback
 */
exports.getDiscussionboardVisibilityEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.discussionboard.visibility);
    });
}

/**
 * set discussionboard visibility enabled
 *
 * @param {boolean} isActive
 * @param {funtion} callback
 */
exports.setDiscussionboardVisibilityEnabled = function (isActive, callback) {
    if (Object.prototype.toString.call(isActive) !== '[object Boolean]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'discussionboard.visibility': isActive}}, callback);
}

/**
 * get discussionboard dislikes enabled
 *
 * @param {funtion} callback
 */
exports.getDiscussionboardDislikesEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings.discussionboard.dislikesEnabled);
    });
}

/**
 * set discussionboard dislikes enabled
 *
 * @param {boolean} isActive
 * @param {funtion} callback
 */
exports.setDiscussionboardDislikesEnabled = function (isActive, callback) {
    if (Object.prototype.toString.call(isActive) !== '[object Boolean]') {
        return callback('Invalid input', null);
    }

    updateSettings({$set: {'discussionboard.dislikesEnabled': isActive}}, callback);
}

/**
 * get all settings object
 *
 * @param {function} callback
 */
exports.getAllSettings = function (callback) {
    getAllSettings(callback);
}

/**
 * get all settings object
 *
 * @param {function} callback
 */
var getAllSettings = function (callback) {
    db.getAllSettings(function (err, allSettings) {
        return callback(err ? err : null, err ? null : allSettings);
    });
}

/**
 * update settings object
 *
 * @param {object} updateQuery
 * @param {function} callback
 */
var updateSettings = function (updateQuery, callback) {
    db.updateSettings({}, updateQuery, callback);
}