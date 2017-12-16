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

const users = require('./users.js');
const questions = require('./questions.js');
const logger = require('./log.js');
const common = require('./common.js');
const db = require('./db.js');

const classId = 'class';
const analyticsTimeInterval = 86400000; // 24 * 60 * 60 * 1000

var totalStudentsCount = 0;

/**
 * start the analytics daily process
 *
 * @param {function} callback
 */
exports.initialize = function(callback) {
    if (process.env.DEBUG) {
        getAnalytics(callback);
    } else {
        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        var secondsTilMidNight = ((24 * 60 * 60) - (h * 60 * 60) - (m * 60) - s) * 1000;

        setTimeout(function () {
            getAnalytics(callback);
            setInterval(function () {
                getAnalytics(callback);
            }, analyticsTimeInterval);
        }, secondsTilMidNight);

        users.getStudentsList(function (err, studentsList) {
            if (err) {
                logger.error(JSON.stringify(err));
            }
            totalStudentsCount = studentsList.length;
        });
    }
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
        case 'overallVsClass':
            return getOverallVsClass(query, callback);
        case 'pointsPerAttemptVsClass':
            return getPointsPerAttemptVsClass(query, callback);
        case 'AccuracyVsClass':
            return getAccuracyVsClass(query, callback);
        case 'PointsVsClass':
            return getPointsVsClass(query, callback);
        case 'RatingVsClass':
            return getRatingVsClass(query, callback);
        case 'classAnswered':
            return getClassAnswered(query, callback);
        case 'classPointsPerAttempt':
            return getClassPointsPerAttempt(query, callback);
        case 'classOverall':
            return getClassOverall(query, callback);
        case 'classAnsweredOverTime':
            return getClassAnsweredOverTime(query, callback);
        case 'classPointsPerAttemptOverTime':
            return getClassPointsPerAttemptOverTime(query, callback);
        case 'classOverallOverTime':
            return getClassOverallOverTime(query, callback);
        case 'classAccuracyOverTime':
            return getClassAccuracyOverTime(query, callback);
        case 'classPointsOverTime':
            return getClassPointsOverTime(query, callback);
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
        case 'overallRankOverTime':
            return getOverallRankOverTime(query, callback);
        case 'pointsRankOverTime':
            return getPointsRankOverTime(query, callback);
        case 'attemptRankOverTime':
            return getAttemptRankOverTime(query, callback);
        case 'correctAttemptRankOverTime':
            return getCorrectAttemptRankOverTime(query, callback);
        case 'accuracyRankOverTime':
            return getAccuracyRankOverTime(query, callback);
        case 'pointsPerAttemptsOverTime':
            return getPointsPerAttemptsOverTime(query, callback);
        case 'overallOverTime':
            return getOverallOverTime(query, callback);
        case 'pointsPerTopicVsClass':
            return getPointsPerTopicVsClass(query, callback);
        case 'accuracyPerTopicVsClass':
            return getAccuracyPerTopicVsClass(query, callback);
        case 'pointsPerTypeVsClass':
            return getPointsPerTypeVsClass(query, callback);
        case 'accuracyPerTypeVsClass':
            return getAccuracyPerTypeVsClass(query, callback);
        case 'classPointsPerTopicVsClass':
            return getClassPointsPerTopicVsClass(query, callback);
        case 'classAccuracyPerTopicVsClass':
            return getClassAccuracyPerTopicVsClass(query, callback);
        case 'classPointsPerTypeVsClass':
            return getClassPointsPerTypeVsClass(query, callback);
        case 'classAccuracyPerTypeVsClass':
            return getClassAccuracyPerTypeVsClass(query, callback);
        case 'classRatingPerTopicVsClass':
            return getClassRatingPerTopicVsClass(query, callback);
        case 'classRatingPerTypeVsClass':
            return getClassRatingPerTypeVsClass(query, callback);
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
    var currentDate = common.getDateFormatedMinutesAgo('YYYY-MM-DD', 1);

    users.getFullLeaderboard(function (err, leaderboardList) {
        if (err) {
            logger.error(JSON.stringify(err));
            return callback(err, null);
        }

        if (!leaderboardList || leaderboardList.length === 0) {
            logger.log('Finished updating analytics. Status: warning. (No students available/active)');
            return callback(null, 'ok');
        }

        var classCorrectAttemptsCount = 0;
        var classWrongAttemptsCount = 0;
        var classTotalAttemptsCount = 0;
        var classPoints = 0;

        var getRanks = function (query) {
            var objList = {};
            var list = sortLeaderBoard(leaderboardList, query);
            var rank = 0;
            var score = -1;
            var repeated = 1;
            for (var i = 0; i < list.length; i++) {
                if (score !== list[i][query]) {
                    score = list[i][query];
                    rank += repeated;
                    repeated = 1;
                } else {
                    repeated ++;
                }
                objList[list[i]._id] = rank;
            }
            return objList;
        }

        var overallList = getRanks('overall');
        var attemptList = getRanks('attempt');
        var accuracyList = getRanks('accuracy');
        var pointsList = getRanks('points');
        var correctAttemptsList = getRanks('correctAttemptsCount');

        var overallSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'overall'), 'overall'));
        var attemptSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'attempt'), 'attempt'));
        var accuracySum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'accuracy'), 'accuracy'));
        var pointsSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'points'), 'points'));
        var correctAttemptsSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'correctAttemptsCount'), 'correctAttemptsCount'));

        users.getStudentsList(function (err, studentsList) {
            if (err) {
                logger.error(JSON.stringify(err));
                return callback(err, null);
            }

            totalStudentsCount = studentsList.length;
            for (var i in studentsList) {
                var student = studentsList[i];
                var row = {};

                row.correctAttemptsCount = student.correctAttemptsCount;
                row.wrongAttemptsCount = student.wrongAttemptsCount;
                row.totalAttemptsCount = student.totalAttemptsCount;
                row.points = student.points;
                row.accuracy = student.totalAttemptsCount === 0 ? 0 : ((student.correctAttemptsCount / student.totalAttemptsCount) * 100).toFixed(2);

                row.overallValue = leaderboardList.find((element) => {return element._id === student._id}).overall;
                row.pointsPerAttemptValue = leaderboardList.find((element) => {return element._id === student._id}).attempt;
                row.overallRank = overallList[student._id];
                row.pointsPerAttemptRank = attemptList[student._id];
                row.accuracyRank = accuracyList[student._id];
                row.pointsRank = pointsList[student._id];
                row.correctAttemptsRank = correctAttemptsList[student._id];

                classCorrectAttemptsCount += student.correctAttemptsCount;
                classWrongAttemptsCount += student.wrongAttemptsCount;
                classTotalAttemptsCount += student.totalAttemptsCount;
                classPoints += student.points;

                addStudentAnalyticsWithDate(
                    student._id,
                    currentDate,
                    row,
                    function (err, result) {
                        if (err) {
                            logger.error(JSON.stringify(err));
                            return callback(err, null);
                        }

                        studentsCount++;
                        if (studentsCount === studentsList.length) {
                            classObject.points = studentsCount === 0 ? 0 :  (classPoints / studentsCount).toFixed(0);
                            classObject.accuracy = classCorrectAttemptsCount === 0 ? 0 :  ((classCorrectAttemptsCount / classTotalAttemptsCount) * 100).toFixed(2);

                            classObject.correctAttemptsCount = studentsCount === 0 ? 0 :  (classCorrectAttemptsCount / studentsCount).toFixed(0);
                            classObject.wrongAttemptsCount = studentsCount === 0 ? 0 :  (classWrongAttemptsCount / studentsCount).toFixed(0);
                            classObject.totalAttemptsCount = studentsCount === 0 ? 0 :  (classTotalAttemptsCount / studentsCount).toFixed(0);

                            classObject.overallAverage = studentsCount === 0 ? 0 :  (overallSum / studentsCount).toFixed(2);
                            classObject.pointsPerAttemptAverage = studentsCount === 0 ? 0 :  (attemptSum / studentsCount).toFixed(2);
                            classObject.accuracyAverage = studentsCount === 0 ? 0 :  (accuracySum / studentsCount).toFixed(2);
                            classObject.pointsAverage = studentsCount === 0 ? 0 :  (pointsSum / studentsCount).toFixed(2);
                            classObject.correctAttemptsAverage = studentsCount === 0 ? 0 :  (correctAttemptsSum / studentsCount).toFixed(2);

                            addStudentAnalyticsWithDate(
                                classId,
                                currentDate,
                                classObject,
                                function (err, result) {
                                    if (err) {
                                        logger.error(JSON.stringify(err));
                                        return callback(err, null);
                                    }

                                    logger.log('Finished updating analytics. Status: ok.');
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

        classAnsweredAverage = classCount === 0 ? 0 : Math.ceil(classAnswered / classCount);
        return callback(null, [studentAnswered, classAnsweredAverage]);
    });
}

/**
 * get questions answered vs class
 *
 * @param {object} query
 * @param {function} callback
 */
var getOverallVsClass = function(query, callback) {
    users.getFullLeaderboard(function(err, leaderboardList) {
        if (err) {
            logger.error(JSON.stringify(err));
            return callback(err, null);
        }

        var studentId = query.userId;
        var studentOverall = 0;
        var classOverall = 0;
        var classCount = 0;

        for (i in leaderboardList) {
            if (leaderboardList[i]._id === studentId) {
                studentOverall = parseFloat(leaderboardList[i].overall);
            } else {
                classOverall += parseFloat(leaderboardList[i].overall);
                classCount++;
            }
        }

        var classOverallAverage = classCount === 0 ? 0 : Math.ceil(classOverall / classCount);
        return callback(null, [studentOverall, classOverallAverage]);
    });
}

/**
 * get questions answered vs class
 *
 * @param {object} query
 * @param {function} callback
 */
var getPointsPerAttemptVsClass = function(query, callback) {
    users.getFullLeaderboard(function(err, leaderboardList) {
        if (err) {
            logger.error(JSON.stringify(err));
            return callback(err, null);
        }

        var studentId = query.userId;
        var studentPointsPerAttempt = 0;
        var classPointsPerAttempt = 0;
        var classCount = 0;

        for (i in leaderboardList) {
            if (leaderboardList[i]._id === studentId) {
                studentPointsPerAttempt = parseFloat(leaderboardList[i].attempt);
            } else {
                classPointsPerAttempt += parseFloat(leaderboardList[i].attempt);
                classCount++;
            }
        }

        var classAttemptsAverage = classCount === 0 ? 0 : Math.ceil(classPointsPerAttempt / classCount);
        return callback(null, [studentPointsPerAttempt, classAttemptsAverage]);
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

        classAverageAccuracy = classCount === 0 ? 0 : parseFloat(((classAccuracy / classCount)).toFixed(2));
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

        classPointsAverage = classCount === 0 ? 0 : Math.ceil(classPoints / classCount);
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

        classAnsweredAverage =  classCount === 0 ? 0 :Math.ceil(classAnswered / classCount);
        return callback(null, [classAnsweredAverage]);
    });
}

/**
 * get class points per attempt of the class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassPointsPerAttempt = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var classPointsPerAttempt = 0;
        var classCount = 0;
        var classPointsPerAttemptAverage = 0;

        for (i in students) {
            classPointsPerAttempt += students[i].totalAttemptsCount === 0 ? 0 : parseFloat((students[i].points / students[i].totalAttemptsCount).toFixed(2));
            classCount++;
        }

        classPointsPerAttemptAverage =  classCount === 0 ? 0 : (classPointsPerAttempt / classCount).toFixed(2);
        return callback(null, [classPointsPerAttemptAverage]);
    });
}

/**
 * get overall value of the class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassOverall = function(query, callback) {
    users.getStudentsList(function(err, students) {
        if (err) {
            return callback(err, null);
        }

        if (!students) {
            return  callback('no results', null);
        }

        var classOverall = 0;
        var classCount = 0;
        var classOverallAverage = 0;

        for (i in students) {
            classOverall += (students[i].totalAttemptsCount === 0)
            ? 0
            : parseFloat((students[i].points *
            ((students[i].correctAttemptsCount/students[i].totalAttemptsCount) +
            (students[i].points/students[i].totalAttemptsCount))).toFixed(2));
            classCount++;
        }

        classOverallAverage =  classCount === 0 ? 0 : (classOverall / classCount).toFixed(2);
        return callback(null, [classOverallAverage]);
    });
}

/**
 * get questions answered of the class over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassAnsweredOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var classData = [];

        for (var i = 0; i < classObject.dates.length; i++) {
            dates.push(classObject.dates[i].date);
            classData.push(classObject.dates[i].info.correctAttemptsCount);
        }

        return callback(null, {
            dates: dates,
            classData: classData
        });
    });
}

/**
 * get overall average of the class over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassOverallOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var classData = [];

        for (var i = 0; i < classObject.dates.length; i++) {
            dates.push(classObject.dates[i].date);
            classData.push(classObject.dates[i].info.overallAverage);
        }

        return callback(null, {
            dates: dates,
            classData: classData
        });
    });
}

/**
 * get points per attempt average of the class over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassPointsPerAttemptOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var classData = [];

        for (var i = 0; i < classObject.dates.length; i++) {
            dates.push(classObject.dates[i].date);
            classData.push(classObject.dates[i].info.pointsPerAttemptAverage);
        }

        return callback(null, {
            dates: dates,
            classData: classData
        });
    });
}

/**
 * get accuracy of the class over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassAccuracyOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var classData = [];

        for (var i = 0; i < classObject.dates.length; i++) {
            dates.push(classObject.dates[i].date);
            classData.push(classObject.dates[i].info.accuracyAverage);
        }

        return callback(null, {
            dates: dates,
            classData: classData
        });
    });
}

/**
 * get points of the class over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassPointsOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:classId}, function(err, classObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var classData = [];

        for (var i = 0; i < classObject.dates.length; i++) {
            dates.push(classObject.dates[i].date);
            classData.push(classObject.dates[i].info.pointsAverage);
        }

        return callback(null, {
            dates: dates,
            classData: classData
        });
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

        classAverageAccuracy = classCount === 0 ? 0 : parseFloat(((classAccuracy / classCount)).toFixed(2));
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

        classPointsAverage = classCount === 0 ? 0 : Math.ceil(classPoints / classCount);
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
 * get points per attempts of user and class over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getPointsPerAttemptsOverTime = function(query, callback) {
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
                studentData.push(studentObject.dates[i].info.pointsPerAttemptValue);
            }

            for (var i = 0; i < classObject.dates.length; i++) {
                dates.push(classObject.dates[i].date);
                classData.push(classObject.dates[i].info.pointsPerAttemptAverage);
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
 * get points per attempts of user and class over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getOverallOverTime = function(query, callback) {
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
                studentData.push(studentObject.dates[i].info.overallValue);
            }

            for (var i = 0; i < classObject.dates.length; i++) {
                dates.push(classObject.dates[i].date);
                classData.push(classObject.dates[i].info.overallAverage);
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

/**
 * get overall rank over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getOverallRankOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var studentData = [];

        for (var i = 0; i < studentObject.dates.length; i++) {
            dates.push(studentObject.dates[i].date);
            studentData.push(studentObject.dates[i].info.overallRank);
        }

        return callback(null, {
            dates: dates,
            studentData: studentData,
            totalStudentsCount: totalStudentsCount
        });
    });
}

/**
 * get points rank over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getPointsRankOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var studentData = [];

        for (var i = 0; i < studentObject.dates.length; i++) {
            dates.push(studentObject.dates[i].date);
            studentData.push(studentObject.dates[i].info.pointsRank);
        }

        return callback(null, {
            dates: dates,
            studentData: studentData,
            totalStudentsCount: totalStudentsCount
        });
    });
}

/**
 * get attempt rank over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getAttemptRankOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var studentData = [];

        for (var i = 0; i < studentObject.dates.length; i++) {
            dates.push(studentObject.dates[i].date);
            studentData.push(studentObject.dates[i].info.pointsPerAttemptRank);
        }

        return callback(null, {
            dates: dates,
            studentData: studentData,
            totalStudentsCount: totalStudentsCount
        });
    });
}

/**
 * get correct attempt rank over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getCorrectAttemptRankOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var studentData = [];

        for (var i = 0; i < studentObject.dates.length; i++) {
            dates.push(studentObject.dates[i].date);
            studentData.push(studentObject.dates[i].info.correctAttemptsRank);
        }

        return callback(null, {
            dates: dates,
            studentData: studentData,
            totalStudentsCount: totalStudentsCount
        });
    });
}

/**
 * get accuracy rank over time
 *
 * @param {object} query
 * @param {function} callback
 */
var getAccuracyRankOverTime = function(query, callback) {
    getTimeBasedAnalytics({_id:query.userId}, function(err, studentObject) {
        if (err) {
            return callback(err, null);
        }

        var dates = [];
        var studentData = [];

        for (var i = 0; i < studentObject.dates.length; i++) {
            dates.push(studentObject.dates[i].date);
            studentData.push(studentObject.dates[i].info.accuracyRank);
        }

        return callback(null, {
            dates: dates,
            studentData: studentData,
            totalStudentsCount: totalStudentsCount
        });
    });
}

/**
 * get points per question topic
 *
 * @param {object} query
 * @param {function} callback
 */
var getPointsPerTopicVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {topic: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var studentId = query.userId;
        var studentData = [];
        var classData = [];
        var labels = [];
        var currentTopic = questionsList[0].topic;
        var studentPoints = 0;
        var classPoints = 0;
        var classCount = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.topic !== currentTopic) {
                labels.push(currentTopic);
                studentData.push(studentPoints);
                classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
                studentPoints = 0;
                classPoints = 0;
                classCount = 0;
                currentTopic = question.topic;
            }

            for (var j = 0; j < question.correctAttempts.length; j++) {
                var attempt = question.correctAttempts[j];
                if (attempt.userId === studentId) {
                    studentPoints = attempt.points;
                } else {
                    classPoints += attempt.points;
                    classCount ++;
                }
            }
        }

        if (questionsList.length > 0) {
            currentTopic = questionsList[questionsList.length-1].topic;
            labels.push(currentTopic);
            studentData.push(studentPoints);
            classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
        }

        return callback(null, {
            studentData: studentData,
            classData: classData,
            labels: labels
        });
    });
}

/**
 * get accuracy per question topic
 *
 * @param {object} query
 * @param {function} callback
 */
var getAccuracyPerTopicVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {topic: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var studentId = query.userId;
        var studentData = [];
        var classData = [];
        var labels = [];
        var currentTopic = questionsList[0].topic;
        var studentCorrect = 0;
        var studentTotal = 0;
        var classCorrect = 0;
        var classTotal = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.topic !== currentTopic) {
                labels.push(currentTopic);
                studentData.push((studentTotal === 0) ? 0 : ((studentCorrect / studentTotal) * 100).toFixed(2));
                classData.push((classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
                studentCorrect = 0;
                studentTotal = 0;
                classCorrect = 0;
                classTotal = 0;
                currentTopic = question.topic;
            }

            for (var j = 0; j < question.correctAttempts.length; j++) {
                var attempt = question.correctAttempts[j];
                if (attempt.userId === studentId) {
                    studentCorrect ++;
                } else {
                    classCorrect ++;
                }
            }

            for (var j = 0; j < question.totalAttempts.length; j++) {
                var attempt = question.totalAttempts[j];
                if (attempt.userId === studentId) {
                    studentTotal ++;
                } else {
                    classTotal ++;
                }
            }
        }

        if (questionsList.length > 0) {
            currentTopic = questionsList[questionsList.length-1].topic;
            labels.push(currentTopic);
            studentData.push((studentTotal === 0) ? 0 : ((studentCorrect / studentTotal) * 100).toFixed(2));
            classData.push((classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
        }

        return callback(null, {
            studentData: studentData,
            classData: classData,
            labels: labels
        });
    });
}

/**
 * get points per question type
 *
 * @param {object} query
 * @param {function} callback
 */
var getPointsPerTypeVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {type: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var studentId = query.userId;
        var studentData = [];
        var classData = [];
        var labels = [];
        var currentType = questionsList[0].type;
        var studentPoints = 0;
        var classPoints = 0;
        var classCount = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.type !== currentType) {
                labels.push(currentType);
                studentData.push(studentPoints);
                classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
                studentPoints = 0;
                classPoints = 0;
                classCount = 0;
                currentType = question.type;
            }

            for (var j = 0; j < question.correctAttempts.length; j++) {
                var attempt = question.correctAttempts[j];
                if (attempt.userId === studentId) {
                    studentPoints = attempt.points;
                } else {
                    classPoints += attempt.points;
                    classCount ++;
                }
            }
        }

        if (questionsList.length > 0) {
            currentType = questionsList[questionsList.length-1].type;
            labels.push(currentType);
            studentData.push(studentPoints);
            classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
        }

        return callback(null, {
            studentData: studentData,
            classData: classData,
            labels: labels
        });
    });
}

