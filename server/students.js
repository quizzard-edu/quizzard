/*
students.js

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

var bcrypt = require('bcryptjs');
var fs = require('fs');
var csv = require('csv');
var db = require('./db.js');
var logger = require('./log.js').logger;


/* Remove an account from the database. */
exports.deleteAccount = function(userid, callback) {
    students.remove({id: userid}, function(err, res) {
        if (err) {
            logger.error(err);
            callback('failure');
        } else {
            logger.info('Account %s deleted from database.', userid);
            callback('success');
        }
    });
};

/* Sort the list of accounts as by the given criteria. */
exports.sortAccounts = function(as, type, asc, callback) {
    var cmpfn;

    var lo = asc ? -1 : 1;
    var hi = -lo;
    if (type == 'id') {
        cmpfn = function(a, b) {
            return a.id < b.id ? lo : hi;
        };
    } else if (type == 'fname') {
        cmpfn = function(a, b) {
            return a.fname.toLowerCase() < b.fname.toLowerCase() ? lo : hi;
        };
    } else {
        cmpfn = function(a, b) {
            return a.lname.toLowerCase() < b.lname.toLowerCase() ? lo : hi;
        }
    }

    as.sort(cmpfn);
    callback(as);
}

var updatefn;

/*
 * Read account entries from a csv file and add them to the database.
 */
exports.parseFile = function(path, ufn, callback) {
    updatefn = ufn;
    logger.info('Reading accounts from file %s.', path);
    fs.createReadStream(__dirname + '/../' + path)
        .pipe(accountParser).on('end', function() {
            callback();
        });
}

/*
 * The provided csv file should have five fields per row:
 * user ID, initial password, first name, last name, email
 */
var accountParser = csv.parse(function(err, data) {
    if (err) {
        logger.error(err);
        return;
    }

    for (var i in data) {
        if (data[i].length != 5)
            continue;

        var account = {};
        account.id = data[i][0];
        account.password = data[i][1];
        account.fname = data[i][2];
        account.lname = data[i][3];
        account.email = data[i][4];

        createAccount(account, function(res, acc) {
            if (res == 'failure') {
                logger.error('Could not insert account %s into database.', acc.id);
            } else if (res == 'exists') {
                logger.error('Account ID %s already exists.', acc.id);
            } else {
                logger.info('Account %s read from csv file.', acc.id);
                delete acc._id;
                updatefn(acc);
            }
        });
    }
});
