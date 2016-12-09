var db = require('./db.js').database;
var students = require('./students.js');

var questions = db.collection('questions');
exports.questions = questions;

exports.QUESTION_REGULAR    = 0;
exports.QUESTION_MULTCHOICE = 1;

var nextid;

/* initialize nextid */
questions.count(function(err, num) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    if (num == 0) {
        nextid = 0;
    } else {
        /* get the maximum question id in the database */
        questions.find().sort({id: -1}).limit(1).toArray(function(err, docs) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            nextid = docs[0].id + 1;
        });
    }
});

/*
 * Insert a new question into the database.
 * The question object passed to the function should have
 * the text, topic, type, answer, basePoints and hint set.
 */
exports.addQuestion = function(question, callback) {
    question.id = nextid++;
    question.attempts = 0;
    question.correctAnswers = 0;
    question.firstAnswer = '';
    question.studentsAnswered = [];
    questions.insert(question, function(err, res) {
        if (err) {
            callback('failure');
        } else {
            console.log(res);
            callback('success');
        }
    });
}

/* Remove the question with ID qid from the database. */
exports.deleteQuestion = function(qid, callback) {
    questions.remove({id: qid}, function(err, res) {
        if (err) {
            console.log(err);
            callback('failure');
        } else {
            console.log('Question %d deleted', qid);
            callback('success');
        }
    });
}

/* Extract a question object from the database using its ID. */
exports.lookupQuestion = function(qid, callback) {
    if (qid < 0 || qid > nextid - 1) {
        callback('invalid');
        return;
    }
    questions.findOne({id: qid}, function(err, q) {
        /* necessary for later database update */
        delete q._id;
        if (err || !q)
            callback('failure');
        else
            callback(q);
    });
}

/*
 * Check if the provided answer matches the answer in the question object.
 * Update the question object in the database and call the callback function
 * with the result of the comparison and the new question object.
 */
exports.checkAnswer = function(question, answer, user, callback) {
    var result, re;

    question.attempts++;
    user.attempted++;
    console.log('User %s attempted to answer question %d with "%s"',
                user.id, question.id, answer);

    re = new RegExp(question.answer, 'i');
    if (answer.match(re)) {
        if (question.correctAnswers == 0)
            question.firstAnswer = user.id;
        if (!question.studentsAnswered.includes(user.id)) {
            question.correctAnswers++;
            question.studentsAnswered.push(user.id);
            /* update the user */
            user.answered++;
            user.answeredIds.push(question.id);
            user.points += question.basePoints;
        }
        result = 'correct';
    } else {
        result = 'incorrect';
    }

    students.updateAccount(user.id, user, function(res) {
        if (res == 'failure') {
            callback('failed-update');
            return;
        }
        questions.update({id: question.id}, question, function(err, res) {
            if (err) {
                console.log(err);
                callback('failed-update');
            } else {
                callback(result);
            }
        });
    });
}
