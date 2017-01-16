var rls = require('readline-sync');
var db = require('./server/db.js');
var students = require('./server/students.js');

var setupAdminAccount = function(accid, pass) {
    var acc = {
        id: accid,
        password: pass,
        fname: 'Root',
        lname: 'User',
        email: '',
        admin: true
    };

    db.initialize(function() {
        students.createAccount(acc, function(res, account) {
            if (res == 'failure') {
                console.log('Could not create account. Please try again.');
                process.exit(1);
            } else if (res == 'exists') {
                console.log('Account with username `%s\' exists.', user);
                process.exit(1);
            } else {
                console.log('Administrator account `%s\' created.', account.id);
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
