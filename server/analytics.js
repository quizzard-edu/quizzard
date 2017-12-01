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

const users = require('./users.js');
const logger = require('./log.js');
const common = require('./common.js');
const db = require('./db.js');

const classId = 'class';

/**
 * start the analytics daily process
 *
 * @param {function} callback
 */
exports.initialize = function(callback) {
    getAnalytics(callback);
}

/**
 * get the charts based on type
 *
 * @param {object} query
 * @param {function} callback
 */
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
        case 'classAnswered':
            return getClassAnswered(query, callback);
        case 'classAccuracy':
            return getClassAccuracy(query, callback);
        case 'classPoints':
            return getClassPoints(query, callback);
        case 'classRating':
            return getClassRating(query, callback);
        case 'correctAttemptsOverTime':
            return getCorrectAttemptsOverTime(query, callback);
        case 'accuracyOverTime':
            return getAccuracyOverTime(query, callback);
        case 'pointsOverTime':
            return getPointsOverTime(query, callback);
        default:
            return callback('notFound', null);
    }
}

/**
 * get analytics for a admins
 *
 * @param {function} callback
 */
var getAnalytics = function(callback) {
    var studentsCount = 0;
    var classObject = {
        correctAttemptsCount: 0,
        wrongAttemptsCount: 0,
        totalAttemptsCount: 0,
        points: 0,
        accuracy: 0
    };
    var currentDate = common.getDate();

    users.getFullLeaderboard(function (err, leaderboardList) {
        if (err) {
            logger.error(err);
            return callback(err, null);
        }

        var overallList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'overall'), '_id');
        var attemptList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'attempt'), '_id');
        var accuracyList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'accuracy'), '_id');
        var pointsList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'points'), '_id');
        users.getStudentsList(function (err, studentsList) {
            if (err) {
                logger.error(err);
                return callback(err, null);
            }

            for (var i in studentsList) {
                var student = studentsList[i];
                var row = {};

                row.correctAttemptsCount = student.correctAttemptsCount;
                row.wrongAttemptsCount = student.wrongAttemptsCount;
                row.totalAttemptsCount = student.totalAttemptsCount;
                row.points = student.points;
                row.accuracy = student.totalAttemptsCount === 0 ? 0 : ((student.correctAttemptsCount / student.totalAttemptsCount) * 100).toFixed(2);
                row.overallRank = overallList.indexOf(student._id);
                row.attemptRank = attemptList.indexOf(student._id);
                row.accuracyRank = accuracyList.indexOf(student._id);
                row.pointsRank = pointsList.indexOf(student._id);

                classObject.correctAttemptsCount += student.correctAttemptsCount;
                classObject.wrongAttemptsCount += student.wrongAttemptsCount;
                classObject.totalAttemptsCount += student.totalAttemptsCount;
                classObject.points += student.points;

                addStudentAnalyticsWithDate(
                    student._id,
                    currentDate,
                    row,
                    function (err, result) {
                        if (err) {
                            logger.error(err);
                            return callback(err, null);
                        }

                        studentsCount++;
                        if (studentsCount === studentsList.length-1) {
                            classObject.correctAttemptsCount += studentsCount === 0 ? 0 :  (classObject.correctAttemptsCount / studentsCount).toFixed(0);
                            classObject.wrongAttemptsCount += studentsCount === 0 ? 0 :  (classObject.wrongAttemptsCount / studentsCount).toFixed(0);
                            classObject.totalAttemptsCount += studentsCount === 0 ? 0 :  (classObject.totalAttemptsCount / studentsCount).toFixed(0);
                            classObject.accuracy = classObject.totalAttemptsCount === 0 ? 0 :  ((classObject.correctAttemptsCount / classObject.totalAttemptsCount) * 100).toFixed(2);
                            classObject.points = studentsCount === 0 ? 0 :  (classObject.points / studentsCount).toFixed(0);

                            addStudentAnalyticsWithDate(
                                classId,
                                currentDate,
                                classObject,
                                function (err, result) {
                                    if (err) {
                                        logger.error(err);
                                        return callback(err, null);
                                    }

                                    logger.log('Finished updating analytics, everything looks fine.');
                                    return callback(null, 'ok');
                                }
                            );
                        }
                    }
                );
            }
        });
    });
}


/**
 * sort leaderboard based on criteria
 *
 * @param {list} list
 * @param {string} criteria
 */
var sortLeaderBoard = function(list, criteria) {
    return list.sort(function(student1,student2){
        return student2[criteria] - student1[criteria];
    });
}

/**
 * clean all previous analytics data
 *
 * @param {function} callback
 */
