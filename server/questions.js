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

const db = require('./db.js');
const logger = require('./log.js');
const common = require('./common.js');
const questionValidator = require('./questionValidator.js');

/*Preparing data on update/edit of a question */
var questionUpdateParser = function(question) {
    var updatedQuestion = question;

    if ('visible' in question) {
        updatedQuestion.visible = (question.visible === 'true');
    }

    if ('minpoints' in question) {
        updatedQuestion.minpoints = parseInt(question.minpoints);
    }

    if ('maxpoints' in question) {
        updatedQuestion.maxpoints = parseInt(question.maxpoints);
    }

    return updatedQuestion;
}

/*Prepare question data on first pass to DB*/
var prepareQuestionData = function(question, callback) {
    // prepare regular data
    var currentDate = common.getDate();
    var questionToAdd = {};

    questionToAdd._id = common.getUUID();
    questionToAdd.topic = question.topic;
    questionToAdd.title = question.title;
    questionToAdd.text = question.text;
    questionToAdd.hint = question.hint;
    questionToAdd.minpoints = parseInt(question.minpoints);
    questionToAdd.maxpoints = parseInt(question.maxpoints);
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
            questionToAdd.answer = question.answer;
            break;

        case common.questionTypes.MATCHING.value:
            questionToAdd.type = common.questionTypes.MATCHING.value;
            questionToAdd.leftSide = question.leftSide;
            questionToAdd.rightSide = question.rightSide;
            break;

        case common.questionTypes.CHOOSEALL.value:
            questionToAdd.type = common.questionTypes.CHOOSEALL.value;
            questionToAdd.choices = question.choices;
            questionToAdd.answer = question.answer;
            break;

        case common.questionTypes.ORDERING.value:
            questionToAdd.type = common.questionTypes.ORDERING.value;
            questionToAdd.answer = question.answer;
            break;

        default:
            return callback({status:400, msg:'Type of Question is Undefined'}, null)
    }

    return callback(null, questionToAdd);
}

