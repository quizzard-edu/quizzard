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
        if (err) {
            return callback(err, null);
        }

        return callback(null, allSettings.general.active);
    });
}

/**
 * get the limit of rows on the leaderboard
 * 
 * @param {funtion} callback 
 */
exports.getLeaderboardLimit = function (callback) {
    getAllSettings(function (err, allSettings) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, allSettings.general.leaderboardLimit);
    });
}

/**
 * check if the student can edit their first and last name
 * 
 * @param {funtion} callback 
 */
exports.getStudentEditNameEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, allSettings.student.editNames);
    });
}

/**
 * check if the student can edit their email
 * 
 * @param {funtion} callback 
 */
exports.getStudentEditEmailEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, allSettings.student.editEmail);
    });
}

/**
 * check if the student can edit their password
 * 
 * @param {funtion} callback 
 */
exports.getStudentEditPasswordEnabled = function (callback) {
    getAllSettings(function (err, allSettings) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, allSettings.student.editPassword);
    });
}

/**
 * get all settings object
 * 
 * @param {function} callback 
 */
var getAllSettings = function (callback) {
    db.getAllSettings(function (err, allSettings) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, allSettings);
    });
}