/*
users.js

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

var bcrypt = require('bcryptjs');
var db = require('./db.js');
var logger = require('./log.js').logger;
var common = require('./common.js');

// Create an admin USER, if the USER object is valid
exports.addAdmin = function(user, callback) {
	if(!user.fname || !user.lname || !user.id || !user.password){
		logger.error('Failed to create a new admin, missing requirements');
		return callback('failure', null);
	}

	bcrypt.hash(user.password, 11, function(err, hash) {
		if (err) {
			logger.error(err);
			return callback(err, null);
		}

		var currentDate = new Date().toString();
		var userToAdd = {};

		userToAdd.id = user.id.toLowerCase();
		userToAdd.fname = user.fname;
		userToAdd.lname = user.lname;
		userToAdd.ctime = currentDate;
		userToAdd.atime = currentDate;
		userToAdd.mtime = currentDate;
		userToAdd.email = user.email ? user.email : '';
		userToAdd.type = common.userTypes.ADMIN;
		userToAdd.password = hash;
		userToAdd.active = true;
		userToAdd.ratings = [];

		db.addAdmin(userToAdd, function(err, res){
			if(err){
				if (err === 'failure'){
					logger.error('Failed to create admin %s, database issue', userToAdd.id);
				} else if (err === 'exists') {
					logger.warn('Admin %s already exists', userToAdd.id);
				}
				return callback(err, null);
			}

			logger.info('Admin %s created', userToAdd.id);
			return callback(null, 'created');
		});
	});
}

// Create a student USER, if the USER object is valid
exports.addStudent = function(user, callback) {
	if(!user.fname || !user.lname || !user.id || !user.password){
		logger.error('Failed to create a new student, missing requirements');
		return callback('failure', null);
	}

	bcrypt.hash(user.password, 11, function(err, hash) {
		if (err) {
			logger.error(err);
			return callback(err, null);
		}

		var currentDate = new Date().toString();
		var userToAdd = {};

		userToAdd.id = user.id.toLowerCase();
		userToAdd.fname = user.fname;
		userToAdd.lname = user.lname;
		userToAdd.ctime = currentDate;
		userToAdd.atime = currentDate;
		userToAdd.mtime = currentDate;
		userToAdd.email = user.email ? user.email : '';
		userToAdd.type = common.userTypes.STUDENT;
		userToAdd.password = hash;
		userToAdd.active = true;
		userToAdd.ratings = [];

		userToAdd.points = 0.0;
		userToAdd.correctAttempts = [];
		userToAdd.wrongAttempts = [];
		userToAdd.totalAttempts = [];
		userToAdd.correctAttemptsCount = 0;
		userToAdd.wrongAttemptsCount = 0;
		userToAdd.totalAttemptsCount = 0;

		db.addStudent(userToAdd, function(err, res){
			if(err){
				if (err === 'failure'){
					logger.error('Failed to create student %s, database issue', userToAdd.id);
				} else if (err === 'exists') {
					logger.warn('Student %s already exists', userToAdd.id);
				}

				return callback(err, null);
			}

			logger.info('Student %s created', userToAdd.id);
			return callback(null, 'Created');
		});
	});
}

/*
 * Update the account with ID userid in the student database.
 * The user argument holds the complete new object to insert.
 * Fail if the ID has changed and the new ID already belongs
 * to a user.
*/
exports.updateUserByIdWithRedirection = function(userId, info, callback){
	db.updateUserById(userId, info, callback);
}

exports.updateStudentById = function(userId, info, callback){
    db.updateStudentById(userId, info, callback);
}

exports.updateAdminById = function(userId, info, callback){
    db.updateAdminById(userId, info, callback);
}

/* Return an array of users in the database. */
exports.getAdminsList = function(callback) {
    db.getAdminsList(callback);
}

exports.getStudentsList = function(callback) {
    db.getStudentsList(callback);
}

exports.getStudentsListWithStatus = function(active, callback) {
    db.getStudentsListWithStatus(active, callback);
}

exports.getUsersList = function(callback) {
    db.getUsersList(callback);
}

/* Return an array of users in the database, sorted by rank. */
exports.getStudentsListSorted = function(lim, callback) {
	db.getStudentsListSorted(lim, callback);
}

/*
 * Check if the account given by user and pass is valid.
 * Return account object if it is or null otherwise.
 */
exports.checkLogin = function(username, pass, callback) {
	db.checkLogin(username, pass, callback);
}

/*
 * Fetch the user object with ID iserId in the users database.
 */
exports.getUserById = function(userId, callback){
	db.getUserById(userId, callback);
}

exports.getStudentById = function(studentId, callback) {
	db.getStudentById(studentId, callback);
}

exports.getAdminById = function(adminId, callback) {
	db.getStudentById(adminId, callback);
}

/*
 * Fetch the question list of userId
 */
exports.getQuestionsListByUser = function(request, callback) {
    var questionsQuery = {};
    var sortQuery = {id: 1};
    var user = request.user;
    var questionsStatus = request.questionsStatus;

    if (!user) {
        return callback('No user object', null);
    }

    if (user.type === common.userTypes.ADMIN) {
        db.getQuestionsList(questionsQuery, sortQuery, function(err, docs){
			return callback(err, docs);
		});
	}

	if (user.type === common.userTypes.STUDENT) {
        questionsQuery.visible = true;

		db.getQuestionsList(questionsQuery, sortQuery, function(err, docs) {
			if (err) {
				return callback(err, null);
			}

			var compareList = common.getIdsListFromJSONList(user.correctAttempts);
			var answeredList = [];
			var unansweredList = [];

			for (q in docs) {
				if (compareList.indexOf(docs[q].id) === -1) {
					unansweredList.push(docs[q]);
				} else {
					answeredList.push(docs[q]);
				}
			}

			var returnList = (questionsStatus === 'answered') ? answeredList : unansweredList;
			return callback(null, returnList);
		});
    }
}

// set the status of the user to active or in-active
exports.setUserStatus = function(studentId, newStatus, callback){
	db.updateUserById(studentId,{active: newStatus}, callback);
}

// adding rating to question collection
exports.submitRating = function (userId, questionId, rating, callback) {
	db.updateUserById(userId, {questionId: questionId, rating: rating}, callback);
}