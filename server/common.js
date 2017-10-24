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
    REGULAR         : {name: 'Regular Question', value: 're', template: 'regex-answer'},
    MULTIPLECHOICE  : {name: 'Multiple Choice', value: 'mc', template: 'mc-answer'},
    TRUEFALSE       : {name: 'True and False', value: 'tf', template: 'tf-answer'}
});
exports.questionTypes = questionTypes;

const questionAttributes = Object.freeze({
    topic       : {type:'[object String]'},
    title       : {type:'[object String]'},
    text        : {type:'[object String]'},
    answer      : {type:'[object String]'},
    hint        : {type:'[object String]'},
    points      : {type:'[object Number]'},
    visible     : {type:'[object Boolean]'},
    attempted   : {type:'[object Array]'},
    answered    : {type:'[object Array]'},
    attempts    :  {type:'[object Array]'},
    ctime       : {type:'[object String]'},
    mtime       : {type:'[object String]'},
    ratings     : {type:'[object Array]'}
});
exports.questionAttributes = questionAttributes;