var bcrypt = require('bcryptjs');
var fs = require('fs');
var csv = require('csv');
var db = require('./db.js').database;
var logger = require('./log.js').logger;

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

/* Return an array of users in the database, sorted by rank. */
exports.getUsersSorted = function(lim, callback) {
    students.find({admin: false})
            .sort({points: -1})
            .limit(lim)
            .toArray(function(err, docs) {
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
            logger.error(err);
            callback(null);
        } else if (obj) {
            validatePassword(obj, pass, function(valid) {
                if (valid) {
                    delete obj._id;
                    callback(obj);
                } else {
                    logger.warn('Invalid password provided for user %s.', user);
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
var createAccount = function(account, callback) {
    students.findOne({'id': account.id}, function(err, obj) {
        if (err) {
            logger.error(err);
            callback('failure', account);
        } else if (obj) {
            callback('exists', account);
        } else {
            bcrypt.hash(account.password, 11, function(err, hash) {
                if (err) {
                    callback('failure', account);
                } else {
                    account.password = hash;
                    account.ctime = (Date.now() / 1000) | 0;
                    account.answered = 0;
                    account.attempted = 0;
                    account.points = 0.0;
                    account.level = 0;
                    account.answeredIds = [];
                    if (!account.admin)
                        account.admin = false;

                    students.insert(account, function(err, res) {
                        if (err) {
                            callback('failure', account);
                        } else {
                            logger.info('Account %s created.', account.id);
                            callback('success', account);
                        }
                    });
                }
            });
        }
    });
}
exports.createAccount = createAccount;

/*
 * Update the account with ID userid in the student database.
 * The user argument holds the complete new object to insert.
 * Fail if the ID has changed and the new ID already belongs
 * to a user.
 */
exports.updateAccount = function(userid, user, newpass, callback) {
    students.findOne({id : user.id}, function(err, obj) {
        if (err) {
            logger.error(err);
            callback('failure');
        } else if (obj && userid != user.id) {
            callback('dupid');
        } else {
            if (newpass)
                user.password = bcrypt.hashSync(user.password, 11);
            students.update({id: userid}, user, function(err, res) {
                if (err) {
                    logger.error(err);
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

/*
 * Check the hash of pass against the password stored in userobj.
 */
var validatePassword = function(userobj, pass, callback) {
    bcrypt.compare(pass, userobj.password, function(err, res) {
        callback(res);
    });
}
