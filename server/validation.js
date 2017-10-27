/*
question.js

Copyright (C) 2017  Alexei Frolov, Larry Zhang
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

var common = require('./common.js');

var validateAttributeType = function(valueToCheck,key){
	if(Object.prototype.toString.call(valueToCheck) !== common.questionAttributes[key].type)
		return false
	return true
}

const successMsg = {success:true, msg:'Validation Passed'}
const failMsg = {success:false, msg:'Fields types are Incorrect'}

/*Validate all question fields on first entry to db*/
exports.questionCreationValidation = function(info) {
	for (var key in common.questionAttributes){
		if (!(key in info) || !validateAttributeType(info[key],key))
			return failMsg
	}
	return validateQuestionByType(info,info.type);
}

/*Validate all fields that will be modified*/
exports.validateAttributeFields = function(question,type){
	var extraAttributes = false

	for (var key in question){
		// check const attributes
		if (key in common.questionAttributes){
			if (!validateAttributeType(question[key],key)){
				return failMsg
			}
		// not common field found
		} else {
			extraAttributes = true
		}
	}

	// check by question type to validate the extra fields
	if (extraAttributes){
		return validateQuestionByType(question,type);
	}
	return successMsg
}

var validateQuestionByType = function(question, type){
	var result;

	switch (type) {
		case common.questionTypes.REGULAR.value:
			result = successMsg;
			break;

		case common.questionTypes.MULTIPLECHOICE.value:
			result = multipleChoiceValidator(question);
			break;

		case common.questionTypes.TRUEFALSE.value:
			result = trueAndFalseValidator(question);
			break;

		default:
			result = failMsg;
			break;
	}
	return result;
}

var multipleChoiceValidator = function(question){
	if (question.choices && question.choices.length < 2){
		return qTypeFailMsg('Need two or more options for Multiple Choice Question!');
	}
	return successMsg;
}

var trueAndFalseValidator = function(question){
	if (question.choices && question.choices.length !== 2){
		return qTypeFailMsg('True and False can only have 2 options!');
	}
	return successMsg;
}

/*Send back specific error message by question type*/
var qTypeFailMsg = function(message){
	return {success:false,msg:message};
}