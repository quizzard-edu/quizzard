/*
log.js

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

var fs = require('fs');
var common = require('./common.js');
var dateStamp;
var logger;

// print a normal message
exports.log = function (text) {
    init();

    var txt = common.formatString('[{0}] log: {1}', [common.getDate(), text]);
    console.log(txt);
}

// print an error message
exports.error = function (text) {
    init();

    var txt = common.formatString('[{0}] error: {1}', [common.getDate(), text]);
    console.error(txt);
}

// initiate the logging with file
var init = function () {
    var currentDate = common.getDateByFormat('YYYY-MM-DD');
    if (!process.env.DEBUG && dateStamp !== currentDate) {
        dateStamp = currentDate;
        logger = fs.createWriteStream(__dirname + '/../logs/'+dateStamp+'.log', {'flags':'a'});
        process.stdout.write = process.stderr.write = logger.write.bind(logger);
        process.on(
            'uncaughtException',
            function(err)
            {
                console.error((err && err.stack) ? err.stack : err);
            }
        );
    }
}