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
const questions = require('./questions.js');
const logger = require('./log.js');
const common = require('./common.js');
const db = require('./db.js');

const classId = 'class';
var totalStudentsCount = 0;

/**
 * start the analytics daily process
 *
 * @param {function} callback
 */
exports.initialize = function(callback) {
    getAnalytics(callback);

    users.getStudentsList(function (err, studentsList) {
        if (err) {
            logger.error(err);
        }
        totalStudentsCount = studentsList.length;
    });
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
        case 'pointsPerTopicVsClass':
            return getPointsPerTopicVsClass(query, callback);
        case 'accuracyPerTopicVsClass':
            return getAccuracyPerTopicVsClass(query, callback);
        case 'pointsPerTypeVsClass':
            return getPointsPerTypeVsClass(query, callback);
        case 'accuracyPerTypeVsClass':
            return getAccuracyPerTypeVsClass(query, callback);
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

        var classCorrectAttemptsCount = 0;
        var classWrongAttemptsCount = 0;
        var classTotalAttemptsCount = 0;
        var classPoints = 0;

        var overallList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'overall'), '_id');
        var attemptList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'attempt'), '_id');
        var accuracyList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'accuracy'), '_id');
        var pointsList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'points'), '_id');
        var correctAttemptsList = common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'correctAttemptsCount'), '_id');

        var overallSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'overall'), 'overall'));
        var attemptSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'attempt'), 'attempt'));
        var accuracySum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'accuracy'), 'accuracy'));
        var pointsSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'points'), 'points'));
        var correctAttemptsSum = common.sumListOfNumbers(common.getIdsListFromJSONList(sortLeaderBoard(leaderboardList, 'correctAttemptsCount'), 'correctAttemptsCount'));

        users.getStudentsList(function (err, studentsList) {
            if (err) {
                logger.error(err);
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
                row.overallRank = overallList.indexOf(student._id);
                row.pointsPerAttemptRank = attemptList.indexOf(student._id);
                row.accuracyRank = accuracyList.indexOf(student._id);
                row.pointsRank = pointsList.indexOf(student._id);
                row.correctAttemptsRank = correctAttemptsList.indexOf(student._id);

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
                            logger.error(err);
                            return callback(err, null);
                        }

                        studentsCount++;
                        if (studentsCount === studentsList.length-1) {
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