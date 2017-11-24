/*
The dataGenerator script

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

const logger = require('./../server/log.js');
const db = require('./../server/db.js');
const users = require('./../server/users.js');
const questions = require('./../server/questions.js');
const common = require('./../server/common.js');
const datagenInfo = require('./datagenInfo.js');

// constants to control the genereated data

const numberOfEachQuestion = {
    'regular': 2,
    'multipleChoice': 2,
    'trueFalse': 2,
    'matching': 2,
    'chooseAll': 2,
    'ordering': 2
};

const adminsCount = 2;
const studentsCount = 10;
const questionsMinMinValue = 10;
const questionsMaxMinValue = 20;
const questionsMinMaxValue = 60;
const questionsMaxMaxValue = 100;
const questionsAttempts = 10;
const commentsPerQuestion = 3;
const commentActionsPerQuestion = 3;
const commentRepliesVotesPerQuestion = 3;

// Probabilities used in generating data
const commentPercentage = 50;
const commentActionPercentage = 50;
const mentionsPercentage = 50;
const questionsCorrectPercentage = 40;

// variables used by the script for different functionality
// Do NOT change the variables below
var studentsIds = [];
var adminsIds = [];
var totalNumberOfQuestions = 0;
var questionsCount = 1;
var questionsIds = 0;
var numberOfQuestionsExpected = 0;
var adminsCreated = 0;
var studentsCreated = 0;
var questionsCreated = 0;
var questionsAnswered = 0;
var commentsAdded = 0;
var commentActionsAdded = 0;
var commentRepliesVotesAdded = 0;
var actualCommentsAdded = 0;
var actualRepliesAdded = 0;

/**
 * This function creates all the admins based on the variables
 */
var createAdmins = function () {
    for (var id = 0; id < adminsCount; id++) {
        addAdmin('Admin' + id, 'KonniChiwa');
    }
}

/**
 * This functions adds the accounts of admins
 *
 * @param {integer} accid
 * @param {string} pass
 */
var addAdmin = function (accid, pass) {
    var acc = {
        username: accid,
        password: pass,
        fname: accid,
        lname: accid,
        email: common.formatString('{0}@mail.utoronto.ca', [accid])
    };

    users.addAdmin(acc, function (err, account) {
        if (err === 'exists') {
            logger.log(common.formatString('Account with username {0} exists.', [accid]));
        } else if (err) {
            logger.error(common.formatString('Could not create account {0}. Please try again.', [accid]));
        }

        adminsCreated++;

        adminsIds.push(account._id);

        if (adminsCreated === adminsCount) {
            createStudents();
        }
    });
}

/**
 * This function creates all the students based on the variables
 */
var createStudents = function () {
    for (var id = 0; id < studentsCount; id++) {
        addStudent(datagenInfo.namesList[id], studentIdGenerator(datagenInfo.namesList[id]), 'KonniChiwa');
    }
}

/**
 * This functions adds the accounts of admins
 *
 * @param {integer} accid
 * @param {string} pass
 */
var addStudent = function (name, accid, pass) {
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ')[1];

    var acc = {
        username: accid,
        password: pass,
        fname: firstName,
        lname: lastName,
        email: common.formatString('{0}.{1}@mail.utoronto.ca', [firstName, lastName])
    };

    users.addStudent(acc, function (err, account) {
        if (err === 'exists') {
            logger.log(common.formatString('Account with username {0} exists.', [accid]));
        } else if (err) {
            logger.error(common.formatString('Could not create account {0}. Please try again.', [accid]));
        }

        studentsCreated++;

        studentsIds.push(account._id);

        if (studentsCreated === studentsCount) {
            createQuestionsRegular();
        }
    });
}

/**
 * This function creates all the regular type question based on the variables
 */
var createQuestionsRegular = function () {
    variableReset('regular');
    for (var id = questionsIds; id < questionsCount; id++) {
        addQuestionRegular('Is math related to science? ' + id, id);
    }
}

/**
 * This function adds the regular type question
 *
 * @param {string} qTopic
 * @param {integer} id
 */
