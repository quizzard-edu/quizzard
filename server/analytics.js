/*
analytics.js

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

var users = require('./users.js');
var logger = require('./log.js').logger;
var common = require('./common.js');
var db = require('./db.js');

// get charts
exports.getChart = function(query, callback) {
    switch(query.type) {
        case 'QuestionsAnsweredVsClass':
            return getQuestionsAnsweredVsClass(query, callback);
        case 'AccuracyVsClass':
            return getAccuracyVsClass(query, callback);
        case 'PointsVsClass':
            return getPointsVsClass(query, callback);
        case 'RatingVsClass':
            return getRatingVsClass(query, callback);
        default:
            return callback('notFound', null);
    }
}

// get questions answered vs class
var getQuestionsAnsweredVsClass = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var studentId = query.userId;
        var studentAnswered = 0;
        var classAnswered = 0;
        var classCount = 0;
        var classAnsweredAverage = 0;

        for (i in students) {
            if (students[i].id === studentId) {
                studentAnswered = students[i].correctAttemptsCount;
            } else {
                classAnswered += students[i].correctAttemptsCount;
                classCount++;
            }
        }

        classAnsweredAverage = Math.ceil(classAnswered / classCount);
        return callback(null, [studentAnswered, classAnsweredAverage]);
    });
}

// get questions answered vs class
var getAccuracyVsClass = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var studentId = query.userId;
        var studentAccuracy = 0;
        var classAccuracy = 0;
        var classCount = 0;
        var classAverageAccuracy = 0;

        for (i in students) {
            if (students[i].id === studentId) {
                studentAccuracy = parseFloat(students[i].totalAttemptsCount ? ((students[i].correctAttemptsCount / students[i].totalAttemptsCount)*100).toFixed(2) : 0);
            } else {
                classAccuracy += parseFloat(students[i].totalAttemptsCount ? ((students[i].correctAttemptsCount / students[i].totalAttemptsCount)*100).toFixed(2) : 0);
                classCount++;
            }
        }

        classAverageAccuracy = parseFloat(classCount ? ((classAccuracy / classCount)).toFixed(2) : 0);
        return callback(null, [studentAccuracy, classAverageAccuracy]);
    });
}

// get points vs class
var getPointsVsClass = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var studentId = query.userId;
        var studentPoints = 0;
        var classPoints = 0;
        var classCount = 0;
        var classPointsAverage = 0;

        for (i in students) {
            if (students[i].id === studentId) {
                studentPoints = students[i].points;
            } else {
                classPoints += students[i].points;
                classCount++;
            }
        }

        classPointsAverage = Math.ceil(classPoints / classCount);
        return callback(null, [studentPoints, classPointsAverage]);
    });
}

// get rating vs class
var getRatingVsClass = function(query, callback) {
    users.getUsersList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var studentId = query.userId;
        var studentRating = 0;
        var classRating = 0;
        var classCount = 0;
        var classRatingAverage = 0;

        for (i in students) {
            if (students[i].ratings.length!==0) {
                if (students[i].id === studentId) {
                    studentRating = getAverageRating(students[i].ratings);
                } else {
                    classRating += getAverageRating(students[i].ratings);
                    classCount++;
                }
            }
        }

        classRatingAverage = classRating ? Math.ceil(classRating / classCount) : 0;
        return callback(null, [studentRating, classRatingAverage]);
    });
}

// get average rating
var getAverageRating = function(ratingsList) {
    var totalRate = 0;

    for (i in ratingsList) {
        totalRate += ratingsList[i].rating;
    }

    return Math.ceil(totalRate / ratingsList.length);
}

/*
add student analytics
if there are no records of the student, create a new record
if there are recards of the student, get the last recard and compute the deltas
*/
exports.addStudentAnalyticsWithDate = function (studentId, date, info, callback) {
    db.addStudentAnalyticsWithDate(studentId, date, info, callback);
}
