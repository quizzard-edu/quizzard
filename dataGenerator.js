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

// variables to control the genereated data
var adminsCount = 2;
var studentsCount = 10;
var questionsCount = 10;
var questionsMaxValue = 20;
var questionsAttempts = 10; // be careful when changing this value,
                            // it will increase the run time significantly
var questionsCorrectPercentage = 40;

// variables used by the script for different functionality
// Do NOT change the variables below
var adminsCreated = 0;
var studentsCreated = 0;
var questionsCreated = 0;
var questionsAnswered = 0;

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
        if (err == 'failure') {
            logger.error('Could not create account %s. Please try again.', accid);
        } else if (err == 'exists') {
            logger.info('Account with username %s exists.', accid);
        }

        adminsCreated++;
        if(adminsCreated == adminsCount){
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
        if (err == 'failure') {
            logger.error('Could not create account %s. Please try again.', accid);
        } else if (err == 'exists') {
            logger.info('Account with username %s exists.', accid);
        }

        studentsCreated++;
        if(studentsCreated == studentsCount){
            createQuestions();
        }
    });
}

// add question and send random answers
var addQuestion = function(qTopic, id){
	  var question = {
    		topic: 'CSC492',
    		title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'KonniChiwa',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.REGULAR,
        hint: 'KonniChiwa'
    };

    questions.addRegularQuestion(question, function(err, res) {
        if (err == 'failure') {
            logger.error('Could not add question. Please try again.');
        }else{
            logger.info('Questions %d created', id);
        }

        questionsCreated++;
        if(questionsCreated == questionsCount){
            answerQuestions();
        }
    });
}

// add question and send random answers
var answerQuestion = function(questionId){
    for(var i = 0; i < questionsAttempts; i++){
        var studentId = 'student'+Math.floor(Math.random()*studentsCount);
        var answer = 'NotKonniChiwa';
        
        if(Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)){
            answer = 'KonniChiwa';
        }

        questions.checkAnswer(questionId, studentId, answer, function(err, res) {
            if (res == 'failure') {
                logger.error('Questions %d answered incorrectly by %s', questionId, studentId);
            }else{
                logger.info('Questions %d answered correctly by %s', questionId, studentId);
            }

            questionsAnswered++;
            if(questionsAnswered == questionsCount*questionsAttempts){
                process.exit(0);
            }
        });
    }
}


var createAdmins = function() {
    for(var id = 0; id < adminsCount; id++){
        addAdmin('Admin'+id, 'KonniChiwa');
    }
}

var createStudents = function() {
  	for(var id = 0; id < studentsCount; id++){
      	addStudent('Student'+id, 'KonniChiwa');
  	}
}

var createQuestions = function() {
  	for(var id = 0; id < questionsCount; id++){
      	addQuestion('Is math related to science? '+id, id);
  	}
}

var answerQuestions = function() {
  	for(var id = 1; id <= questionsCount; id++){
      	answerQuestion(id);
  	}
}

db.initialize(function() {
    db.removeAllUsers(function(res){
        if(res === 'failure') {
            process.exit(1);
        }

        db.removeAllQuestions(function(res){
            if(res === 'failure') {
                process.exit(1);
            }

            createAdmins();
        });
    });
});