/*
* Insert a new regular question into the database.
* The question object passed to the function should have
* the text, topic, type, answer, minpoints, maxpoints and hint set.
*/
exports.addQuestion = function(question, callback) {
    prepareQuestionData(question, function(err, questionToAdd) {
        if(err) {
            return callback(common.getError(1067), null)
        }

        // validate constant question attributes
        result = questionValidator.questionCreationValidation(questionToAdd);
        if (result.success) {
            db.addQuestion(questionToAdd, function (err, questionId) {
                if (err) {
                    return callback(common.getError(1060), null);
                }

                common.mkdir(common.fsTree.QUESTIONS, questionToAdd._id, function (err, result) {
                    logger.log(common.formatString('Creating question directory: {0} {1}', [questionToAdd._id, err ? err : result]));
                });

                return callback(null, questionId);
            });
        } else{
            return callback(common.getError(1068), null)
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

var updateQuestionById = function(qId, infoToUpdate, callback) {
    // Get Type of question and validate it
    lookupQuestionById(qId, function(err, question) {
        if(err) {
            return callback(common.getError(1062), null);
        }
        infoToUpdate = questionUpdateParser(infoToUpdate);

        // validate each field that will be updated
        var result = questionValidator.validateAttributeFields(infoToUpdate, question.type);
        if (result.success) {
            db.updateQuestionById(qId, infoToUpdate, callback);
        } else {
            return callback(common.getError(1068), null)
        }
    });
}

/* Remove the question with ID qid from the database. */
exports.deleteQuestion = function(questionId, callback) {
    questions.remove({_id: questionId}, function(err, res) {
        if (err) {
            logger.error(err);
            return callback(common.getError(1069), null);
        }

        logger.log(common.formatString('Question {0} deleted from database.', [questionId]));
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
    var currentDate = common.getDate();
    var query = {_id: questionId};
    var update = {};

    update.$push = {};
    update.$push.ratings = {
        userId: userId,
        date: currentDate,
        rating: rating
    }

    db.updateQuestionByQuery(query, update, function (err,result) {
        return callback(err, result);
    });
}

// get all questions list
exports.getAllQuestionsList = function(callback) {
    db.getQuestionsList({}, {number: 1}, callback);
}

// submit answer
exports.submitAnswer = function(questionId, userId, correct, points, answer, callback) {
    var currentDate = common.getDate();
    var query = {_id: questionId};
    var update = {};

    update.$push = {};
    update.$inc = {};

    query['correctAttempts.userId'] = { $ne : userId };
    if (correct) {
        update.$inc.correctAttemptsCount = 1;
        update.$push.correctAttempts = {
            userId : userId,
            points: points,
            answer: answer,
            date : currentDate
        };
    } else {
        update.$inc.wrongAttemptsCount = 1;
        update.$push.wrongAttempts = {
            userId : userId,
            attemp: answer,
            date : currentDate
        };
    }
    update.$inc.totalAttemptsCount = 1;
    update.$push.totalAttempts = {
        userId : userId,
        attemp: answer,
        date : currentDate
    };

    db.updateQuestionByQuery(query, update, function (err,result) {
        return callback(err, result);
    });
}

// verify answer based on type
exports.verifyAnswer = function(question, answer) {
    if (answer) {
        switch (question.type) {
            case common.questionTypes.MATCHING.value:
                return verifyMatchingQuestionAnswer(question,answer);
            case common.questionTypes.CHOOSEALL.value:
                return verifyChooseAllQuestionAnswer(question,answer);
            case common.questionTypes.ORDERING.value:
                return verifyOrderingQuestionAnswer(question,answer);
            default:
                return (answer === question.answer);
        }
    }
    return false;
}

var verifyChooseAllQuestionAnswer = function(question,answer) {
    if (!questionValidator.validateAttributeType(answer,'answer','CHOOSEALL') ||
        !questionValidator.validateArrayObject(answer,'String')) {
        return false;
    }
    return question.answer.sort().join(',') === answer.sort().join(',');
}

var verifyMatchingQuestionAnswer = function(question, answer) {
    if (!questionValidator.validateAttributeType(answer,'Array','DATATYPES') ||
        !questionValidator.validateArrayObject(answer,'Array') ||
        !questionValidator.validateArrayObject(answer[0],'String') ||
        !questionValidator.validateArrayObject(answer[1],'String')) {
        return false;
    }

    var ansLeftSide = answer[0];
    var ansRightSide = answer[1];

    if (ansLeftSide.length === question.leftSide.length) {
        var checkIndexLeft;
        var checkIndexRight;

        for (i = 0; i < ansLeftSide.length; i++) {
            checkIndexLeft = question.leftSide.indexOf(ansLeftSide[i]);
            checkIndexRight = question.rightSide.indexOf(ansRightSide[i]);
            if (checkIndexLeft !== checkIndexRight) {
                return false;
            }
        }
        return true;
    }
    return false;
}
// Check if answer submitted is correct for Ordering question Type
var verifyOrderingQuestionAnswer = function(question,answer) {
    if (!questionValidator.validateAttributeType(answer,'answer','ORDERING') ||
        !questionValidator.validateArrayObject(answer,'String')) {
        return false;
    }
    return question.answer.join(',') === answer.join(',');
}
// add comment to question by id with user and comment
exports.addComment = function (questionId, userId, comment, callback) {
    var currentDate = common.getDate();
    var query = {_id: questionId};
    var update = {};

    update.$push = {};
    update.$push.comments = {
        _id: common.getUUID(),
        date: currentDate,
        userId: userId,
        likes: [],
        dislikes: [],
        likesCount: 0,
        dislikesCount: 0,
        replies: [],
        repliesCount: 0,
        comment: comment
    };

    db.updateQuestionByQuery(query, update, function (err, result) {
        return callback(err, result);
    });
}

// add reply to comment by id with user and reply
exports.addReply = function (commentId, userId, reply, callback) {
    var currentDate = common.getDate();
    var query = {'comments._id': commentId};
    var update = {};

    update.$push = {};
    update.$inc = {};
    update.$inc['comments.$.repliesCount'] = 1;
    update.$push['comments.$.replies'] = {
        _id: common.getUUID(),
        date: currentDate,
        userId: userId,
        likes: [],
        dislikes: [],
        likesCount: 0,
        dislikesCount: 0,
        reply: reply
    };

    db.updateQuestionByQuery(query, update, function (err, result) {
        return callback(err, result);
    });
}

/*
The way votes work:
if the user already voted up, then if they vote up again the previous vote
will get cancelled. Same for vote down.
if the user already voted up, then vote down the previous vote gets removed
and the new vote gets added.
if they never voted before, just add the vote
*/
// vote on a comment
exports.voteComment = function (commentId, vote, userId, callback) {
    var query = {'comments._id': commentId};
    var update = {};
    var voteValue = -2;

    db.lookupQuestion(query, function(err, question) {
        if (err) {
            return callback(common.getError(1062), null);
        }

        if (!question) {
            return callback(common.getError(1015), null);
        }

        var comments = question.comments;
        for (var i in comments) {
            if (comments[i]._id === commentId) {
                var userUpVoted = comments[i].likes.indexOf(userId) !== -1;
                var userDownVoted = comments[i].dislikes.indexOf(userId) !== -1;
                var updatedLikesCount = comments[i].likesCount;
                var updatedDisLikesCount = comments[i].dislikesCount;

                if (userUpVoted && userDownVoted) {
                    return callback('User liked and disliked a comment at the sametime', null);
                }

                if (userUpVoted) {
                    updatedLikesCount--;
                    voteValue = 0;
                    update.$pull = { 'comments.$.likes': userId };
                    update.$inc = { 'comments.$.likesCount': -1 };

                    if (vote === -1) {
                        updatedDisLikesCount++;
                        voteValue = -1;
                        update.$push = { 'comments.$.dislikes': userId };
                        update.$inc['comments.$.dislikesCount'] = 1;
                    }
                }

                if (userDownVoted) {
                    updatedDisLikesCount--;
                    voteValue = 0;
                    update.$pull = { 'comments.$.dislikes': userId };
                    update.$inc = { 'comments.$.dislikesCount': -1 };

                    if (vote === 1) {
                        updatedLikesCount++;
                        voteValue = 1;
                        update.$push = { 'comments.$.likes': userId };
                        update.$inc['comments.$.likesCount'] = 1;
                    }
                }

                if (!userUpVoted && !userDownVoted) {
                    if (vote === 1) {
                        updatedLikesCount++;
                        update.$push = { 'comments.$.likes': userId };
                        update.$inc = { 'comments.$.likesCount': 1 };
                    }

                    if (vote === -1) {
                        updatedDisLikesCount++;
                        update.$push = { 'comments.$.dislikes': userId };
                        update.$inc = { 'comments.$.dislikesCount': 1 };
                    }

                    voteValue = vote;
                }

                return db.updateQuestionByQuery(query, update, function (err, result) {
                    return callback(err, {
                        result: result,
                        voteValue: voteValue,
                        likesCount: updatedLikesCount,
                        dislikesCount: updatedDisLikesCount
                    });
                });
            }
        }

        return callback(common.getError(1035), null);
    });
}

// vote on a reply
exports.voteReply = function (replyId, vote, userId, callback) {
    var query = {'comments.replies._id': replyId};
    var update = {};
    var voteValue = -2;

    db.lookupQuestion(query, function(err, question) {
        if (err) {
            return callback(common.getError(1062), null);
        }

        if (!question) {
            return callback(common.getError(1015), null);
        }

        // TODO: optimize this using mongodb projections
        var comments = question.comments;
        for (var commentIndex in comments) {
            var replies = comments[commentIndex].replies;
            for (var replyIndex in replies) {
                if (replies[replyIndex]._id === replyId) {
                    var userUpVoted = replies[replyIndex].likes.indexOf(userId) !== -1;
                    var userDownVoted = replies[replyIndex].dislikes.indexOf(userId) !== -1;
                    var updatedLikesCount = replies[replyIndex].likesCount;
                    var updatedDisLikesCount = replies[replyIndex].dislikesCount;
                    var commonPrefix = 'comments.' + commentIndex + '.replies.' + replyIndex;

                    if (userUpVoted && userDownVoted) {
                        return callback('User liked and disliked a comment at the sametime', null);
                    }

                    if (userUpVoted) {
                        updatedLikesCount--;
                        voteValue = 0;
                        var commentsreplieslikes = commonPrefix + '.likes';
                        var commentsreplieslikesCount = commonPrefix + '.likesCount';
                        update.$pull = {};
                        update.$inc = {};
                        update.$pull[commentsreplieslikes] = userId;
                        update.$inc[commentsreplieslikesCount] = -1;

                        if (vote === -1) {
                            updatedDisLikesCount++;
                            voteValue = -1;
                            var commentsrepliesdislikes = commonPrefix + '.dislikes';
                            var commentsrepliesdislikesCount = commonPrefix + '.dislikesCount';
                            update.$push = {};
                            update.$push[commentsrepliesdislikes] = userId;
                            update.$inc[commentsrepliesdislikesCount] = 1;
                        }
                    }

                    if (userDownVoted) {
                        updatedDisLikesCount--;
                        voteValue = 0;
                        var commentsrepliesdislikes = commonPrefix + '.dislikes';
                        var commentsrepliesdislikesCount = commonPrefix + '.dislikesCount';
                        update.$pull = {};
                        update.$inc = {};
                        update.$pull[commentsrepliesdislikes] = userId;
                        update.$inc[commentsrepliesdislikesCount] = -1;

                        if (vote === 1) {
                            updatedLikesCount++;
                            voteValue = 1;
                            var commentsreplieslikes = commonPrefix + '.likes';
                            var commentsreplieslikesCount = commonPrefix + '.likesCount';
                            update.$push = {};
                            update.$push[commentsreplieslikes] = userId;
                            update.$inc[commentsreplieslikesCount] = 1;
                        }
                    }

                    if (!userUpVoted && !userDownVoted) {
                        if (vote === 1) {
                            updatedLikesCount++;
                            var commentsreplieslikes = commonPrefix + '.likes';
                            var commentsreplieslikesCount = commonPrefix + '.likesCount';
                            update.$push = {};
                            update.$inc = {};
                            update.$push[commentsreplieslikes] = userId;
                            update.$inc[commentsreplieslikesCount] = 1;
                        }

                        if (vote === -1) {
                            updatedDisLikesCount++;
                            var commentsrepliesdislikes = commonPrefix + '.dislikes';
                            var commentsrepliesdislikesCount = commonPrefix + '.dislikesCount';
                            update.$push = {};
                            update.$inc = {};
                            update.$push[commentsrepliesdislikes] = userId;
                            update.$inc[commentsrepliesdislikesCount] = 1;
                        }

                        voteValue = vote;
                    }

                    return db.updateQuestionByQuery(query, update, function (err, result) {
                        return callback(err, {
                            result: result,
                            voteValue: voteValue,
                            likesCount: updatedLikesCount,
                            dislikesCount: updatedDisLikesCount
                        });
                    });
                }
            }

            return callback(common.getError(1036), null);
        }
    });
}
