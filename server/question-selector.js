var questions = require('./questions.js').questions;

var types = Object.freeze({
    DEFAULT: 0
});

exports.sortTypes = types;

/*
 * Sort the questions database by the given sortType and call the callback
 * function with an array of the first amount questions from it.
 */
exports.findQuestions = function(amount, sortType, callback) {
    var criteria;

    if (sortType == types.DEFAULT) {
        criteria = {id: 1};
    } else {
        callback('invalid-sort');
        return;
    }

    questions.find().sort(criteria).limit(amount).toArray(function(err, docs) {
        if (err)
            callback(err);
        else
            callback(docs);
    });
};
