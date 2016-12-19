var questions = require('./questions.js').questions;

/* the field to sort by */
var types = Object.freeze({
    SORT_NOSORT:     0x0,
    SORT_DEFAULT:    0x1,
    SORT_RANDOM:     0x2,
    SORT_TOPIC:      0x4,
    SORT_POINTS:     0x8,
    QUERY_ANSWERED:  0x10,
    QUERY_ANSONLY:   0x20,
});

exports.findTypes = types;

/*
 * Fetch amount questions from the database, using findType to
 * determine how to select and sort them.
 *
 * findType is laid out as follows:
 *
 * SORTING
 * The first bit that matches is the sort criterion. If none match, don't sort.
 * 0th bit: default sort
 * 1st bit: randomly shuffle
 * 2nd bit: sort by topic
 * 3rd bit: sort by points
 *
 * QUERYING
 * 4th bit: if 1, allow questions that have already been answered by user.
 * 5th bit: if 1, only show those questions that have been answered (with bit 4).
 */
exports.findQuestions = function(amount, findType, user, callback) {
    var criteria, query;

    if (findType & types.SORT_DEFAULT) {
        criteria = {id: 1};
    } else if (findType & types.SORT_TOPIC) {
        critera = {topic : 1};
    } else if (findType & types.SORT_POINTS) {
        critera = {basePoints : -1};
    } else {
        criteria = {};
    }

    if (findType & types.QUERY_ANSWERED) {
        if (findType & types.QUERY_ANSONLY) {
            query = {
                id: { $in: user.answeredIds }
            };
        } else {
                query = {};
        }
    } else if (user != null) {
        query = {
            id: { $nin: user.answeredIds }
        };
    }

    questions.find(query).sort(criteria).limit(amount).toArray(function(err, docs) {
        if (err) {
            callback('failure');
        } else {
            if (findType & types.SORT_RANDOM)
                shuffle(docs);
            for (q in docs)
                delete docs[q]._id;
            callback(docs);
        }
    });
}

/* Sort questions by the given sort type. */
exports.sortQuestions = function(qs, type, callback) {
    var cmpfn;

    if (type & types.SORT_RANDOM) {
        shuffle(qs);
        callback(qs);
        return;
    } else if (type & types.SORT_TOPIC) {
        cmpfn = function(a, b) {
            return a.topic < b.topic ? -1 : 1;
        };
    } else if (type & types.SORT_POINTS) {
        cmpfn = function(a, b) {
            return b.basePoints - a.basePoints;
        };
    } else {
        cmpfn = function(a, b) { return -1; };
    }

    qs.sort(cmpfn);
    callback(qs);
}

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
