var common = require('./common.js');

exports.questionCreationValidation = function(info) {
	for (var key in common.questionAttributes){
		if(info[key] && Object.prototype.toString.call(info[key]) !== common.questionAttributes[key].type)
			return false
	}
	return true
}

exports.validateAttributeFields = function(question,type){
	for (var key in question){
		// check const attributes
		if (key in common.questionAttributes){
			if(Object.prototype.toString.call(question[key]) !== common.questionAttributes[key].type)
				return false
		// not a const attribute, then validate by question type
		} else {
			var result = validateQuestionByType(question,type)
			if(result){
				return result
			}
		}
	}
	return true
}

exports.validateQuestionByType = function(question, type){
	var result = false;
	switch (type) {
		case common.questionTypes.REGULAR.value:
			break;

		case common.questionTypes.MULTIPLECHOICE.value:
			result = multipleChoiceValidator(question);
			break;

		case common.questionTypes.TRUEFALSE.value:
			result = trueAndFalseValidator(question);
			break;

		default:
			break;
	}
	return result;
}

var multipleChoiceValidator = function(question){
	if (question.choices && question.choices.length < 2){
		return 'Need two or more options for Multiple Choice Question';
	}
	return false;
}

var trueAndFalseValidator = function(question){
	if (question.choices && question.choices.length !== 2){
		return 'True and False can only have 2 options!';
	}
	return false;
}