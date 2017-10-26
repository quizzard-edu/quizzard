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

var logger = require('./server/log.js').logger;
var db = require('./server/db.js');
var users = require('./server/users.js');
var analytics = require('./server/analytics.js');

var studentsCount = 0;

/* get analytics for a admins */
var getAnalytics = function() {
    var currentDate = new Date().toString();
    users.getStudentsList(function(err, studentsList){
        if (err) {
            return logger.info(err);
        }
    
        for (var i in studentsList) {
            var student = studentsList[i];
            var row = {};
            var obj = {_id: student.id};

            row.correctAttemptsCount = student.correctAttemptsCount;
            row.wrongAttemptsCount = student.wrongAttemptsCount;
            row.totalAttemptsCount = student.totalAttemptsCount;

            obj[currentDate] = row;
            analytics.addStudentAnalyticsWithDate(
                student.id,
                currentDate,
                row,
                function(err, result){
                    if (err) {
                        return logger.info(err);
                    }
                    studentsCount++;
                    if(studentsCount === studentsList.length-1) {
                        logger.info('Done, everything looks fine.');
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
