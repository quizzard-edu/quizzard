var bcrypt = require('bcryptjs');
var db = require('./db.js').database;

var students = db.collection('students');

/* Return an array of users in the database. */
exports.getUsers = function(admin, callback) {
    students.find({admin: !!admin}).sort({id: 1}).toArray(function(err, docs) {
        if (err) {
            callback([]);
        } else {
            for (s in docs)
                delete docs[s]._id;
            callback(docs);
        }
    });
}

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
                    delete obj._id;
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
            callback('exists');
        } else {
            bcrypt.hash(account.password, 11, function(err, hash) {
                if (err) {
                    callback('failure');
                } else {
                    account.password = hash;
                    account.ctime = (Date.now() / 1000) | 0;
                    account.answered = 0;
                    account.attempted = 0;
                    account.points = 0.0;
                    account.level = 0;
                    account.answeredIds = [];
                    account.admin = false;

                    students.insert(account, function(err, res) {
                        if (err) {
                            callback('failure');
                        } else {
                            console.log(res);
                            callback('success');
                        }
                    });
                }
            });
        }
    });
}

/*
 * Update the account with ID userid in the student database.
 * The user argument holds the complete new object to insert.
 * Fail if the ID has changed and the new ID already belongs
 * to a user.
 */
exports.updateAccount = function(userid, user, callback) {
    students.findOne({id : user.id}, function(err, obj) {
        if (err) {
            console.log(err);
            callback('failure');
        } else if (obj && userid != user.id) {
            callback('dupid');
        } else {
            if (user.password)
                user.password = bcrypt.hashSync(user.password, 11);
            students.update({id: userid}, user, function(err, res) {
                if (err) {
                    console.log(err);
                    callback('failure');
                } else {
                    callback('success');
                }
            });
        }
    });
}

/* Remove an account from the database. */
exports.deleteAccount = function(userid, callback) {
    students.remove({id: userid}, function(err, res) {
        if (err) {
            console.log(err);
            callback('failure');
        } else {
            console.log('User %s deleted', userid);
            callback('success');
        }
    });
};

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

/*
 * Check the hash of pass against the password stored in userobj.
 */
var validatePassword = function(userobj, pass, callback) {
    bcrypt.compare(pass, userobj.password, function(err, res) {
        callback(res);
    });
}
