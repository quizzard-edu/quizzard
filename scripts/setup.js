/*
The setup script

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

var rls = require('readline-sync');
var db = require('./../server/db.js');
var users = require('./../server/users.js');
var common = require('./../server/common.js');

var setupAdminAccount = function(accid, pass) {
    var acc = {
        username: accid,
        password: pass,
        fname: 'root',
        lname: 'user',
        email: common.formatString('{0}@mail.utoronto.ca', [accid])
    };

    db.initialize(function() {
        users.addAdmin(acc, function(err, res) {
            if (err == 'failure') {
                console.log('Could not create account. Please try again.');
                process.exit(1);
            } else if (err == 'exists') {
                console.log('Account with username `%s\' exists.', accid);
                process.exit(1);
            } else {
                console.log('Administrator account `%s\' created.', accid);
                process.exit(0);
            }
        });
    });
}

var interactiveSetup = function() {
    var user, pass, pass2;

    console.log('Quizzard server setup\n');
    console.log('Creating administrator account.');

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
        console.log('Passwords do not match.');
        process.exit(1);
    }
    setupAdminAccount(user, pass);
}

interactiveSetup();
