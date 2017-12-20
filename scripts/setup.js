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

var rls = require('readline-sync');
var db = require('./../server/db.js');
var users = require('./../server/users.js');
var common = require('./../server/common.js');
var logger = require('./../server/log.js');

var setupAdminAccount = function (accid, pass) {
    var acc = {
        username: accid,
        password: pass,
        fname: accid,
        lname: accid,
        email: common.formatString('{0}@temp.email', [accid])
    };

    db.initialize(function (err, result) {
        if (err) {
            logger.error(JSON.stringify(err));
            process.exit(1);
        }

        users.addAdmin(acc, function (err, res) {
            if (err) {
                if (err.code === 2014) {
                    logger.error('Could not create account. Please try again.');
                    process.exit(1);
                } else if (err.code === 2019) {
                    logger.error('Account with username exists.');
                    process.exit(1);
                }
                logger.error(JSON.stringify(err));
                process.exit(1);
            }

            logger.log('Administrator account created.');
            process.exit(0);
        });
    });
}

var interactiveSetup = function () {
    var user, pass, pass2;

    logger.log('Quizzard server setup\n');
    logger.log('Creating administrator account.');

    user = rls.question('Please enter username: ');
    pass = rls.question('Enter password: ', {
        hideEchoBack: true,
        mask: ''
    });
    pass2 = rls.question('Confirm password: ', {
        hideEchoBack: true,
        mask: ''
    });

    if (pass != pass2) {
        logger.error('Passwords do not match.');
        process.exit(1);
    }
    setupAdminAccount(user, pass);
}

interactiveSetup();
