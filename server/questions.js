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
var questionValidator = require('./questionValidator.js');

/*Preparing data on update/edit of a question */
var questionUpdateParser = function(question){
	var updatedQuestion = question;
	if ('visible' in question){
		updatedQuestion.visible = (question.visible === 'true');
	}
	if ('points' in question){
		updatedQuestion.points = parseInt(question.points);
	}

	return updatedQuestion;
}

/*Prepare question data on first pass to DB*/
var prepareQuestionData = function(question, callback){
	// prepare regular data
	var currentDate = new Date().toString();
	var questionToAdd = {};

	questionToAdd.topic = question.topic;
	questionToAdd.title = question.title;
	questionToAdd.text = question.text;
	questionToAdd.hint = question.hint;
	questionToAdd.points = parseInt(question.points);
	questionToAdd.visible = (question.visible === 'true');
	questionToAdd.correctAttempts = [];
	questionToAdd.wrongAttempts = [];
	questionToAdd.totalAttempts = [];
	questionToAdd.correctAttemptsCount = 0;
	questionToAdd.wrongAttemptsCount = 0;
	questionToAdd.totalAttemptsCount = 0;
	questionToAdd.ctime = currentDate;
	questionToAdd.mtime = currentDate;
	questionToAdd.ratings = [];

	//Add specific attributes by Type
	switch (question.type) {
		case common.questionTypes.REGULAR.value:
			questionToAdd.type = common.questionTypes.REGULAR.value;
			questionToAdd.answer = question.answer;
			break;

		case common.questionTypes.MULTIPLECHOICE.value:
			questionToAdd.type = common.questionTypes.MULTIPLECHOICE.value;
			questionToAdd.choices = question.choices;
			questionToAdd.answer = question.answer;
			break;

		case common.questionTypes.TRUEFALSE.value:
			questionToAdd.type = common.questionTypes.TRUEFALSE.value;
			questionToAdd.choices = question.choices;
			questionToAdd.answer = question.answer;
			break;

		case common.questionTypes.MATCHING.value:
			questionToAdd.type = common.questionTypes.MATCHING.value;
			questionToAdd.leftSide = question.leftSide;
			questionToAdd.rightSide = question.rightSide;
			break;
        case common.questionTypes.CHOOSEALL.value:
			questionToAdd.type = common.questionTypes.CHOOSEALL.value;
			questionToAdd.choices = question.choices ? question.choices : [];
			break;
		default:
			return callback({status:400, msg:'Type of Question is Undefined'}, null)
	}

	return callback(null, questionToAdd);
}

/*
* Insert a new regular question into the database.
* The question object passed to the function should have
* the text, topic, type, answer, points and hint set.
*/
exports.addQuestion = function(question, callback) {
	prepareQuestionData(question, function(err, questionToAdd){
		if(err){
			return callback({status:400, msg:err.msg}, null)
		}

		// validate constant question attributes
		result = questionValidator.questionCreationValidation(questionToAdd);
		if (result.success){
			db.addQuestion(questionToAdd, callback);
		} else{
			return callback({status:400, msg:result.msg}, null)
		}
	})
}

/* Sort questions by the given sort type. */
exports.sortQuestions = function(qs, type, callback) {
    db.sortQuestions(qs, type, callback);
}

/* Replace a question in the database with the provided question object. */
exports.updateQuestionById = function(questionId, info, callback) {
	updateQuestionById(questionId, info, callback);
}

var updateQuestionById = function(qId, infoToUpdate, callback){
	// Get Type of question and validate it
	db.lookupQuestionById(qId, function(err, question){
		if(err){
			return callback({status:500, msg:err},null);
		}
		infoToUpdate = questionUpdateParser(infoToUpdate);
		if ('correct' in infoToUpdate) {
			return db.updateQuestionById(qId, infoToUpdate, callback);
		}
		// validate each field that will be updated
		var result = questionValidator.validateAttributeFields(infoToUpdate, question.type);
		if (result.success){
			db.updateQuestionById(qId, infoToUpdate, callback);
		} else {
			return callback({status:400, msg:result.msg}, null)
		}
	});
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
exports.checkAnswer = function(questionId, user, answer, callback) {
    logger.info('User %s attempted to answer question %d with "%s"', user.id, questionId, answer);
	var userType = user.type;
	var userId = user.id;

	lookupQuestionById(questionId, function(err, question){
		if(err || !question){
			return callback('error', null);
		}

		var value = null;

		if (question.type === common.questionTypes.MATCHING.value && answer) {
		    const ansLeftSide = answer[0];
			const ansRightSide = answer[1];

			if (ansLeftSide.length === question.leftSide.length) {
				var checkIndexLeft;
				var checkIndexRight;

				for (i = 0; i < ansLeftSide.length; i++) {
				    checkIndexLeft = question.leftSide.indexOf(ansLeftSide[i]);
						checkIndexRight = question.rightSide.indexOf(ansRightSide[i]);
						if (checkIndexLeft !== checkIndexRight) {
						    value = false;
						}
				}

				if (value === null) {
					  value = true;
				}
			} else {
				value = false;
			}
		} else {
		    value = (answer === question.answer);
		}

		if (userType === common.userTypes.ADMIN) {
			return callback(null, {correct: value, points: question.points});
		}

		db.updateStudentById(
			userId,
			{ questionId:questionId, correct:value, points:question.points, attempt:answer },
			function(err, res){
				updateQuestionById(
					questionId,
					{ userId:userId, correct:value, attempt:answer },
					function(err, res) {
						return callback(err, {correct: value, points: question.points});
					}
				);
			}
		);
	});
}

// adding rating to question collection
exports.submitRating = function (questionId, userId, rating, callback) {
	db.updateQuestionById(questionId, {userId: userId, rating: rating}, callback);
}

// get all questions list
exports.getAllQuestionsList = function(callback) {
	db.getQuestionsList({}, {id: 1}, callback);
}
