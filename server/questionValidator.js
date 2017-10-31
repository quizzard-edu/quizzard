/*
questionValidator.js

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

const successMsg = {success:true, msg:'Validation Passed'}
const failMsg = {success:false, msg:'Fields types are Incorrect'}
/*Send back specific error message by question type*/
var qTypeFailMsg = function(message){
	return {success:false,msg:message};
}

/*Validate all question fields on first entry to db*/
exports.questionCreationValidation = function(info) {
	for (var key in common.questionAttributes.DEFAULT){
		if (!(key in info) || !validateAttributeType(info[key], key, 'DEFAULT')){
			return failMsg;
		}
	}
	return validateQuestionAttributesByType(info,info.type);
}

/*Validate all fields that will be modified*/
exports.validateAttributeFields = function(question,type){
	var extraAttributes = false;

	for (var key in question){
		// check const attributes
		if (key in common.questionAttributes.DEFAULT){
			if (!validateAttributeType(question[key], key, 'DEFAULT')){
				return failMsg;
			}
		// not common field found
		} else {
			extraAttributes = true;
		}
	}

	// check by question type to validate the extra fields
	if (extraAttributes){
		return validateQuestionAttributesByType(question,type);
	}
	return successMsg;
}

var validateQuestionAttributesByType = function(question, type){
	var result;

	switch (type) {
		case common.questionTypes.REGULAR.value:
			result = regexAttributeValidator(question);
			break;

		case common.questionTypes.MULTIPLECHOICE.value:
			result = multipleChoiceAttributeValidator(question);
			break;

		case common.questionTypes.TRUEFALSE.value:
			result = trueAndFalseAttributeValidator(question);
			break;		

		case common.questionTypes.MATCHING.value:
			result = matchingAttributeValidator(question);
			break;

		default:
			result = failMsg;
			break;
	}
	return result;
}

var regexAttributeValidator = function(question){
	if (!validateAllAttributesInGroup(question,'MULTIPLECHOICE')){
		return qTypeFailMsg('Incorrect question answer field!');
	}
	return successMsg;
}

var multipleChoiceAttributeValidator = function(question){
	if (!validateAllAttributesInGroup(question,'MULTIPLECHOICE')){
		return qTypeFailMsg('Incorrect question answer fields!');
	}
	if (!validateArrayObject(question.choices,'String')){
		return failMsg;
	}
	if (question.choices.length < 2){
		return qTypeFailMsg('Need 2 or more options for Multiple Choice Question!');
	}
	return successMsg;
}

var trueAndFalseAttributeValidator = function(question){
	if (!validateAllAttributesInGroup(question,'TRUEFALSE')){
		return qTypeFailMsg('Please select answer True or False!');
	}
	if (question.choices.length !== 2){
		return qTypeFailMsg('True and False can only have 2 options!');
	}
	return successMsg;
}

var matchingAttributeValidator = function(question){
	if (!validateAllAttributesInGroup(question,'MATCHING')){
		return qTypeFailMsg('Please select answer True or False!');
	}
	if (!validateArrayObject(question.leftSide,'String') || !validateArrayObject(question.rightSide,'String')){
		return failMsg;
	}
	if (question.leftSide.length < 2 || question.rightSide.length < 2){
		return qTypeFailMsg('Need 2 or more matching options!');
	}
	return successMsg;
}

/*Validate specific value to it's attributeType in DB*/
var validateAttributeType = function(valueToCheck, key, attributeType){
	return Object.prototype.toString.call(valueToCheck) === common.questionAttributes[attributeType][key].type;
}

/*Validate all attributes in Object being passed and has correct field types*/
var validateAllAttributesInGroup = function(objectToCheck, attributeType){
	for (var key in common.questionAttributes[attributeType]){
		if (!(key in objectToCheck) || !validateAttributeType(objectToCheck[key], key, attributeType)){
			return false;
		}
	}
	return true;
}

/*Validate an Array object to contain specific value types*/
var validateArrayObject = function(arrayObject,typeOfvalue){
	for (var value in arrayObject){
		if(!validateAttributeType(value,typeOfvalue,'DATATYPES')){
			return false;
		}
	}
	return true;
}