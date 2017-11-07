/*
common.js

Copyright (C) 2016  Alexei Frolov, Larry Zhang
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

const questionTypes = Object.freeze({
    MULTIPLECHOICE  : {name: 'Multiple Choice', value: 'mc', template: 'mc-answer', icon: 'format_list_bulleted'},
    REGULAR         : {name: 'Regular Question', value: 're', template: 'regex-answer', icon: 'font_download'},
    TRUEFALSE       : {name: 'True and False', value: 'tf', template: 'tf-answer', icon: 'check_circle'},
    MATCHING        : {name: 'Matching', value: 'matching', template: 'matching-answer', icon: 'dashboard'},
    CHOOSEALL       : {name: 'Choose All That Apply', value: 'ca', template: 'chooseAll-answer', icon: 'format_list_bulleted'}
});
exports.questionTypes = questionTypes;

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

const questionAttributes = Object.freeze({
    DEFAULT: {
        topic                   : {type:'[object String]'},
        title                   : {type:'[object String]'},
        text                    : {type:'[object String]'},
        hint                    : {type:'[object String]'},
        points                  : {type:'[object Number]'},
        visible                 : {type:'[object Boolean]'},
        type                    : {type:'[object String]'}
    },
    SERVER: {
        _id                     : {type:'[object String]'},
        correctAttempts         : {type:'[object Array]'},
        wrongAttempts           : {type:'[object Array]'},
        totalAttempts           : {type:'[object Array]'},
        correctAttemptsCount    : {type:'[object Number]'},
        wrongAttemptsCount      : {type:'[object Number]'},
        totalAttemptsCount      : {type:'[object Number]'},
        ctime                   : {type:'[object String]'},
        mtime                   : {type:'[object String]'},
        ratings                 : {type:'[object Array]'}
    },
    REGULAR:        {
        answer                  : {type:'[object String]'}
    },
    MULTIPLECHOICE: {
        choices                 : {type:'[object Array]'},
        answer                  : {type:'[object String]'}
    },
    TRUEFALSE: {
        answer                  : {type:'[object String]'}
    },
    MATCHING: {
        leftSide                : {type:'[object Array]'},
        rightSide               : {type:'[object Array]'}
    },
    CHOOSEALL: {
        choices                 : {type:'[object Array]'},
        answer                  : {type:'[object Array]'}
    },
    DATATYPES: {
        Array                   : {type:'[object Array]'},
        String                  : {type:'[object String]'},
        Number                  : {type:'[object Number]'},
        Boolean                 : {type:'[object Boolean]'},
        Object                  : {type:'[object Object]'}
    }
});
exports.questionAttributes = questionAttributes;

var randomizeList = function(data) {
    var oldIndex, newIndex, tempHolder;

    for (oldIndex = data.length-1; oldIndex > 0; oldIndex--) {
        newIndex = Math.floor(Math.random() * (oldIndex + 1));
        tempHolder = data[oldIndex];
        data[oldIndex] = data[newIndex];
        data[newIndex] = tempHolder;
    }

    return data;
};
exports.randomizeList = randomizeList;

/* given a list of JSON objects that have Id as one of their feilds, return a list of Ids*/
exports.getIdsListFromJSONList = function (JSONList) {
    var list = [];
    for (i in JSONList){
        list.push(JSONList[i]._id);
    }
    return list;
}

/* given a list of JSON objects that have Id as one of their feilds, return a list of Ids*/
exports.getIdsListFromJSONList2 = function (JSONList) {
    var list = [];
    for (i in JSONList){
        list.push(JSONList[i].id);
    }
    return list;
}

// check if json obejct is empty
var isEmptyObject = function(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

exports.isEmptyObject = isEmptyObject;
