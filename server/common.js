/* the field to sort by */
const sortTypes = Object.freeze({
    SORT_NOSORT    : 0x0,
    SORT_DEFAULT   : 0x1,
    SORT_RANDOM    : 0x2,
    SORT_TOPIC     : 0x4,
    SORT_POINTS    : 0x8,
    QUERY_ANSWERED : 0x10,
    QUERY_ANSONLY  : 0x20
});
exports.sortTypes = sortTypes;

const userTypes = Object.freeze({
    ADMIN     : 0,
    STUDENT   : 1
});
exports.userTypes = userTypes;

const questionTypes = Object.freeze({
    REGULAR         : 0,
    MULTIPLECHOICE  : 1
});
exports.questionTypes = questionTypes;