/**
 * get accuracy per question type
 *
 * @param {object} query
 * @param {function} callback
 */
var getAccuracyPerTypeVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {type: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var studentId = query.userId;
        var studentData = [];
        var classData = [];
        var labels = [];
        var currentType = questionsList[0].type;
        var studentCorrect = 0;
        var studentTotal = 0;
        var classCorrect = 0;
        var classTotal = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.type !== currentType) {
                labels.push(currentType);
                studentData.push((studentTotal === 0) ? 0 : ((studentCorrect / studentTotal) * 100).toFixed(2));
                classData.push((classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
                studentCorrect = 0;
                studentTotal = 0;
                classCorrect = 0;
                classTotal = 0;
                currentType = question.type;
            }

            for (var j = 0; j < question.correctAttempts.length; j++) {
                var attempt = question.correctAttempts[j];
                if (attempt.userId === studentId) {
                    studentCorrect ++;
                } else {
                    classCorrect ++;
                }
            }

            for (var j = 0; j < question.totalAttempts.length; j++) {
                var attempt = question.totalAttempts[j];
                if (attempt.userId === studentId) {
                    studentTotal ++;
                } else {
                    classTotal ++;
                }
            }
        }

        if (questionsList.length > 0) {
            currentType = questionsList[questionsList.length-1].type;
            labels.push(currentType);
            studentData.push((studentTotal === 0) ? 0 : ((studentCorrect / studentTotal) * 100).toFixed(2));
            classData.push( (classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
        }

        return callback(null, {
            studentData: studentData,
            classData: classData,
            labels: labels
        });
    });
}

