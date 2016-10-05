var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var bcrypt = require('bcryptjs');

var DB_HOST = process.env.DB_HOST || 'localhost';
var DB_PORT = process.env.DB_PORT || 27017;

var db = new Db('quizzard', new Server(DB_HOST, DB_PORT));

db.open(function(err, db) {
    if (err)
        console.log(err);
});

var students = db.collection('students');

/*
 * Check if the account given by user and pass is valid.
 * Return account object if it is or null otherwise.
 */
exports.checkLogin = function(user, pass, callback) {
    students.findOne({'id' : user}, function(err, obj) {
        if (err) {
            console.log(err);
            callback(null);
        } else if (obj) {
            validatePassword(obj, pass, function(valid) {
                if (valid) {
                    callback(obj);
                } else {
                    console.log('invalid password provided for user ' + user);
                    callback(null);
                }
            });
        } else {
            callback(null);
        }
    });
}

/*
 * Create a new account and insert it into the database.
 * account object should contain id, password, first and last names
 * and email address when passed to function.
 * Call callback with the result of the insertion, or 'failure' if
 * unsuccessful.
 */
exports.createAccount = function(account, callback) {
    students.findOne({'id': account.id}, function(err, obj) {
        if (err) {
            console.log(err);
            callback('failure');
        } else if (obj) {
            callback('failure');
        } else {
            bcrypt.hash(account.pass, 11, function(err, hash) {
                if (err) {
                    callback('failure');
                } else {
                    account.pass = hash;
                    account.ctime = Date.now() / 1000;
                    account.answered = 0;
                    account.attempted = 0;
                    account.points = 0.0;
                    account.level = 0;
                    account.answeredIds = [];

                    accounts.insert(account, function(err, res) {
                        if (err)
                            callback('failure');
                        else
                            callback(res);
                    });
                }
            });
        }
    });
}

/*
 * Check the hash of pass against the password stored in userobj.
 */
var validatePassword = function(userobj, pass, callback) {
    bcrypt.compare(pass, userobj.password, function(err, res) {
        callback(res);
    });
}
