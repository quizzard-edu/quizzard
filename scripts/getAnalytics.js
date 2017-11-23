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

var studentsCount = 0;

/* get analytics for a admins */
var getAnalytics = function() {
    var currentDate = common.getDate();
    users.getStudentsList(function(err, studentsList){
        if (err) {
            return logger.error(err);
        }

        for (var i in studentsList) {
            var student = studentsList[i];
            var row = {};

            row.correctAttemptsCount = student.correctAttemptsCount;
            row.wrongAttemptsCount = student.wrongAttemptsCount;
            row.totalAttemptsCount = student.totalAttemptsCount;

            analytics.addStudentAnalyticsWithDate(
                student._id,
                currentDate,
                row,
                function(err, result){
                    if (err) {
                        return logger.info(err);
                    }
                    studentsCount++;
                    if(studentsCount === studentsList.length-1) {
                        logger.log('Done, everything looks fine.');
                        process.exit(0);
                    }
                }
            );
        }
    });
}

db.initialize(function() {
    getAnalytics();
});
