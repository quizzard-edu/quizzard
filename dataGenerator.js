// process.exit(0);
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

var logger = require('./server/log.js').logger;
var db = require('./server/db.js');
var users = require('./server/users.js');
var questions = require('./server/questions.js');
var common = require('./server/common.js');

var numberOfEachQuestion = [2,2,2,2];

// variables to control the genereated data
var adminsCount = 2;
var studentsCount = 10;
var questionsCount;
var questionsIds;
var numberOfQuestionsExpected;
var questionsMaxValue = 20;
var questionsAttempts = 10; // be careful when changing this value,
                            // it will increase the run time significantly
var questionsCorrectPercentage = 40;

// variables used by the script for different functionality
// Do NOT change the variables below
var adminsCreated = 0;
var studentsCreated = 0;
var questionsCreated;
var questionsAnswered;

// create users account for both students and admins
var addAdmin = function(accid, pass, isAdmin) {
    var acc = {
        id: accid,
        password: pass,
        fname: accid,
        lname: accid,
        email: accid+'@'+'fake.fake'
    };

    users.addAdmin(acc, function(err, account) {
        if (err) {
            logger.error('Could not create account %s. Please try again.', accid);
        } else if (err == 'exists') {
            logger.info('Account with username %s exists.', accid);
        }

        adminsCreated++;
        if (adminsCreated == adminsCount) {
            createStudents();
        }
    });
}

// create users account for both students and admins
var addStudent = function(accid, pass, isAdmin) {
    var acc = {
        id: accid,
        password: pass,
        fname: accid,
        lname: accid,
        email: accid+'@'+'fake.fake'
    };

    users.addStudent(acc, function(err, account) {
        if (err) {
            logger.error('Could not create account %s. Please try again.', accid);
        } else if (err == 'exists') {
            logger.info('Account with username %s exists.', accid);
        }

        studentsCreated++;
        if(studentsCreated == studentsCount){
            createQuestionsRegular();
        }
    });
}

// add question and send random answers
var addQuestionRegular = function(qTopic, id) {
	  var question = {
		    topic: 'CSC492',
		    title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'KonniChiwa',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.REGULAR.value,
        hint: 'KonniChiwa',
        visible: 'true'
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            rateQuestion(id, 'Admin1', Math.floor(Math.random()*6), function() {
                if (err) {
                    logger.error('Could not rate question. Please try again.');
                } else {
                    logger.info('Questions %d rated as %d', id, 3);
                }
            });
        }

        if (questionsCreated == numberOfQuestionsExpected) {
            answerQuestionsRegular();
        }

        questionsCreated++;
    });
}

// add question and send random answers
var answerQuestionRegular = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = 'student'+Math.floor(Math.random()*studentsCount);
        var answer = 'NotKonniChiwa';

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = 'KonniChiwa';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered == numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsMultipleChoice();
            }

            questionsAnswered++;
        });
    }
}


// add question and send random answers
var addQuestionMultipleChoice = function(qTopic, id) {
	  var question = {
		    topic: 'CSC492',
		    title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'Option1',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.MULTIPLECHOICE.value,
        hint: 'Option1',
        visible: 'true',
        choices: ['Option1','Option2','Option3','Option4']
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            rateQuestion(id, 'Admin1', Math.floor(Math.random()*6), function() {
                if (err) {
                    logger.error('Could not rate question. Please try again.');
                } else {
                    logger.info('Questions %d rated as %d', id, 3);
                }
            });
        }

        if (questionsCreated == numberOfQuestionsExpected) {
            answerQuestionsMultipleChoice();
        }

        questionsCreated++;
    });
}

// add question and send random answers
var answerQuestionMultipleChoice = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = 'student'+Math.floor(Math.random()*studentsCount);
        var answer = 'Option2';

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = 'Option1';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered == numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsTrueFalse();
            }

            questionsAnswered++;
        });
    }
}

// add question and send random answers
var addQuestionTrueFalse = function(qTopic, id) {
	  var question = {
		    topic: 'CSC492',
		    title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'true',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.TRUEFALSE.value,
        hint: 'Option1',
        visible: 'true'
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            rateQuestion(id, 'Admin1', Math.floor(Math.random()*6), function() {
                if (err) {
                    logger.error('Could not rate question. Please try again.');
                } else {
                    logger.info('Questions %d rated as %d', id, 3);
                }
            });
        }

        if (questionsCreated == numberOfQuestionsExpected) {
            answerQuestionsTrueFalse();
        }

        questionsCreated++;
    });
}

// add question and send random answers
var answerQuestionTrueFalse = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = 'student'+Math.floor(Math.random()*studentsCount);
        var answer = 'false';

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = 'true';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered == numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsMatching();
            }

            questionsAnswered++;
        });
    }
}

