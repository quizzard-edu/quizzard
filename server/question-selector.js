var questions = require('./questions.js').questions;

/* the field to sort by */
var types = Object.freeze({
    NOSORT:     0,
    DEFAULT:    1,
    RANDOM:     2,
    TOPIC:      3,
    POINTS:     4
});

exports.sortTypes = types;

/*
 * Sort the questions database by the given sortType and call the callback
 * function with an array of the first amount questions from it.
 */
exports.findQuestions = function(amount, sortType, callback) {
    var criteria;

    switch (sortType) {
    case types.NOSORT:
    case types.RANDOM:
        criteria = {};
        break;
    case types.DEFAULT:
        criteria = {id: 1};
        break;
    case types.TOPIC:
        criteria = {topic: 1};
        break;
    case types.POINTS:
        criteria = {basePoints: -1};
        break;
    default:
        callback('invalid-sort');
        return;
    }

    questions.find().sort(criteria).limit(amount).toArray(function(err, docs) {
        if (err) {
            callback('failure');
        } else {
            if (sortType == types.RANDOM)
                shuffle(docs);
            callback(docs);
        }
    });
};

/* Classic Fisher-Yates shuffle. Nothing to see here. */
var shuffle = function(arr) {
    var curr, tmp, rnd;

    curr = arr.length;
    while (curr) {
        rnd = Math.floor(Math.random() * curr);
        --curr;

        tmp = arr[curr];
        arr[curr] = arr[rnd];
        arr[rnd] = tmp;
    }
}
