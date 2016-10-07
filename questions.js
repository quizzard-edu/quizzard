var db = require('./db.js').database;

var questions = db.collection('questions');

exports.QUESTION_REGULAR    = 0;
exports.QUESTION_MULTCHOICE = 1;

/*
 * Insert a new question into the database.
 * The question object passed to the function should have
 * the text, topic, type, answer, basePoints and hint set.
 */
exports.addQuestion = function(question, callback) {
    question.id = 0;
    question.attempts = 0;
    question.correctAnswers = 0;
    question.firstAnswer = '';
    question.studentsAnswered = [];
}