exports.removeAnalytics = function (callback) {
    db.removeAnalytics(callback);
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
var addStudentAnalyticsWithDate = function (studentId, date, info, callback) {
    db.addStudentAnalyticsWithDate(studentId, date, info, callback);
}

/**
 * get the list of data on the user by date
 *
 * @param {object} findQuery
 * @param {function} callback
 */
var getTimeBasedAnalytics = function (findQuery, callback) {
    db.getTimeBasedAnalytics(findQuery, callback);
}

/**
 * get questions answered vs class
 *
 * @param {object} query
 * @param {function} callback
 */
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
            if (students[i]._id === studentId) {
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

/**
 * get questions answered vs class
 *
 * @param {object} query
 * @param {function} callback
 */
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
            if (students[i]._id === studentId) {
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

/**
 * get points vs class
 *
 * @param {object} query
 * @param {function} callback
 */
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
            if (students[i]._id === studentId) {
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

/**
 * get rating vs class
 *
 * @param {object} query
 * @param {function} callback
 */
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
            if (students[i].ratings.length !== 0) {
                if (students[i]._id === studentId) {
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

/**
 * get average rating
 *
 * @param {list} ratingsList
 */
var getAverageRating = function(ratingsList) {
    var totalRate = 0;

    for (i in ratingsList) {
        totalRate += ratingsList[i].rating;
    }

    return Math.ceil(totalRate / ratingsList.length);
}

/**
 * get questions answered of the class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassAnswered = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var classAnswered = 0;
        var classCount = 0;
        var classAnsweredAverage = 0;

        for (i in students) {
            classAnswered += students[i].correctAttemptsCount;
            classCount++;
        }

        classAnsweredAverage = Math.ceil(classAnswered / classCount);
        return callback(null, [classAnsweredAverage]);
    });
}

/**
 * get accuracy of the class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassAccuracy = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var classAccuracy = 0;
        var classCount = 0;
        var classAverageAccuracy = 0;

        for (i in students) {
            classAccuracy += parseFloat(students[i].totalAttemptsCount ? ((students[i].correctAttemptsCount / students[i].totalAttemptsCount)*100).toFixed(2) : 0);
            classCount++;
        }

        classAverageAccuracy = parseFloat(classCount ? ((classAccuracy / classCount)).toFixed(2) : 0);
        return callback(null, [classAverageAccuracy]);
    });
}

/**
 * get points of the class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassPoints = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var classPoints = 0;
        var classCount = 0;
        var classPointsAverage = 0;

        for (i in students) {
            classPoints += students[i].points;
            classCount++;
        }

        classPointsAverage = Math.ceil(classPoints / classCount);
        return callback(null, [classPointsAverage]);
    });
}

/**
 * get rating of the class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassRating = function(query, callback) {
    users.getUsersList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var classRating = 0;
        var classCount = 0;
        var classRatingAverage = 0;

        for (i in students) {
            if (students[i].ratings.length !== 0) {
                classRating += getAverageRating(students[i].ratings);
                classCount++;
            }
        }

        classRatingAverage = classRating ? Math.ceil(classRating / classCount) : 0;
        return callback(null, [classRatingAverage]);
    });
}

/**
 * get number correct attempts of user over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getCorrectAttemptsOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }
        getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
            if (err) {
                return callback(err, null);
            }

            var dates = [];
            var studentData = [];
            var classData = [];

            for (var i = 0; i < classObject.dates.length - studentObject.dates.length; i++) {
                studentData.push(0);
            }

            for (var i = 0; i < studentObject.dates.length; i++) {
                studentData.push(studentObject.dates[i].info.correctAttemptsCount);
            }

            for (var i = 0; i < classObject.dates.length; i++) {
                dates.push(classObject.dates[i].date);
                classData.push(classObject.dates[i].info.correctAttemptsCount);
            }

            return callback(null, {
                dates: dates,
                studentData: studentData,
                classData: classData
            });
        });
    });
}

/**
 * get accuracy of user over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getAccuracyOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }
        getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
            if (err) {
                return callback(err, null);
            }

            var dates = [];
            var studentData = [];
            var classData = [];

            for (var i = 0; i < classObject.dates.length - studentObject.dates.length; i++) {
                studentData.push(0);
            }

            for (var i = 0; i < studentObject.dates.length; i++) {
                studentData.push(studentObject.dates[i].info.accuracy);
            }

            for (var i = 0; i < classObject.dates.length; i++) {
                dates.push(classObject.dates[i].date);
                classData.push(classObject.dates[i].info.accuracy);
            }

            return callback(null, {
                dates: dates,
                studentData: studentData,
                classData: classData
            });
        });
    });
}

/**
 * get points of user over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getPointsOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }
        getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
            if (err) {
                return callback(err, null);
            }

            var dates = [];
            var studentData = [];
            var classData = [];

            for (var i = 0; i < classObject.dates.length - studentObject.dates.length; i++) {
                studentData.push(0);
            }

            for (var i = 0; i < studentObject.dates.length; i++) {
                studentData.push(studentObject.dates[i].info.points);
            }

            for (var i = 0; i < classObject.dates.length; i++) {
                dates.push(classObject.dates[i].date);
                classData.push(classObject.dates[i].info.points);
            }

            return callback(null, {
                dates: dates,
                studentData: studentData,
                classData: classData
            });
        });
    });
}
