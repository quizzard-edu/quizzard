var common = require('./common.js');

exports.questionCreationValidation = function(info) {
	for (var key in common.questionAttributes){
		if(info[key] && Object.prototype.toString.call(info[key]) !== common.questionAttributes[key].type)
			return false
	}
	return true
}