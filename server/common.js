/*
common.js

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

const uuidv1 = require('uuid/v1');
const fs = require('fs');
const date = require('moment');
const path = require('path');
const rimraf = require('rimraf');

// <Global Constants> ------------------------------------------
// common path shared across the backend
const fsTree = Object.freeze({
    ROOT: __dirname + '/..',
    HOME: __dirname + '/../FileSystem',
    USERS: __dirname + '/../FileSystem/Users',
    QUESTIONS: __dirname + '/../FileSystem/Questions'
});
exports.fsTree = fsTree;

// all user types
const userTypes = Object.freeze({
    ADMIN     : 0,
    STUDENT   : 1
});
exports.userTypes = userTypes;

// all types of visibility status for the dicussionboard
const discussionboardVisibility = Object.freeze({
    NONE      : 'NONE',
    ANSWERED  : 'ANSWERED',
    ALL       : 'ALL'
});
exports.discussionboardVisibility = discussionboardVisibility;

// all question types
const questionTypes = Object.freeze({
    MULTIPLECHOICE  : {name: 'Multiple Choice', value: 'mc', template: 'question_types/mc-answer', icon: 'format_list_bulleted'},
    REGULAR         : {name: 'Regular Question', value: 're', template: 'question_types/regex-answer', icon: 'font_download'},
    TRUEFALSE       : {name: 'True and False', value: 'tf', template: 'question_types/tf-answer', icon: 'check_circle'},
    MATCHING        : {name: 'Matching', value: 'matching', template: 'question_types/matching-answer', icon: 'dashboard'},
    CHOOSEALL       : {name: 'Choose All That Apply', value: 'ca', template: 'question_types/chooseAll-answer', icon: 'format_list_bulleted'},
    ORDERING        : {name: 'Order the List', value: 'ordering', template: 'question_types/ordering-answer', icon: 'format_list_bulleted'}
});
exports.questionTypes = questionTypes;

/* the field to sort by */
const sortTypes = Object.freeze({
    SORT_NOSORT    : 0x0,
    SORT_DEFAULT   : 0x1,
    SORT_RANDOM    : 0x2,
    SORT_TOPIC     : 0x4,
    SORT_POINTS    : 0x8,
    QUERY_ANSWERED : 0x10,
    QUERY_ANSONLY  : 0x20
});
exports.sortTypes = sortTypes;

// all question attributes of any question object in the database
const questionAttributes = Object.freeze({
    DEFAULT: {
        topic                   : {type:'[object String]'},
        title                   : {type:'[object String]'},
        text                    : {type:'[object String]'},
        hint                    : {type:'[object String]'},
        minpoints               : {type:'[object Number]'},
        maxpoints               : {type:'[object Number]'},
        visible                 : {type:'[object Boolean]'},
        type                    : {type:'[object String]'}
    },
    SERVER: {
        _id                     : {type:'[object String]'},
        correctAttempts         : {type:'[object Array]'},
        wrongAttempts           : {type:'[object Array]'},
        totalAttempts           : {type:'[object Array]'},
        correctAttemptsCount    : {type:'[object Number]'},
        wrongAttemptsCount      : {type:'[object Number]'},
        totalAttemptsCount      : {type:'[object Number]'},
        ctime                   : {type:'[object String]'},
        mtime                   : {type:'[object String]'},
        ratings                 : {type:'[object Array]'},
        userSubmissionTime      : {type:'[object Array]'}
    },
    REGULAR:        {
        answer                  : {type:'[object String]'}
    },
    MULTIPLECHOICE: {
        choices                 : {type:'[object Array]'},
        answer                  : {type:'[object String]'}
    },
    TRUEFALSE: {
        answer                  : {type:'[object String]'}
    },
    MATCHING: {
        leftSide                : {type:'[object Array]'},
        rightSide               : {type:'[object Array]'}
    },
    CHOOSEALL: {
        choices                 : {type:'[object Array]'},
        answer                  : {type:'[object Array]'}
    },
    ORDERING: {
        answer                  : {type:'[object Array]'}
    },
    DATATYPES: {
        Array                   : {type:'[object Array]'},
        String                  : {type:'[object String]'},
        Number                  : {type:'[object Number]'},
        Boolean                 : {type:'[object Boolean]'},
        Object                  : {type:'[object Object]'}
    }
});
exports.questionAttributes = questionAttributes;
// </Global Constants> ------------------------------------------

// <Global Function> --------------------------------------------
/**
* shuffle the given list and return the result as a new list
*
* @return {array}
*/
var randomizeList = function (data) {
    var oldIndex, newIndex, tempHolder;

    for (oldIndex = data.length-1; oldIndex > 0; oldIndex--) {
        newIndex = Math.floor(Math.random() * (oldIndex + 1));
        tempHolder = data[oldIndex];
        data[oldIndex] = data[newIndex];
        data[newIndex] = tempHolder;
    }

    return data;
};
exports.randomizeList = randomizeList;

