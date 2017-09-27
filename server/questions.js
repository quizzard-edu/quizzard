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
exports.addQuestionByTypeWithRedirection = function(qType, question, callback) {console.log(question);
	switch(qType){
		case common.questionTypes.REGULAR:
			addRegularQuestion(question, callback);
			break;
		case common.questionTypes.MULTIPLECHOICE:
			addMultipleChoiceQuestion(question, callback);
			break;
		default:
			callback('failure');
	}
}

exports.addRegularQuestion = function(question, callback) {	addRegularQuestion(question, callback); }
exports.addMultipleChoiceQuestion = function(question, callback) {	addMultipleChoiceQuestion(question, callback); }

var addRegularQuestion = function(question, callback) {
	var currentDate = new Date().toString();
	var questionToAdd = {};
	questionToAdd.topic = question.topic;
	questionToAdd.title = question.title;
	questionToAdd.text = question.text;
	questionToAdd.answer = question.answer;
	questionToAdd.hint = question.hint;
	questionToAdd.points = question.points;
	questionToAdd.type = common.questionTypes.REGULAR;
	questionToAdd.attempted = [];
	questionToAdd.answered = [];
	questionToAdd.attempts = [];
	questionToAdd.ctime = currentDate;
	questionToAdd.mtime = currentDate;
	db.addRegularQuestion(questionToAdd, function(res) {
		callback(res);
	});
}

var addMultipleChoiceQuestion = function(question, callback) {
	var currentDate = new Date().toString();
	var questionToAdd = {};
	questionToAdd.topic = question.topic;
	questionToAdd.title = question.title;
	questionToAdd.text = question.text;
	questionToAdd.answer = question.answer;
	questionToAdd.hint = question.hint;
	questionToAdd.points = question.points;
	questionToAdd.type = common.questionTypes.MULTIPLECHOICE;
	questionToAdd.attempted = [];
	questionToAdd.answered = [];
	questionToAdd.attempts = [];
	questionToAdd.ctime = currentDate;
	questionToAdd.mtime = currentDate;
	db.addMultipleChoiceQuestion(questionToAdd, function(res) {
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
exports.updateQuestionByIdWithRedirection = function(questionId, info, callback) {
	updateQuestionByIdWithRedirection(questionId, info, callback);
}

var updateQuestionByIdWithRedirection = function(questionId, info, callback) {
	lookupQuestionById(questionId, function(q){
		if(q){
			switch(q.type){
				case common.questionTypes.REGULAR:
			 		db.updateRegularQuestionById(questionId, info, callback);
					break;
				case common.questionTypes.MULTIPLECHOICE:
					db.updateMultipleChoiceQuestionById(questionId, info, callback);
					break;
				default:
					callback('failure');
			}
		}else{
			callback('failure');
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
exports.lookupQuestionById = function(qid, callback) {
    lookupQuestionById(qid, callback);
}

var lookupQuestionById = function(qid, callback) {
	db.lookupQuestionById(qid, callback);
}

/*
 * Check if the provided answer matches the answer in the question object.
 * Update the question object in the database and call the callback function
 * with the result of the comparison and the new question object.
 */
exports.checkAnswer = function(questionId, userId, answer, callback) {
    logger.info('User %s attempted to answer question %d with "%s"',
        userId, questionId, answer);

	lookupQuestionById(questionId, function(question){
		var value = answer===question.answer;
		db.updateStudentById(
			userId,
			{ questionId:questionId, correct:value, points:question.points },
			function(res){
				updateQuestionByIdWithRedirection(
					questionId,
					{ userId:userId, correct:value },
					function(res) {
						callback(value);
					}
				);
			}
		);
	});
}
