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
    MULTIPLECHOICE  : {name: 'Multiple Choice', value: 'mc', template: 'mc-answer'},
    REGULAR         : {name: 'Regular Question', value: 're', template: 'regex-answer'},
    TRUEFALSE       : {name: 'True and False', value: 'tf', template: 'tf-answer'},
    MATCHING        : {name: 'Matching', value: 'matching', template: 'matching-answer'}
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

var randomizeList = function(data) {
    var oldIndex, newIndex, tempHolder;

    for (oldIndex=data.length-1; oldIndex > 0; oldIndex--) {
        newIndex = Math.floor(Math.random() * (oldIndex + 1));
        tempHolder = data[oldIndex];
        data[oldIndex] = data[newIndex];
        data[newIndex] = tempHolder;
    }

    return data;
};
exports.randomizeList = randomizeList;
