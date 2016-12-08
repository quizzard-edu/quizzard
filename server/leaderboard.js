var students = require('./students.js');

/*
 * Fetch a list of students to display in the leaderboard.
 * The list is sorted by decreasing points.
 * Add rank to each student entry.
 *
 * If shrt is true, return leaderboard with max eight entries.
 */
exports.leaderboard = function(userid, shrt, callback) {
    students.getUsersSorted(0, function(studentlist) {
        var rank = 0;
        var last = -1;
        var userind;

        /* assign ranks to each student */
        for (var i = 0; i < studentlist.length; ++i) {
            /* subsequent users with same amount of points have same rank */
            if (studentlist[i].points != last) {
                rank = i + 1;
                last = studentlist[i].points;
            }
            studentlist[i].rank = rank;

            if (studentlist[i].id == userid)
                userind = i;
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
