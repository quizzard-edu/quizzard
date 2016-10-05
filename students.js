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
                    callback(null);
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

var validatePassword = function(userobj, pass, callback) {
    bcrypt.compare(pass, userobj.password, function(err, res) {
        callback(res);
    });
}
