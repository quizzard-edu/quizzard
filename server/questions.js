/*
Copyright (C) 2016
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
const settings = require('./settings.js');
const vfs = require('./virtualFileSystem.js');

/**
 * Preparing data on update/edit of a question
 *
 * @param {object} question
 */
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

/**
 * Prepare question data on first pass to DB
 *
 * @param {object} question
 * @param {function} callback
 */
var prepareQuestionData = function(question, callback) {
    // prepare regular data
    var currentDate = common.getDateByFormat('YYYY-MM-DD');
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
    questionToAdd.userSubmissionTime = [];
    questionToAdd.deleted = false;
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
            return callback(common.getError(3001), null)
    }

    return callback(null, questionToAdd);
}

/**
 * Insert a new question into the database.
 * The question object passed to the function should have
 * the text, topic, type, answer, minpoints, maxpoints and hint set.
 *
 * @param {object} question
 * @param {function} callback
 */
exports.addQuestion = function(question, callback) {
    prepareQuestionData(question, function(err, questionToAdd) {
        if (err) {
            return callback(err, null)
        }

        // validate constant question attributes
        result = questionValidator.questionCreationValidation(questionToAdd);
        if (result.success) {
            db.addQuestion(questionToAdd, function (err, questionId) {
                if (err) {
                    return callback(common.getError(3018), null);
                }

                vfs.mkdir(common.vfsTree.QUESTIONS, questionToAdd._id, common.vfsPermission.OWNER, function (err, result) {
                    logger.log(common.formatString('Creating question directory: {0} {1}', [questionToAdd._id, err ? err : 'ok']));
                });

                return callback(null, questionId);
            });
        } else{
            return callback(result.err, null)
        }
    })
}

/**
 * Replace a question in the database with the provided question object.
 *
 * @param {string} questionId
 * @param {object} info
 * @param {function} callback
 */
exports.updateQuestionById = function(questionId, info, callback) {
    updateQuestionById(questionId, info, callback);
}

/**
 * Replace a question in the database with the provided question object.
 *
 * @param {string} questionId
 * @param {object} info
 * @param {function} callback
 */
var updateQuestionById = function(qId, infoToUpdate, callback) {
    // Get Type of question and validate it
    lookupQuestionById(qId, function(err, question) {
        if (err) {
            return callback(common.getError(3019), null);
        }
        infoToUpdate = questionUpdateParser(infoToUpdate);

        // validate each field that will be updated
        const result = questionValidator.validateAttributeFields(infoToUpdate, question.type);
        if (result.success) {
            db.updateQuestionById(qId, infoToUpdate, callback);
        } else {
            return callback(result.err, null)
        }
    });
}

/**
 * Deactivate the question with ID qid from the database.
 *
 * @param {string} questionId
 * @param {function} callback
 */
exports.deleteQuestion = function(questionId, callback) {
    lookupQuestionById(questionId, function(err, questionObj){
        if (err) {
            logger.error(JSON.stringify(err));
            return callback(common.getError(3023), null);
        }

        var query = {_id:questionId};
        var update = {};
        update.$set = {'deleted':true};

        db.updateQuestionByQuery(query, update, function(err, res){
            if (err) {
                logger.error(JSON.stringify(err));
                return callback(common.getError(3023), null);
            }
            logger.log(common.formatString('Question {0} deleted from database.', [questionId]));
            return callback(null, res);
        });
    });
}

/**
 * Extract a question object from the database using its ID.
 *
 * @param {string} questionId
 * @param {function} callback
 */
exports.lookupQuestionById = function(questionId, callback) {
    lookupQuestionById(questionId, callback);
}

/**
 * lookup question in database
 *
 * @param {string} questionId
 * @param {function} callback
 */
var lookupQuestionById = function(questionId, callback) {
    db.lookupQuestion({_id: questionId}, callback);
}

/**
 * adding rating to question collection
 *
 * @param {string} questionId
 * @param {string} userId
 * @param {number} rating
 * @param {function} callback
 */
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

/**
 * get all questions list
 *
 * @param {function} callback
 */
exports.getAllQuestionsList = function(callback) {
    db.getQuestionsList({}, {number: 1}, callback);
}

/**
 * get all questions list by Query
 *
 * @param {object} findQuery
 * @param {object} sortQuery
 * @param {function} callback
 */
exports.getAllQuestionsByQuery = function(findQuery, sortQuery, callback) {
    db.getQuestionsList(findQuery, sortQuery, callback);
}

/**
 * submit answer
 *
 * @param {string} questionId
 * @param {string} userId
 * @param {boolean} correct
 * @param {number} points
 * @param {*} answer
 * @param {function} callback
 */
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

/**
 * verify answer based on type
 *
 * @param {object} question
 * @param {*} answer
 */
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

/**
 * verify choose all question answer
 *
 * @param {object} question
 * @param {*} answer
 */
var verifyChooseAllQuestionAnswer = function(question,answer) {
    if (!questionValidator.validateAttributeType(answer,'answer','CHOOSEALL') ||
        !questionValidator.validateArrayObject(answer,'String')) {
        return false;
    }
    return question.answer.sort().join(',') === answer.sort().join(',');
}

/**
 * verify matching question answer
 *
 * @param {object} question
 * @param {*} answer
 */
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

