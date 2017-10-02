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
var common = require('./common.js');

/*
 * Insert a new regular question into the database.
 * The question object passed to the function should have
 * the text, topic, type, answer, points and hint set.
 */
exports.addQuestionByType = function(qType, question, callback) {
	var currentDate = new Date().toString();console.log(qType+'    '+JSON.stringify(question));
	var questionToAdd = {};

	questionToAdd.topic = question.topic;
	questionToAdd.title = question.title;
	questionToAdd.text = question.text;
	questionToAdd.answer = question.answer;
	questionToAdd.hint = question.hint;
	questionToAdd.points = parseInt(question.points);
	questionToAdd.visible = (question.visible === 'true');
	questionToAdd.attempted = [];
	questionToAdd.answered = [];
	questionToAdd.attempts = [];
	questionToAdd.ctime = currentDate;
	questionToAdd.mtime = currentDate;

	switch (question.type) {
		case 're':
			questionToAdd.type = common.questionTypes.REGULAR;
			break;

		case 'mc':
			questionToAdd.type = common.questionTypes.MULTIPLECHOICE;
			questionToAdd.choices = question.choices;
			break;

		default:
			//callback('type is not defined', null);
			questionToAdd.type = common.questionTypes.REGULAR;
	}

	db.addQuestion(questionToAdd, callback);
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
exports.updateQuestionById = function(questionId, info, callback) {
	updateQuestionById(questionId, info, callback);
}

var updateQuestionById = function(questionId, info, callback) {
	db.updateQuestionById(questionId, info, callback);
}

/* Remove the question with ID qid from the database. */
exports.deleteQuestion = function(questionId, callback) {
    questions.remove({id: questionId}, function(err, res) {
        if (err) {
            logger.error(err);
            return callback(err, null);
		}

        logger.info('Question %d deleted from database.', questionId);
        return callback(null, 'success');
    });
}

/* Extract a question object from the database using its ID. */
exports.lookupQuestionById = function(questionId, callback) {
    lookupQuestionById(questionId, callback);
}

var lookupQuestionById = function(questionId, callback) {
	db.lookupQuestionById(questionId, callback);
}

/*
 * Check if the provided answer matches the answer in the question object.
 * Update the question object in the database and call the callback function
 * with the result of the comparison and the new question object.
 */
exports.checkAnswer = function(questionId, userId, answer, callback) {
    logger.info('User %s attempted to answer question %d with "%s"', userId, questionId, answer);

	lookupQuestionById(questionId, function(err, question){
		if(err){
			return callback(err, null);
		}

		var value = answer===question.answer;

		db.updateStudentById(
			userId,
			{ questionId:questionId, correct:value, points:question.points },
			function(err, res){
				updateQuestionById(
					questionId,
					{ userId:userId, correct:value },
					function(err, res) {
						return callback(err, value);
					}
				);
			}
		);
	});
}
