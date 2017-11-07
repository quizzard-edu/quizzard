/*
leaderboard.js

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

/*
 * Fetch a list of students to display in the leaderboard.
 * The list is sorted by decreasing points.
 * Add rank to each student entry.
 *
 * If shrt is true, return leaderboard with max eight entries.
 */
exports.leaderboard = function(userid, shrt, type, callback) {
    users.getStudentsListSorted(0, function(err, studentlist) {

        var rank = 0;
        var last = -1;
        var userind;

        //Sort the list of students depending on the type (defualt sorting is by points)
        if (type === 'accuracy'){
            studentlist = studentlist.sort(function(a,b) {
                x = a.correctAttemptsCount/a.totalAttemptsCount;
                y = b.correctAttemptsCount/b.totalAttemptsCount;

                if (a.totalAttemptsCount === 0 && b.totalAttemptsCount ===0){
                    return 0;
                } else if (b.totalAttemptsCount === 0){
                    return -1;
                } else if (a.totalAttemptsCount === 0){
                    return 1;
                } else{
                    return y - x;
                }
            })
        } else if (type === 'attempt'){
            studentlist = studentlist.sort(function(a,b) {
                x = a.points/a.totalAttemptsCount;
                y = b.points/b.totalAttemptsCount;
                
                if (a.totalAttemptsCount === 0 && b.totalAttemptsCount ===0){
                    return 0;
                } else if (b.totalAttemptsCount === 0){
                    return -1;
                } else if (a.totalAttemptsCount === 0){
                    return 1;
                } else{
                    return y - x;
                }
            })
        } else if (type === 'overall'){
            studentlist = studentlist.sort(function(a,b) {
                x = a.points * ((a.correctAttemptsCount / a.totalAttemptsCount) + (a.points / a.totalAttemptsCount));                
                y = b.points * ((b.correctAttemptsCount / b.totalAttemptsCount) + (b.points / b.totalAttemptsCount));                
                
                if (a.totalAttemptsCount === 0 && b.totalAttemptsCount ===0){
                    return 0;
                } else if (b.totalAttemptsCount === 0){
                    return -1;
                } else if (a.totalAttemptsCount === 0){
                    return 1;
                } else{
                    return y - x;
                }
            })
        } 
        
        /* assign ranks to each student */
        for (var i = 0; i < studentlist.length; ++i) {
            /* subsequent users with same amount of points have same rank */
            
            //Rank is assigned depending on the type

            if(type === 'points'){
                if (studentlist[i].points != last) {
                    rank = i + 1;
                    last = studentlist[i].points;
                }
                studentlist[i].rank = rank;
    
                if (studentlist[i].id == userid)
                    userind = i;

            } else if(type === 'attempt'){
                var attempt = 0;
                if(studentlist[i].totalAttemptsCount != 0){
                    attempt = studentlist[i].points/studentlist[i].totalAttemptsCount;
                    attempt = Math.round(attempt);
                }

                if (attempt != last) {
                    rank = i + 1;
                    last = attempt;
                }
                studentlist[i].rank = rank;
    
                if (studentlist[i].id == userid)
                    userind = i;

            } else if(type === 'accuracy'){
                var accuracy = 0;
                if (studentlist[i].totalAttemptsCount != 0){
                    accuracy = studentlist[i].correctAttemptsCount/studentlist[i].totalAttemptsCount;
                    accuracy = Math.round(accuracy*100)/100;
                }

                if (accuracy != last) {
                    rank = i + 1;
                    last = accuracy;
                }
                studentlist[i].rank = rank;
    
                if (studentlist[i].id == userid)
                    userind = i;

            } else if(type === 'overall'){
                var overall = 0;
                if (studentlist[i].totalAttemptsCount != 0){
                    overall = studentlist[i].points * ((studentlist[i].correctAttemptsCount / studentlist[i].totalAttemptsCount) + (studentlist[i].points / studentlist[i].totalAttemptsCount));
                    overall = Math.round(overall);
                }

                if (overall != last) {
                    rank = i + 1;
                    last = overall;
                }
                studentlist[i].rank = rank;
    
                if (studentlist[i].id == userid)
                    userind = i;
            }
        }

        if (shrt) {
            if (studentlist.length < 8) {
                callback(studentlist);
                return;
            }

            var lb = [];
            /* represents a '...' entry in the leaderboard table */
            var dots = { rank: 0 };

            /*
             * If the user is in the top 6, display the top seven
             * students, followed by "...".
             */
            if (userind < 6) {
                for (var i = 0; i < 7; ++i)
                    lb.push(studentlist[i]);
                lb.push(dots);
            } else {
                /* The top 3 students are always displayed. */
                lb.push(studentlist[0]);
                lb.push(studentlist[1]);
                lb.push(studentlist[2]);

                /*
                 * If the user is in the bottom four,
                 * display the whole bottom four.
                 */
                if (userind >= studentlist.length - 4) {
                    lb.push(dots);
                    for (var i = studentlist.length - 4; i < studentlist.length; ++i)
                        lb.push(studentlist[i]);
                } else {
                    /*
                     * Otherwise, display the user with the
                     * students directly above and below them.
                     */
                    lb.push(dots);
                    lb.push(studentlist[userind - 1]);
                    lb.push(studentlist[userind]);
                    lb.push(studentlist[userind + 1]);
                    lb.push(dots);
                }
            }

            callback(lb);
        } else {
            callback(studentlist);
        }
    });
}