var addQuestionRegular = function (qTopic, id) {
    const minMaxPoints = minMaxPointGenerator();

    var question = {
        topic: 'CSC492',
        title: qTopic,
        text: '<p>' + qTopic + ' Text</p>',
        answer: 'KonniChiwa',
        minpoints: minMaxPoints[0],
        maxpoints: minMaxPoints[1],
        type: common.questionTypes.REGULAR.value,
        hint: 'KonniChiwa',
        visible: 'true'
    };

    questions.addQuestion(question, function (err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.log(common.formatString('Questions {0} created', [id]));

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, adminsIds[i], Math.floor(Math.random() * 6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsRegular();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the regular type question based on the variables
 */
var answerQuestionsRegular = function () {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionRegular(id);
    }
}

/**
 * This function answers the regular type question
 *
 * @param {integer} questionId
 */
var answerQuestionRegular = function (questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = studentsIds[Math.floor(Math.random() * studentsCount)];
        var answer = 'NotKonniChiwa';

        if (Math.floor(Math.random() * 100) > (100 - questionsCorrectPercentage)) {
            answer = 'KonniChiwa';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.log(common.formatString('Questions {0} answered {1} by {2}', [questionId, correct? 'correctly' : 'incorrectly', studentId]));
            }

            if (questionsAnswered === numberOfQuestionsExpected * questionsAttempts) {
                createQuestionsMultipleChoice();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the multiple choice type question based on the variables
 */
var createQuestionsMultipleChoice = function () {
    variableReset('multipleChoice');
    for (var id = questionsIds; id < questionsCount; id++) {
        addQuestionMultipleChoice('Is math related to science? ' + id, id);
    }
}

/**
 * This function adds the multiple choice type question
 *
 * @param {string} qTopic
 * @param {integer} id
 */
var addQuestionMultipleChoice = function (qTopic, id) {
    const minMaxPoints = minMaxPointGenerator();

    var question = {
        topic: 'CSC492',
        title: qTopic,
        text: '<p>' + qTopic + ' Text</p>',
        answer: 'Option1',
        minpoints: minMaxPoints[0],
        maxpoints: minMaxPoints[1],
        type: common.questionTypes.MULTIPLECHOICE.value,
        hint: 'Option1',
        visible: 'true',
        choices: ['Option1', 'Option2', 'Option3', 'Option4']
    };

    questions.addQuestion(question, function (err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.log(common.formatString('Questions {0} created', [id]));

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, adminsIds[i], Math.floor(Math.random() * 6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsMultipleChoice();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the multiple choice type question based on the variables
 */
var answerQuestionsMultipleChoice = function () {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionMultipleChoice(id);
    }
}

/**
 * This function answers the multiple choice type question
 *
 * @param {integer} questionId
 */
var answerQuestionMultipleChoice = function (questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = studentsIds[Math.floor(Math.random() * studentsCount)];
        var answer = 'Option2';

        if (Math.floor(Math.random() * 100) > (100 - questionsCorrectPercentage)) {
            answer = 'Option1';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.log(common.formatString('Questions {0} answered {1} by {2}', [questionId, correct ? 'correctly' : 'incorrectly', studentId]));
            }

            if (questionsAnswered === numberOfQuestionsExpected * questionsAttempts) {
                createQuestionsTrueFalse();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the true and false type question based on the variables
 */
var createQuestionsTrueFalse = function () {
    variableReset('trueFalse');
    for (var id = questionsIds; id < questionsCount; id++) {
        addQuestionTrueFalse('Is math related to science? ' + id, id);
    }
}

/**
 * This function adds the true and false type question
 *
 * @param {string} qTopic
 * @param {integer} id
 */
var addQuestionTrueFalse = function (qTopic, id) {
    const minMaxPoints = minMaxPointGenerator();

    var question = {
        topic: 'CSC492',
        title: qTopic,
        text: '<p>' + qTopic + ' Text</p>',
        answer: 'true',
        minpoints: minMaxPoints[0],
        maxpoints: minMaxPoints[1],
        type: common.questionTypes.TRUEFALSE.value,
        hint: 'Option1',
        visible: 'true'
    };

    questions.addQuestion(question, function (err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.log(common.formatString('Questions {0} created', [id]));

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, adminsIds[i], Math.floor(Math.random() * 6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsTrueFalse();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the true and false type question based on the variables
 */
var answerQuestionsTrueFalse = function () {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionTrueFalse(id);
    }
}

/**
 * This function answers the true and false type question
 *
 * @param {integer} questionId
 */
var answerQuestionTrueFalse = function (questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = studentsIds[Math.floor(Math.random() * studentsCount)];
        var answer = 'false';

        if (Math.floor(Math.random() * 100) > (100 - questionsCorrectPercentage)) {
            answer = 'true';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.log(common.formatString('Questions {0} answered {1} by {2}', [questionId, correct ? 'correctly' : 'incorrectly', studentId]));
            }

            if (questionsAnswered === numberOfQuestionsExpected * questionsAttempts) {
                createQuestionsMatching();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the matching type question based on the variables
 */
var createQuestionsMatching = function () {
    variableReset('matching');
    for (var id = questionsIds; id < questionsCount; id++) {
        addQuestionMatching('Is math related to science? ' + id, id);
    }
}

/**
 * This function adds the matching type question
 *
 * @param {string} qTopic
 * @param {integer} id
 */
var addQuestionMatching = function (qTopic, id) {
    const minMaxPoints = minMaxPointGenerator();

    var question = {
        topic: 'CSC492',
        title: qTopic,
        text: '<p>' + qTopic + ' Text</p>',
        answer: 'true',
        minpoints: minMaxPoints[0],
        maxpoints: minMaxPoints[1],
        type: common.questionTypes.MATCHING.value,
        hint: 'Option1',
        visible: 'true',
        leftSide: ['l1', 'l2', 'l3'],
        rightSide: ['r1', 'r2', 'r3']
    };

    questions.addQuestion(question, function (err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.log(common.formatString('Questions {0} created', [id]));

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, adminsIds[i], Math.floor(Math.random() * 6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsMatching();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the matching type question based on the variables
 */
var answerQuestionsMatching = function () {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionMatching(id);
    }
}

/**
 * This function answers the matching type question
 *
 * @param {integer} questionId
 */
var answerQuestionMatching = function (questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = studentsIds[Math.floor(Math.random() * studentsCount)];
        var answer = [['l3', 'l2', 'l1'], ['r1', 'r2', 'r3']];

        if (Math.floor(Math.random() * 100) > (100 - questionsCorrectPercentage)) {
            answer = [['l1', 'l2', 'l3'], ['r1', 'r2', 'r3']];
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.log(common.formatString('Questions {0} answered {1} by {2}', [questionId, correct ? 'correctly' : 'incorrectly', studentId]));
            }

            if (questionsAnswered === numberOfQuestionsExpected * questionsAttempts) {
                createQuestionsChooseAll();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the choose all type question based on the variables
 */
var createQuestionsChooseAll = function () {
    variableReset('chooseAll');
    for (var id = questionsIds; id < questionsCount; id++) {
        addQuestionChooseAll('Is math related to science? ' + id, id);
    }
}

/**
 * This function adds the choose all type question
 *
 * @param {string} qTopic
 * @param {integer} id
 */
var addQuestionChooseAll = function (qTopic, id) {
    const minMaxPoints = minMaxPointGenerator();

    var question = {
        topic: 'CSC492',
        title: qTopic,
        text: '<p>' + qTopic + ' Text</p>',
        answer: ['c1', 'c2', 'c4'],
        minpoints: minMaxPoints[0],
        maxpoints: minMaxPoints[1],
        type: common.questionTypes.CHOOSEALL.value,
        hint: 'Option1',
        visible: 'true',
        choices: ['c1', 'c2', 'c3', 'c4']
    };

    questions.addQuestion(question, function (err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.log(common.formatString('Questions {0} created', [id]));

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, adminsIds[i], Math.floor(Math.random() * 6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsChooseAll();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the choose all type question based on the variables
 */
var answerQuestionsChooseAll = function () {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionChooseAll(id);
    }
}

/**
 * This function answers the choose all type question
 *
 * @param {integer} questionId
 */
var answerQuestionChooseAll = function (questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = studentsIds[Math.floor(Math.random() * studentsCount)];
        var answer = ['c1', 'c2', 'c3'];

        if (Math.floor(Math.random() * 100) > (100 - questionsCorrectPercentage)) {
            answer = ['c1', 'c2', 'c4'];
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.log(common.formatString('Questions {0} answered {1} by {2}', [questionId, correct ? 'correctly' : 'incorrectly', studentId]));
            }

            if (questionsAnswered === numberOfQuestionsExpected * questionsAttempts) {
                createQuestionsOrdering();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the ordering type question based on the variables
 */
var createQuestionsOrdering = function () {
    variableReset('ordering');
    for (var id = questionsIds; id < questionsCount; id++) {
        addQuestionOrdering('Is math related to science? ' + id, id);
    }
}

/**
 * This function adds the ordering type question
 *
 * @param {string} qTopic
 * @param {integer} id
 */
var addQuestionOrdering = function (qTopic, id) {
    const minMaxPoints = minMaxPointGenerator();

    var question = {
        topic: 'CSC492',
        title: qTopic,
        text: '<p>' + qTopic + ' Text</p>',
        answer: ['i1', 'i2', 'i3', 'c4'],
        minpoints: minMaxPoints[0],
        maxpoints: minMaxPoints[1],
        type: common.questionTypes.ORDERING.value,
        hint: 'Option1',
        visible: 'true'
    };

    questions.addQuestion(question, function (err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.log(common.formatString('Questions {0} created', [id]));

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, adminsIds[i], Math.floor(Math.random() * 6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsOrdering();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the ordering type question based on the variables
 */
var answerQuestionsOrdering = function () {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionOrdering(id);
    }
}

/**
 * This function answers the ordering type question
 *
 * @param {integer} questionId
 */
var answerQuestionOrdering = function (questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = studentsIds[Math.floor(Math.random() * studentsCount)];
        var answer = ['i1', 'i2', 'i3', 'c4'];

        if (Math.floor(Math.random() * 100) > (100 - questionsCorrectPercentage)) {
            answer = ['i1', 'i3', 'i2', 'c4'];
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.log(common.formatString('Questions {0} answered {1} by {2}', [questionId, correct ? 'correctly' : 'incorrectly', studentId]));
            }

            if (questionsAnswered === numberOfQuestionsExpected * questionsAttempts) {
                createComments();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates the comments on all the questions
 */
var createComments = function () {
    for (var id = 1; id <= totalNumberOfQuestions; id++) {
        logger.log(common.formatString('Creating comments for question {0}', [id]));
        addComments(id, function (err, res) { });
    }
}

/**
 * This function adds a number of comments to a given question based on
 * the number specified. It selects a random student to comment
 *
 * @param {integer} questionId
 * @param {function} callback
 */
var addComments = function (questionId, callback) {
    db.lookupQuestion({ number: questionId }, function (err, question) {
        questionId = question._id;
        if (err) {
            return callback(err, null);
        } else if (!question) {
            return callback('Could not find the question', null);
        } else {
            var answeredList = [];

            for (var i in question.correctAttempts) {
                answeredList.push(question.correctAttempts[i].userId);
            }

            var userId = answeredList[Math.floor(Math.random() * answeredList.length)];

            users.getUsersList(function (err, usersList) {
                if (err) {
                    return callback('could not find the list of users', null);
                }

                var totalList = [];

                for (var i in usersList) {
                    var user = usersList[i];

                    if (userId !== user._id &&
                        (user.type === common.userTypes.ADMIN
                            || answeredList.indexOf(user._id) !== -1)) {
                        totalList.push(user.fname + ' ' + user.lname);
                    }
                }

                for (var i = 0; i < commentsPerQuestion; i++) {
                    if (Math.floor(Math.random() * 100) > (100 - commentPercentage)) {
                        var userToMention = totalList[Math.floor(Math.random() * totalList.length)];
                        var comment;

                        if (Math.floor(Math.random() * 100) > (100 - mentionsPercentage)) {
                            comment = datagenInfo.comment + ' @' + userToMention;
                        } else {
                            comment = datagenInfo.comment;
                        }

                        questions.addComment(questionId, userId, comment, function (err, res) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                actualCommentsAdded++;
                            }

                            commentsAdded++;

                            if (commentsAdded === totalNumberOfQuestions * commentsPerQuestion) {
                                createCommentActions();
                            }
                        });
                    } else {
                        commentsAdded++;

                        if (commentsAdded === totalNumberOfQuestions * commentsPerQuestion) {
                            createCommentActions();
                        }
                    }

                }
            });
        }
    });
}

/**
 * This function creates comment actions, such as likes, dislikes, and replies.
 * It uses the globally defined settings to do so
 */
var createCommentActions = function () {
    for (var id = 1; id <= totalNumberOfQuestions; id++) {
        addCommentActions(id, function (err, res) { });
    }
}

/**
 * This function adds the action comments to the question specified
 *
 * @param {integer} questionId
 * @param {function} callback
 */
var addCommentActions = function (questionId, callback) {
    db.lookupQuestion({ number: questionId }, function (err, question) {
        questionId = question._id;
        if (err) {
            return callback(err, null);
        } else if (!question) {
            return callback('Could not find the question', null);
        } else {
            var answeredList = [];

            for (var i in question.correctAttempts) {
                answeredList.push(question.correctAttempts[i].userId);
            }

            var userId = answeredList[Math.floor(Math.random() * answeredList.length)];

            users.getUsersList(function (err, usersList) {
                if (err) {
                    return callback('could not find the list of users', null);
                }

                var totalList = [];

                for (var i in usersList) {
                    var user = usersList[i];

                    if (userId !== user._id &&
                        (user.type === common.userTypes.ADMIN
                            || answeredList.indexOf(user._id) !== -1)) {
                        totalList.push(user.fname + ' ' + user.lname);
                    }
                }

                for (var j = 0; j < question.comments.length; j++) {
                    for (var i = 0; i < commentActionsPerQuestion; i++) {
                        if (Math.floor(Math.random() * 100) > (100 - commentActionPercentage)) {
                            var userToMention = totalList[Math.floor(Math.random() * totalList.length)];
                            var vote = (Math.random() < 0.5) ? -1 : 1;

                            questions.voteComment(question.comments[j]._id, vote, userId, function (err, res) {
                                if (err) {
                                    return callback(err, null);
                                }

                                commentActionsAdded++;
                                if (commentActionsAdded === 2 * commentActionsPerQuestion * actualCommentsAdded) {
                                    createReplyActions();
                                }
                            });

                            var reply;

                            if (Math.floor(Math.random() * 100) > (100 - mentionsPercentage)) {
                                reply = datagenInfo.comment + ' @' + userToMention;
                            } else {
                                reply = datagenInfo.comment;
                            }

                            questions.addReply(question.comments[j]._id, userId, reply, function (err, res) {
                                if (err) {
                                    return callback(err, null);
                                } else {
                                    actualRepliesAdded++
                                }

                                commentActionsAdded++;

                                if (commentActionsAdded === 2 * commentActionsPerQuestion * actualCommentsAdded) {
                                    createReplyActions();
                                }
                            });
                        } else {
                            commentActionsAdded += 2;

                            if (commentActionsAdded === 2 * commentActionsPerQuestion * actualCommentsAdded) {
                                createReplyActions();
                            }
                        }

                    }
                }
            });
        }
    });
}

/**
 * This function creates reply actions, such as likes, and dislikes.
 * It uses the globally defined settings to do so
 */
var createReplyActions = function () {
    for (var id = 1; id <= totalNumberOfQuestions; id++) {
        addReplyActions(id, function (err, res) { });
    }
}

/**
 * This function adds the action replies to the question specified
 *
 * @param {integer} questionId
 * @param {function} callback
 */
var addReplyActions = function (questionId, callback) {
    db.lookupQuestion({ number: questionId }, function (err, question) {
        questionId = question._id;
        if (err) {
            return callback(err, null);
        } else if (!question) {
            return callback('Could not find the question', null);
        } else {
            var answeredList = [];

            for (var i in question.correctAttempts) {
                answeredList.push(question.correctAttempts[i].userId);
            }

            for (var j = 0; j < question.comments.length; j++) {
                for (var k = 0; k < question.comments[j].replies.length; k++) {
                    for (var i = 0; i < commentRepliesVotesPerQuestion; i++) {
                        commentRepliesVotesAdded++;

                        if (commentRepliesVotesAdded === commentRepliesVotesPerQuestion * actualRepliesAdded) {
                            setTimeout(function () {
                                process.exit(0);
                            }, 500);
                        }

                        if (Math.floor(Math.random() * 100) > (100 - commentActionPercentage)) {
                            userId = answeredList[Math.floor(Math.random() * answeredList.length)];
                            var vote = (Math.random() < 0.5) ? -1 : 1;

                            questions.voteReply(question.comments[j].replies[k]._id, vote, userId, function (err, res) {
                                if (err) {
                                    return callback(err, null);
                                }
                            });
                        }
                    }
                }
            }
        }
    });
}

/**
 * This function checks and answers the question specified, by the uer specified
 *
 * @param {integer} questionId
 * @param {string} userId
 * @param {string} answer
 * @param {function} callback
 */
var checkAnswer = function (questionId, userId, answer, callback) {
    logger.log(common.formatString('User {0} attempted to answer question {1} with "{2}"', [userId, questionId, answer]));
    db.lookupQuestion({ number: questionId }, function(err, question) {
        questionId = question._id;
        if (err) {
            return callback(err, null);
        } else if (!question) {
            return callback('Could not find the question', null);
        } else {
            var value = questions.verifyAnswer(question, answer);
            var points = Math.floor(Math.max(question.minpoints, question.maxpoints/Math.cbrt(question.correctAttemptsCount + 1)));

            users.submitAnswer(
                userId, questionId, value, points, answer,
                function (err, res) {
                    if (err) {
                        return callback(err, null);
                    }

                    questions.submitAnswer(
                        questionId, userId, value, points, answer,
                        function (err, res) {
                            if (err) {
                                return callback(err, null);
                            }

                            if (value) {
                                rateQuestion(question.number, userId, Math.floor(Math.random() * 6));
                            }

                            return callback(null, value);
                        }
                    );
                }
            );
        }
    });
}

/**
 * This function rates the question specifed, by the user specified, using the rating givem
 *
 * @param {integer} questionId
 * @param {string} userId
 * @param {integer} rating
 * @param {function} callback
 */
var rateQuestion = function (questionId, userId, rating, callback) {
    if (rating < 1 || rating > 5) {
        return;
    }

    db.lookupQuestion({ number: questionId }, function (err, question) {
        if (err) {
            logger.error(err);
        } else if (!question) {
            logger.error('Could not find the question');
        } else {
            questionId = question._id;
            questions.submitRating(questionId, userId, rating, function (err, res) {
                if (err) {
                    logger.error('Could not rate question. Please try again.');
                } else {
                    logger.log(common.formatString('Questions {0} rated as {1}', [questionId, rating]));
                }
            });
        }
    });
}

// This section includes the helper functions used for the generator
/**
 * This function gives the ID of the user formatted as the first 7 letters
 * of `lastFirst` naming convention
 *
 * @param {string} name
 */
var studentIdGenerator = function (name) {
    const combined = name.split(' ')[1] + name.split(' ')[0];
    var possibleIds = combined.slice(0, 7).toLowerCase();
    return possibleIds;
}

/**
 * This function resets the variables that are needed for each question to be pupulated
 *
 * @param {string} questionType
 */
var variableReset = function (questionType) {
    numberOfQuestionsExpected = numberOfEachQuestion[questionType];
    questionsIds = questionsCount;
    questionsCount += numberOfQuestionsExpected;
    questionsCreated = 1;
    questionsAnswered = 1;
}

/**
 * This function calculates the number of questions that need to be added
 */
var calculateTotalNumberOfQuestions = function () {
    var totalCreated = 0;

    for (var item in numberOfEachQuestion) {
        totalCreated += numberOfEachQuestion[item];
    }

    totalNumberOfQuestions = totalCreated;
}

/**
* This function returns a random maximum and minimum points for a question based on the variables defined
*/
var minMaxPointGenerator = function () {
    return [
        Math.floor(Math.random() * (questionsMaxMinValue - questionsMinMinValue) + questionsMinMinValue),
        Math.floor(Math.random() * (questionsMaxMaxValue - questionsMinMaxValue) + questionsMinMaxValue)
    ]
}

db.initialize(function () {
    db.removeAllUsers(function (err, res) {
        if (err) {
            process.exit(1);
        }

        db.removeAllQuestions(function (err, res) {
            if (err) {
                process.exit(1);
            }

            db.resetAllSettings(function (err, res) {
                if (err) {
                    process.exit(1);
                }

                calculateTotalNumberOfQuestions();
                createAdmins();
            });
        });
    });
});
