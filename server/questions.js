var db = require('./db.js').database;

var questions = db.collection('questions');

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
