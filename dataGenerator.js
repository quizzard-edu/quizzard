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

var db = require('./server/db.js');
var students = require('./server/students.js');
var questions = require('./server/questions.js');

// variables to control the genereated data
var studentsCount = 100;
var questionsCount = 100;
var adminsCount = 10;
var questionsMaxValue = 200;
var questionsAttempts = 400; // be careful when changing this value,
                            // it will increase the run time significantly
var questionsCorrectPercentage = 40;

// variables used by the script for different functionality
// Do NOT change the variables below
var usersCreated = 0;
var questionsAnswered = 0;

// create users account for both students and admins
var setupAccount = function(accid, pass, isAdmin) {
    var acc = {
        id: accid,
        password: pass,
        fname: accid,
        lname: accid,
        email: 'fake@gmail.com',
        admin: isAdmin
    };

    students.createAccount(acc, function(res, account) {
        if (res == 'failure') {
            console.log('Could not create account %s. Please try again.', accid);
        } else if (res == 'exists') {
            console.log('Account with username %s exists.', accid);
        }
        usersCreated++;
        if(usersCreated == adminsCount+studentsCount){
            questions.questionInit(function() {
                createAndUpdateQuestions();
            });
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
        basePoints: Math.floor(Math.random()*questionsMaxValue),
		    type: questions.QUESTION_REGULAR,
        hint: 'KonniChiwa'
    };

    questions.addQuestion(question, function(res) {
        if (res == 'failure') {
            console.log('Could not create question %s. Please try again.', qTopic);
        }else{
      			questions.lookupQuestion(id, function(question){
          			for(var count = 0; count < questionsAttempts; count++){
                    students.getUserById('Student'+Math.floor(Math.random()*studentsCount), function(obj){
                        if(obj != 'failure'){
                            var answer = 'NotKonniChiwa';
                            if(Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)){
                                answer = 'KonniChiwa';
                            }
                            questions.checkAnswer(question, answer, obj, function(res){
                                questionsAnswered++;
                                if(questionsAnswered == questionsCount*questionsAttempts){
                                    process.exit(0);
                                }
                            });
                        }
                    });
          			}
      		  });
		    }
    });
}

var createAdmins = function() {
    for(var id = 0; id < adminsCount; id++){
        setupAccount('Admin'+id, 'KonniChiwa', true);
    }
}

var createStudents = function() {
  	for(var id = 0; id < studentsCount; id++){
      	setupAccount('Student'+id, 'KonniChiwa', false);
  	}
}

var createAndUpdateQuestions = function() {
  	for(var id = 0; id < questionsCount; id++){
      	addQuestion('Is math related to science? '+id, id);
  	}
}

db.initialize(function() {
  	createAdmins();
  	createStudents();
});