// add question and send random answers
var addQuestionMatching = function(qTopic, id) {
	  var question = {
		    topic: 'CSC492',
		    title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'true',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.MATCHING.value,
        hint: 'Option1',
        visible: 'true',
        leftSide: ['l1', 'l2', 'l3'],
        rightSide: ['r1', 'r2', 'r3'],
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            rateQuestion(id, 'Admin1', Math.floor(Math.random()*6), function() {
                if (err) {
                    logger.error('Could not rate question. Please try again.');
                } else {
                    logger.info('Questions %d rated as %d', id, 3);
                }
            });
        }

        if (questionsCreated == numberOfQuestionsExpected) {
            answerQuestionsMatching();
        }

        questionsCreated++;
    });
}

// add question and send random answers
var answerQuestionMatching = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = 'student'+Math.floor(Math.random()*studentsCount);
        var answer = [['l3', 'l2', 'l1'],['r1', 'r2', 'r3']];

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = [['l1', 'l2', 'l3'],['r1', 'r2', 'r3']];
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered == numberOfQuestionsExpected*questionsAttempts) {
                process.exit(0);
            }

            questionsAnswered++;
        });
    }
}

// check answer
var checkAnswer = function (questionId, userId, answer, callback) {
    logger.info('User %s attempted to answer question %s with "%s"', userId, questionId, answer);
    db.lookupQuestion({id: questionId}, function(err, question) {
        questionId = question._id;
        if(err){
            return callback(err, null);
        } else if(!question){
            return callback('Could not find the question', null);
        } else {
            var value = questions.verifyAnswer(question, answer);
            var points = question.points;
            users.submitAnswer(
                userId, questionId, value, points, answer,
                function(err, res){
                    if (err) {
                        return callback (err, null);
                    }

                    questions.submitAnswer(
                        questionId, userId, value, points, answer,
                        function(err, res) {
                            if (err) {
                                return callback (err, null);
                            }
                            return callback (null, value);
                        }
                    );
                }
            );
        }
    });
}

var rateQuestion = function (questionId, userId, rating, callback) {
    db.lookupQuestion({id: questionId}, function(err, question) {
        questionId = question._id;
        if(err){
            return callback(err, null);
        } else if(!question){
            return callback('Could not find the question', null);
        } else {
            questions.submitRating(questionId, userId, rating, function(err, res) {
                if (err) {
                    logger.error('Could not rate question. Please try again.');
                } else {
                    logger.info('Questions %d rated as %d', question.id, rating);
                }
            });
        }
    });
}


var createAdmins = function() {
    for (var id = 0; id < adminsCount; id++) {
        addAdmin('Admin'+id, 'KonniChiwa');
    }
}

var createStudents = function() {
  	for (var id = 0; id < studentsCount; id++) {
      	addStudent('Student'+id, 'KonniChiwa');
  	}
}

var createQuestionsRegular = function() {
    variableReset(0);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionRegular('Is math related to science? '+id, id);
  	}
}

var createQuestionsMultipleChoice = function() {
    variableReset(1);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionMultipleChoice('Is math related to science? '+id, id);
  	}
}

var createQuestionsTrueFalse = function() {
    variableReset(2);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionTrueFalse('Is math related to science? '+id, id);
  	}
}

var createQuestionsMatching = function() {
    variableReset(3);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionMatching('Is math related to science? '+id, id);
  	}
}

var answerQuestionsRegular = function() {
  	for (var id = questionsIds; id < questionsCount; id++) {
      	answerQuestionRegular(id);
  	}
}

var answerQuestionsMultipleChoice = function() {
  	for (var id = questionsIds; id < questionsCount; id++) {
      	answerQuestionMultipleChoice(id);
  	}
}

var answerQuestionsTrueFalse = function() {
  	for (var id = questionsIds; id < questionsCount; id++) {
      	answerQuestionTrueFalse(id);
  	}
}

var answerQuestionsMatching = function() {
  	for (var id = questionsIds; id < questionsCount; id++) {
      	answerQuestionMatching(id);
  	}
}

var variableReset = function(number) {
    var totalCreated = 1;

    for (var i = 0; i < number; i++) {
        totalCreated += numberOfEachQuestion[i];
    }

    numberOfQuestionsExpected = numberOfEachQuestion[number];
    questionsCount = totalCreated + numberOfQuestionsExpected;
    questionsIds = totalCreated;
    questionsCreated = 1;
    questionsAnswered = 1;
}

db.initialize(function() {
    db.removeAllUsers(function(err, res) {
        if (err) {
            process.exit(1);
        }

        db.removeAllQuestions(function(err, res) {
            if (err) {
                process.exit(1);
            }

            createAdmins();
        });
    });
});
