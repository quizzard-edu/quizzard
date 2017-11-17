/*
students.js

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

var bcrypt = require('bcryptjs');
var fs = require('fs');
var csv = require('csv');
var db = require('./db.js');
var logger = require('./log.js').logger;

/* Sort the list of accounts as by the given criteria. */
exports.sortAccounts = function(as, type, asc, callback) {
    var cmpfn;

    var lo = asc ? -1 : 1;
    var hi = -lo;
    if (type == 'id') {
        cmpfn = function(a, b) {
            return a.id < b.id ? lo : hi;
        };
    } else if (type == 'fname') {
        cmpfn = function(a, b) {
            return a.fname.toLowerCase() < b.fname.toLowerCase() ? lo : hi;
        };
    } else {
        cmpfn = function(a, b) {
            return a.lname.toLowerCase() < b.lname.toLowerCase() ? lo : hi;
        }
    }

    as.sort(cmpfn);
    callback(as);
}