/**
* given a list of JSON objects that have Id as one of their feilds, return a list of Ids
*
* @return {array}
*/
var getIdsListFromJSONList = function (JSONList, idType) {
    var list = [];
    for (i in JSONList) {
        list.push(JSONList[i][idType]);
    }
    return list;
}
exports.getIdsListFromJSONList = getIdsListFromJSONList;

/**
* check if json obejct is empty
*
* @return {boolean}
*/
var isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
exports.isEmptyObject = isEmptyObject;

/**
* return the current date
*
* @return {string}
*/
var getDate = function () {
    return getDateByFormat('YYYY-MM-DD hh:mm:ss A');
}
exports.getDate = getDate;

/**
* return the current date
*
* @return {date}
*/
var getDateObject = function(){
    return new Date();
}
exports.getDateObject = getDateObject;

/**
* return the time in "<0> days, <0> hours, <0> minutes, <0> seconds" format
*
* @return {string}
*/
var getTime = function(time){
    const date = new Date(time);
    var timeString = '';
    const days = date.getUTCDate()-1;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    if (days){
        timeString += date.getUTCDate()-1 + " days, ";
    }
    if (hours){
        timeString += date.getUTCHours() + " hours, ";
    }
    if (minutes){
        timeString += date.getUTCMinutes() + " minutes, ";
    }
    if (seconds){
        timeString += date.getUTCSeconds() + " seconds";
    }
    return timeString;
}
exports.getTime = getTime;

/**
* return the current date with format
*
* @return {string}
*/
var getDateByFormat = function (format) {
    return date().format(format);
}
exports.getDateByFormat = getDateByFormat;

/**
* get a unique Id
*
* @return {string}
*/
var getUUID = function () {
    return uuidv1();
}
exports.getUUID = getUUID;

/**
 * get variable type
 *
 * @param {*} variable
 */
var getVariableType = function (variable) {
    return Object.prototype.toString.call(variable);
}
exports.getVariableType = getVariableType;

/**
* formating a string based on an array of parts of the string
*
* @return {string}
*/
var formatString = function (text, args) {
    var regex = new RegExp('{-?[0-9]+}', 'g');
    return text.replace(regex, function(item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = '{';
        } else if (intVal === -2) {
            replace = '}';
        } else {
            replace = '';
        }
        return replace;
    });
};
exports.formatString = formatString;

/**
* Returns a JSON from a list of JSONs given a key, value to search for
*
* @param {list} list
* @param {string} field
* @param {string} value
* @return {boolean}
*/
var isKeyValuePairInJsonList = function(list, field, value) {
    for (var i = 0; i < list.length; i++) {
        if (list[i][field] === value) {
            return true;
        }
    }
    return false;
}
exports.isKeyValuePairInJsonList = isKeyValuePairInJsonList;

// </Global Function> -----------------------------------------------

// <File System functions> ------------------------------------------
// make a directory given the path and the name of the new directory
var mkdir = function (parentPath, directoryName, callback) {
    var fullPath = path.join(parentPath, directoryName);
    fs.mkdir(fullPath, function (err) {
        return callback(err, err ? null : 'ok');
    });
}
exports.mkdir = mkdir;

// BE CAREFUL: remove a directory given the path and the name of the new directory
var rmdir = function (parentPath, directoryName, callback) {
    var fullPath = path.join(parentPath, directoryName);
    fs.rmdir(fullPath, function (err) {
        return callback(err, err ? null : 'ok');
    });
}
exports.rmdir = rmdir;

// BE CAREFUL: perform rm -rf on a directory
var rmrf = function (parentPath, directoryName, callback) {
    var fullPath = path.join(parentPath, directoryName);
    rimraf(fullPath, function (err) {
        return callback(err, err ? null : 'ok');
    });
}
exports.rmrf = rmrf;

// check if a directory exists
var existsSync = function (parentPath, name) {
    var fullPath = path.join(parentPath, name);
    return fs.existsSync(fullPath);
}
exports.dirExists = existsSync;
exports.fileExists = existsSync;

// write data to a fils
var writeFile = function (filePath, fileName, fileExtension, fileData, callback) {
    var fullPath = path.join(filePath, fileName) + '.' + fileExtension;
    fs.writeFile(fullPath, fileData, function (err) {
        return callback(err, err ? null : 'ok');
    });
}
exports.saveFile = writeFile;

// convert string to a path
exports.joinPath = path.join;
// </File System functions> -----------------------------------------