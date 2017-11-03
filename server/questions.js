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
var uuidv1 = require('uuid/v1');

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

    questionToAdd._id = uuidv1();
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
    questionToAdd.comments = [];

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
            return callback(err, null)
        }

        // validate constant question attributes
        result = questionValidator.questionCreationValidation(questionToAdd);
        if (result.success){
            return db.addQuestion(questionToAdd, callback);
        } else{
            return callback(result, null)
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
    lookupQuestionById(qId, function(err, question){
        if(err){
            return callback({status:500, msg:err},null);
        }
        infoToUpdate = questionUpdateParser(infoToUpdate);

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

// lookup question in database
var lookupQuestionById = function(questionId, callback) {
    db.lookupQuestion({_id: questionId}, callback);
}

// adding rating to question collection
exports.submitRating = function (questionId, userId, rating, callback) {
    var currentDate = new Date().toString();
    var query = {_id: questionId};
    var update = {};

    update.$push = {};
    update.$push.ratings = {
        user: userId,
        date: currentDate,
        rating: rating
    }

    db.updateQuestionByQuery(query, update, function (err,result) {
        return callback(err, result);
    });
}

// get all questions list
exports.getAllQuestionsList = function(callback) {
    db.getQuestionsList({}, {id: 1}, callback);
}

// submit answer
exports.submitAnswer = function(questionId, userId, correct, points, answer, callback) {
    var currentDate = new Date().toString();
    var query = {_id: questionId};
    var update = {};

    update.$push = {};
    update.$inc = {};

    query['correctAttempts.id'] = { $ne : userId };
    if (correct) {
        update.$inc.correctAttemptsCount = 1;
        update.$push.correctAttempts = {
            id : userId,
            points: points,
            answer: answer,
            date : currentDate
        };
    } else {
        update.$inc.wrongAttemptsCount = 1;
        update.$push.wrongAttempts = {
            id : userId,
            attemp: answer,
            date : currentDate
        };
    }
    update.$inc.totalAttemptsCount = 1;
    update.$push.totalAttempts = {
        id : userId,
        attemp: answer,
        date : currentDate
    };

    db.updateQuestionByQuery(query, update, function (err,result) {
        return callback(err, result);
    });
}

// verify answer based on type
exports.verifyAnswer = function(question, answer) {
    var value = false;

    if (question.type === common.questionTypes.MATCHING.value && answer) {
        var ansLeftSide = answer[0];
        var ansRightSide = answer[1];

        if (ansLeftSide.length === question.leftSide.length) {
            var checkIndexLeft;
            var checkIndexRight;

            for (i = 0; i < ansLeftSide.length; i++) {
                checkIndexLeft = question.leftSide.indexOf(ansLeftSide[i]);
                checkIndexRight = question.rightSide.indexOf(ansRightSide[i]);
                if (checkIndexLeft !== checkIndexRight) {
                    return value = false;
                }
            }

            if (!value) {
                return value = true;
            }
        }

        return value = false;
    }

    return value = (answer === question.answer);
}

// add comment to question by id with user and comment
exports.addComment = function (questionId, userId, comment, callback) {
    var currentDate = new Date().toString();
    var query = {_id: questionId};
    var update = {};
    update.$push = {};
    update.$push.comments = {
        date: currentDate,
        id: userId,
        likesCount: 0,
        dislikesCount: 0,
        replis: [],
        comment: comment
    };

    db.updateQuestionByQuery(query, update, function (err,result) {
        return callback(err, result);
    });
}