/**
 * get class points per question topic
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassPointsPerTopicVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {topic: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var classData = [];
        var labels = [];
        var currentTopic = questionsList[0].topic;
        var classPoints = 0;
        var classCount = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.topic !== currentTopic) {
                labels.push(currentTopic);
                classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
                classPoints = 0;
                classCount = 0;
                currentTopic = question.topic;
            }

            for (var j = 0; j < question.correctAttempts.length; j++) {
                classPoints += question.correctAttempts[j].points;
                classCount ++;
            }
        }

        if (questionsList.length > 0) {
            currentTopic = questionsList[questionsList.length-1].topic;
            labels.push(currentTopic);
            classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
        }

        return callback(null, {
            classData: classData,
            labels: labels
        });
    });
}

/**
 * get class accuracy per question topic
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassAccuracyPerTopicVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {topic: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var classData = [];
        var labels = [];
        var currentTopic = questionsList[0].topic;
        var classCorrect = 0;
        var classTotal = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.topic !== currentTopic) {
                labels.push(currentTopic);
                classData.push((classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
                classCorrect = 0;
                classTotal = 0;
                currentTopic = question.topic;
            }

            classCorrect += question.correctAttemptsCount;
            classTotal += question.totalAttemptsCount;
        }

        if (questionsList.length > 0) {
            currentTopic = questionsList[questionsList.length-1].topic;
            labels.push(currentTopic);
            classData.push((classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
        }

        return callback(null, {
            classData: classData,
            labels: labels
        });
    });
}

/**
 * get class rating per topic vs class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassRatingPerTopicVsClass = function (query, callback) {
    users.getUsersList(function (err, studentsList) {
        if (err) {
            return callback(err, null);
        }

        var studentsObject = {};
        for (var j = 0; j < studentsList.length; j++) {
            studentsObject[studentsList[j]._id] = studentsList[j].type;
        }

        questions.getAllQuestionsByQuery({}, {topic: 1}, function(err, questionsList) {
            if (err) {
                return callback(err, null);
            }

            if (!questionsList || !questionsList[0]) {
                return callback('no questions available', null);
            }

            var adminsData = [];
            var studentsData = [];
            var labels = [];
            var currentTopic = questionsList[0].topic;
            var adminsRating = 0;
            var studentsRating = 0;
            var adminsCount = 0;
            var studentsCount = 0;

            for (var i = 0; i < questionsList.length; i++) {
                var question = questionsList[i];

                if (question.topic !== currentTopic) {
                    labels.push(currentTopic);
                    adminsData.push((adminsCount === 0) ? 0 : (adminsRating / adminsCount).toFixed(2));
                    studentsData.push((studentsCount === 0) ? 0 : (studentsRating / studentsCount).toFixed(2));
                    adminsCount = 0;
                    studentsCount = 0;
                    adminsRating = 0;
                    studentsRating = 0;
                    currentTopic = question.topic;
                }

                for (var j = 0; j < question.ratings.length; j++) {
                    var userObject = question.ratings[j];

                    if (studentsObject[userObject.userId] === common.userTypes.ADMIN) {
                        adminsRating += userObject.rating;
                        adminsCount ++;
                    } else {
                        studentsRating += userObject.rating;
                        studentsCount ++;
                    }
                }
            }

            if (questionsList.length > 0) {
                currentTopic = questionsList[questionsList.length-1].topic;
                labels.push(currentTopic);
                adminsData.push((adminsCount === 0) ? 0 : (adminsRating / adminsCount).toFixed(2));
                studentsData.push((studentsCount === 0) ? 0 : (studentsRating / studentsCount).toFixed(2));
            }

            return callback(null, {
                adminsData: adminsData,
                studentsData: studentsData,
                labels: labels
            });
        });
    });
}

/**
 * get class rating per type vs class
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassRatingPerTypeVsClass = function (query, callback) {
    users.getUsersList(function (err, studentsList) {
        if (err) {
            return callback(err, null);
        }

        var studentsObject = {};
        for (var j = 0; j < studentsList.length; j++) {
            studentsObject[studentsList[j]._id] = studentsList[j].type;
        }

        questions.getAllQuestionsByQuery({}, {type: 1}, function(err, questionsList) {
            if (err) {
                return callback(err, null);
            }

            if (!questionsList || !questionsList[0]) {
                return callback('no questions available', null);
            }

            var adminsData = [];
            var studentsData = [];
            var labels = [];
            var currentType = questionsList[0].type;
            var adminsRating = 0;
            var studentsRating = 0;
            var adminsCount = 0;
            var studentsCount = 0;

            for (var i = 0; i < questionsList.length; i++) {
                var question = questionsList[i];

                if (question.type !== currentType) {
                    labels.push(currentType);
                    adminsData.push((adminsCount === 0) ? 0 : (adminsRating / adminsCount).toFixed(2));
                    studentsData.push((studentsCount === 0) ? 0 : (studentsRating / studentsCount).toFixed(2));
                    adminsCount = 0;
                    studentsCount = 0;
                    adminsRating = 0;
                    studentsRating = 0;
                    currentType = question.type;
                }

                for (var j = 0; j < question.ratings.length; j++) {
                    var userObject = question.ratings[j];

                    if (studentsObject[userObject.userId] === common.userTypes.ADMIN) {
                        adminsRating += userObject.rating;
                        adminsCount ++;
                    } else {
                        studentsRating += userObject.rating;
                        studentsCount ++;
                    }
                }
            }

            if (questionsList.length > 0) {
                currentType = questionsList[questionsList.length-1].type;
                labels.push(currentType);
                adminsData.push((adminsCount === 0) ? 0 : (adminsRating / adminsCount).toFixed(2));
                studentsData.push((studentsCount === 0) ? 0 : (studentsRating / studentsCount).toFixed(2));
            }

            return callback(null, {
                adminsData: adminsData,
                studentsData: studentsData,
                labels: labels
            });
        });
    });
}

/**
 * get class points per question type
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassPointsPerTypeVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {type: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var classData = [];
        var labels = [];
        var currentType = questionsList[0].type;
        var classPoints = 0;
        var classCount = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.type !== currentType) {
                labels.push(currentType);
                classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
                classPoints = 0;
                classCount = 0;
                currentType = question.type;
            }

            for (var j = 0; j < question.correctAttempts.length; j++) {
                classPoints = question.correctAttempts[j].points;
                classCount ++;
            }
        }

        if (questionsList.length > 0) {
            currentType = questionsList[questionsList.length-1].type;
            labels.push(currentType);
            classData.push((classCount === 0) ? 0 : (classPoints / classCount).toFixed(0));
        }

        return callback(null, {
            classData: classData,
            labels: labels
        });
    });
}

/**
 * get class accuracy per question type
 *
 * @param {object} query
 * @param {function} callback
 */
var getClassAccuracyPerTypeVsClass = function(query, callback) {
    questions.getAllQuestionsByQuery({}, {type: 1}, function(err, questionsList) {
        if (err) {
            return callback(err, null);
        }

        if (!questionsList || !questionsList[0]) {
            return callback('no questions available', null);
        }

        var classData = [];
        var labels = [];
        var currentType = questionsList[0].type;
        var classCorrect = 0;
        var classTotal = 0;

        for (var i = 0; i < questionsList.length; i++) {
            var question = questionsList[i];

            if (question.type !== currentType) {
                labels.push(currentType);
                classData.push((classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
                classCorrect = 0;
                classTotal = 0;
                currentType = question.type;
            }

            classCorrect += question.correctAttemptsCount;
            classTotal += question.totalAttemptsCount;
        }

        if (questionsList.length > 0) {
            currentType = questionsList[questionsList.length-1].type;
            labels.push(currentType);
            classData.push( (classTotal === 0) ? 0 : ((classCorrect / classTotal) * 100).toFixed(2));
        }

        return callback(null, {
            classData: classData,
            labels: labels
        });
    });
}
