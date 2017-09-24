/*
question.js

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

var db = require('./db.js');
var logger = require('./log.js').logger;

var QUESTION_REGULAR    = 0;
var QUESTION_MULTCHOICE = 1;

/*
 * Insert a new regular question into the database.
 * The question object passed to the function should have
 * the text, topic, type, answer, points and hint set.
 */
exports.addRegularQuestion = function(question, callback) {
		var currentDate = new Date().toString();
		var questionToAdd = {};
		questionToAdd.topic = question.topic;
		questionToAdd.title = question.title;
		questionToAdd.text = question.text;
		questionToAdd.answer = question.answer;
		questionToAdd.hint = question.hint;
		questionToAdd.points = question.points;
		questionToAdd.type = QUESTION_REGULAR;
		questionToAdd.attempted = [];
		questionToAdd.answered = [];
		questionToAdd.attempts = [];
		questionToAdd.ctime = currentDate;
		db.addRegularQuestion(questionToAdd, function(res) {
        callback(res);
		});
}

/*
 * Fetch amount questions from the database, using findType to
 * determine how to select and sort them.
 *
 * findType is laid out as follows:
 *
 * SORTING
 * The first bit that matches is the sort criterion. If none match, don't sort.
 * 0th bit: default sort
 * 1st bit: randomly shuffle
 * 2nd bit: sort by topic
 * 3rd bit: sort by points
 *
 * QUERYING
 * 4th bit: if 1, allow questions that have already been answered by user.
 * 5th bit: if 1, only show those questions that have been answered (with bit 4).
 */
exports.findQuestions = function(amount, findType, user, callback) {
		db.findQuestions(amount, findType, user, callback);
}

/* Sort questions by the given sort type. */
exports.sortQuestions = function(qs, type, callback) {
    db.sortQuestions(qs, type, callback);
}


/* Replace a question in the database with the provided question object. */
exports.updateRegularQuestion = function(question, callback) {
    questions.update({id: question.id}, question, function(res) {
        if (err) {
            logger.error(err);
            callback('failure');
        } else {
            callback('success');
        }
    });
}

/* Remove the question with ID qid from the database. */
exports.deleteQuestion = function(qid, callback) {
    questions.remove({id: qid}, function(err, res) {
        if (err) {
            logger.error(err);
            callback('failure');
        } else {
            logger.info('Question %d deleted from database.', qid);
            callback('success');
        }
    });
}

/* Extract a question object from the database using its ID. */
exports.lookupQuestion = function(qid, callback) {
    db.lookupQuestion(qid, callback);
}

/*
 * Check if the provided answer matches the answer in the question object.
 * Update the question object in the database and call the callback function
 * with the result of the comparison and the new question object.
 */
exports.checkAnswer = function(questionId, userId, answer, callback) {
    logger.info('User %s attempted to answer question %d with "%s"',
                userId, questionId, answer);

		db.lookupQuestion(questionId, function(question){
				var value = answer===question.answer;
				db.updateStudentById(
						userId,
						{ questionId:questionId, correct:value, points:question.points },
						function(res){
								db.updateQuestionById(
										questionId,
										{ userId:userId, correct:value, answer:answer },
										function(res) {
												callback(res);
										}
								);
						}
				);
		});
}
