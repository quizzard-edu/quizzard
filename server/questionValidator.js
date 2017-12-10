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

const common = require('./common.js');

const successMsg = {success:true, err:'Validation Passed'}
const failMsg = {success:false, err:common.getError(3022)}

/**
 * Send back specific error message by question type
 *
 * @param {string} message
 */
var qTypeFailMsg = function(message) {
    return {success:false, err:message};
}

/**
 * Validate all question fields on first entry to db
 *
 * @param {object} info
 */
exports.questionCreationValidation = function(info) {
    for (var key in common.questionAttributes.DEFAULT) {
        if (!(key in info) || !validateAttributeType(info[key], key, 'DEFAULT')) {
            return failMsg;
        }
    }
    const result = validateDefaultQuestionValues(info);
    if(!result.success){
        return result;
    }
    return validateQuestionAttributesByType(info,info.type);
}

/**
 * validate default question values
 *
 * @param {number} questionData
 */
var validateDefaultQuestionValues = function(questionData){
    if ('minpoints' in questionData && 'maxpoints' in questionData){
        if (questionData.minpoints < 0
            || questionData.minpoints > questionData.maxpoints
            || questionData.maxpoints < 0){
            return qTypeFailMsg(common.getError(3024));
        }
    }
    return successMsg;
}

/**
 * Validate all fields that will be modified
 *
 * @param {object} question
 * @param {string} type
 */
exports.validateAttributeFields = function(question,type) {
    var extraAttributes = false;

    for (var key in question) {
        // check const attributes
        if (key in common.questionAttributes.DEFAULT) {
            if (!validateAttributeType(question[key], key, 'DEFAULT')) {
                return failMsg;
            }
        // not common field found
        } else {
            extraAttributes = true;
        }
    }

    const result = validateDefaultQuestionValues(question);
    console.log(result)
    if(!result.success){
        return result;
    }

    // check by question type to validate the extra fields
    if (extraAttributes) {
        return validateQuestionAttributesByType(question,type);
    }
    return successMsg;
}

/**
 * validate question attributes by type
 *
 * @param {object} question
 * @param {string} type
 */
var validateQuestionAttributesByType = function(question, type) {
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

        case common.questionTypes.CHOOSEALL.value:
            result = chooseAllAttributeValidator(question);
            break;
        case common.questionTypes.ORDERING.value:
            result = orderingAttributeValidator(question);
            break;
        default:
            result = failMsg;
            break;
    }
    return result;
}

/**
 * regex attribute validator
 *
 * @param {object} question
 */
var regexAttributeValidator = function(question) {
    if (!validateAllAttributesInGroup(question,'REGULAR')) {
        return qTypeFailMsg(commmon.getError(3022));
    }
    return successMsg;
}

/**
 * multiple choice attribute validator
 *
 * @param {object} question
 */
var multipleChoiceAttributeValidator = function(question) {
    if (!validateAllAttributesInGroup(question,'MULTIPLECHOICE')) {
        return qTypeFailMsg(commmon.getError(3022));
    }
    if (!validateArrayObject(question.choices,'String')) {
        return failMsg;
    }
    if (question.choices.length < 2) {
        return qTypeFailMsg(common.getError(3025));
    }
    return successMsg;
}

/**
 * true and false attribute validator
 *
 * @param {object} question
 */
var trueAndFalseAttributeValidator = function(question) {
    if (!validateAllAttributesInGroup(question,'TRUEFALSE')) {
        return qTypeFailMsg(commmon.getError(3022));
    }
    if (question.answer !== 'true' && question.answer !== 'false' ) {
        return qTypeFailMsg(common.getError(3026));
    }
    return successMsg;
}

/**
 * matching attribute validator
 *
 * @param {object} question
 */
var matchingAttributeValidator = function(question) {
    if (!validateAllAttributesInGroup(question,'MATCHING')) {
        return qTypeFailMsg(commmon.getError(3022));
    }
    if (!validateArrayObject(question.leftSide,'String') || !validateArrayObject(question.rightSide,'String')) {
        return failMsg;
    }
    if (question.leftSide.length < 2 || question.rightSide.length < 2) {
        return qTypeFailMsg(common.getError(3025));
    }
    return successMsg;
}

/**
 * choose all attribute validator
 *
 * @param {object} question
 */
var chooseAllAttributeValidator = function(question) {
    if (!validateAllAttributesInGroup(question,'CHOOSEALL')) {
        return qTypeFailMsg(commmon.getError(3022));
    }
    if (!validateArrayObject(question.choices,'String') || !validateArrayObject(question.answer,'String')) {
        return failMsg;
    }
    if (question.choices.length < 2) {
        return qTypeFailMsg(common.getError(3025));
    }

    if (question.answer.length < 1) {
        return qTypeFailMsg(common.getError(3026));
    }
    return successMsg;
}

/**
 * ordering attribute validator
 *
 * @param {object} question
 */
var orderingAttributeValidator = function(question) {
    if (!validateAllAttributesInGroup(question,'ORDERING')) {
        return qTypeFailMsg(commmon.getError(3022));
    }
    if (!validateArrayObject(question.answer,'String')) {
        return failMsg;
    }
    if (question.answer.length < 2) {
        return qTypeFailMsg(common.getError(3025));
    }
    return successMsg;
}

/**
 * Validate specific value to it's attributeType in DB
 *
 * @param {*} valueToCheck
 * @param {string} key
 * @param {string} attributeType
 */
var validateAttributeType = function(valueToCheck, key, attributeType) {
    return Object.prototype.toString.call(valueToCheck) === common.questionAttributes[attributeType][key].type;
}
exports.validateAttributeType = validateAttributeType;

/**
 * Validate all attributes in Object being passed and has correct field types
 *
 * @param {object} objectToCheck
 * @param {string} attributeType
 */
var validateAllAttributesInGroup = function(objectToCheck, attributeType) {
    for (var key in common.questionAttributes[attributeType]) {
        if (!(key in objectToCheck) || !validateAttributeType(objectToCheck[key], key, attributeType)) {
            return false;
        }
    }
    return true;
}

/**
 * Validate an Array object to contain specific value types
 *
 * @param {list} arrayObject
 * @param {string} typeOfvalue
 */
var validateArrayObject = function(arrayObject,typeOfvalue) {
    for (var i = 0; i < arrayObject.length; i++) {
        if (!validateAttributeType(arrayObject[i],typeOfvalue,'DATATYPES')) {
            return false;
        }
    }
    return true;
}
exports.validateArrayObject = validateArrayObject;
