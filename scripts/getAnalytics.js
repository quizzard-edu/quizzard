/*
The getAnalytics script

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

const logger = require('../server/log.js');
const db = require('../server/db.js');
const users = require('../server/users.js');
const analytics = require('../server/analytics.js');
const common = require('../server/common.js');

const classId = 'class';

var studentsCount = 0;
var classObject = {
    correctAttemptsCount: 0,
    wrongAttemptsCount: 0,
    totalAttemptsCount: 0,
    points: 0,
    accuracy: 0
};

/* get analytics for a admins */
var getAnalytics = function() {
    var currentDate = common.getDate();
    users.getStudentsList(function (err, studentsList) {
        if (err) {
            return logger.error(err);
        }

        for (var i in studentsList) {
            var student = studentsList[i];
            var row = {};

            row.correctAttemptsCount = student.correctAttemptsCount;
            row.wrongAttemptsCount = student.wrongAttemptsCount;
            row.totalAttemptsCount = student.totalAttemptsCount;
            row.points = student.points;
            row.accuracy = ((student.correctAttemptsCount / student.totalAttemptsCount) * 100).toFixed(2);

            classObject.correctAttemptsCount += student.correctAttemptsCount;
            classObject.wrongAttemptsCount += student.wrongAttemptsCount;
            classObject.totalAttemptsCount += student.totalAttemptsCount;
            classObject.points += student.points;

            analytics.addStudentAnalyticsWithDate(
                student._id,
                currentDate,
                row,
                function (err, result) {
                    if (err) {
                        return logger.info(err);
                    }

                    studentsCount++;
                    if (studentsCount === studentsList.length-1) {
                        classObject.accuracy = ((classObject.correctAttemptsCount / classObject.totalAttemptsCount) * 100).toFixed(2);

                        analytics.addStudentAnalyticsWithDate(
                            classId,
                            currentDate,
                            classObject,
                            function (err, result) {
                                if (err) {
                                    return logger.info(err);
                                }

                                logger.log('Done, everything looks fine.');
                                process.exit(0);
                            }
                        );
                    }
                }
            );
        }
    });
}

db.initialize(function () {
    getAnalytics();
});