/**
 * Check if answer submitted is correct for Ordering question Type
 *
 * @param {object} question
 * @param {*} answer
 */
var verifyOrderingQuestionAnswer = function(question,answer) {
    if (!questionValidator.validateAttributeType(answer,'answer','ORDERING') ||
        !questionValidator.validateArrayObject(answer,'String')) {
        return false;
    }
    return question.answer.join(',') === answer.join(',');
}

/**
 * add comment to question by id with user and comment
 *
 * @param {string} questionId
 * @param {string} userId
 * @param {string} comment
 * @param {function} callback
 */
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

/**
 * add reply to comment by id with user and reply
 *
 * @param {string} commentId
 * @param {string} userId
 * @param {string} reply
 * @param {function} callback
 */
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

/**
 * vote on a comment
 *
 * The way votes work:
 * if the user already voted up, then if they vote up again the previous vote
 * will get cancelled. Same for vote down.
 * if the user already voted up, then vote down the previous vote gets removed
 * and the new vote gets added.
 * if they never voted before, just add the vote
 *
 * @param {string} commentId
 * @param {number} vote
 * @param {string} userId
 * @param {function} callback
 */
exports.voteComment = function (commentId, vote, userId, callback) {
    var query = {'comments._id': commentId};
    var update = {};
    var voteValue = -2;

    db.lookupQuestion(query, function(err, question) {
        if (err) {
            return callback(common.getError(3019), null);
        }

        if (!question) {
            return callback(common.getError(3003), null);
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

        return callback(common.getError(3015), null);
    });
}

/**
 * vote on a reply
 *
 * @param {string} replyId
 * @param {number} vote
 * @param {string} userId
 * @param {function} callback
 */
exports.voteReply = function (replyId, vote, userId, callback) {
    var query = {'comments.replies._id': replyId};
    var update = {};
    var voteValue = -2;

    db.lookupQuestion(query, function(err, question) {
        if (err) {
            return callback(common.getError(3019), null);
        }

        if (!question) {
            return callback(common.getError(3003), null);
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
        }

        return callback(common.getError(3016), null);
    });
}

/**
 * check if the user is locked from answering the question
 *
 * @param {string} userId
 * @param {object} question
 * @param {function} callback
 */
exports.isUserLocked = function(userId, question, callback){
    if (!settings.getQuestionTimeoutEnabled()){
        return callback(null,false,null);
    }
    var waiting_time = settings.getQuestionTimeoutPeriod();
    var lastSubmissionTime;
    var currentDate = common.getDateObject();

    // check if user already got the question correct
    for (var obj = 0; obj < question.correctAttempts.length; obj ++){
        if(question.correctAttempts[obj]['userId'] === userId){
            return callback(null,false,null);
        }
    }
    // find the lastSubmissionTime for this user
    for (var obj = 0; obj < question.userSubmissionTime.length; obj++){
        if(question.userSubmissionTime[obj]['userId'] === userId){
            lastSubmissionTime = question.userSubmissionTime[obj]['submissionTime'];
            break;
        }
    }

    if(lastSubmissionTime){
        const diff = Math.abs(currentDate - lastSubmissionTime);
        const timeLeftToWait = waiting_time - diff;
        if (diff < waiting_time){
            return callback(null,true,common.getTime(timeLeftToWait), timeLeftToWait);
        }
    }
    return callback(null,false,null);
}

/**
 * Updates the Users Submission time for a Question
 *
 * @param {string} userId
 * @param {object} question
 * @param {function} callback
 */
exports.updateUserSubmissionTime = function(userId, question, callback){
    var query = {_id:question._id};
    var update = {};
    var currentDate = common.getDateObject();
    var userInList = false;
    // find the user in the submission list
    for (var obj = 0; obj < question.userSubmissionTime.length; obj++){
        if(question.userSubmissionTime[obj]['userId'] === userId){
            userInList = true;
            break;
        }
    }

    if(userInList){
        query['userSubmissionTime.userId'] = userId;
        update.$set = {"userSubmissionTime.$.submissionTime":currentDate};
        db.updateQuestionByQuery(query, update, function (err, result){
            if(err){
                return callback(err,null);
            }
            return callback(null,'success');
        });

    } else {
        update.$push = {'userSubmissionTime': {'userId':userId, submissionTime: currentDate}};
        db.updateQuestionByQuery(query, update, function (err, result){
            if(err){
                return callback(err,null);
            }
            return callback(null,'success');
        });
    }
}

/**
 * Changes visibilty of all questions based on the changeValue
 *
 * @param {boolean} changeValue
 * @param {funciton} callback
 */
exports.changeAllVisibility = function(changeValue, callback) {
    // Gets the list of students
    db.getQuestionsList({}, {number: 1}, function(err, questionList){
        if (err) {
            return callback(common.getError(3017), null);
        }

        questionList.forEach(question => {
            // Only change visibility of a question if it is different from the current visibility value
            if (question.visible !== changeValue) {
                // Question with only visibility because we don't want to change the other attributes of the question
                var newQuestion = {};
                newQuestion['visible'] = changeValue.toString();

                // Updates question with new visibility value.
                updateQuestionById(question._id, newQuestion, function(err, result) {
                    if (err) {
                        return callback(common.getError(3020), result);
                    }
                });
            }
        });

        return callback(null, 'success');
    });
}
