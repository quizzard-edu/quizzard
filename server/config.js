/*

config.js

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

const fs = require('fs');

var httpsPort = 8080;
var httpPort = 8000;
var hostName = '127.0.0.1';
var maxAge = 60 * 60 * 1000 * 2;

var ssl_options = {
  key: fs.readFileSync('./keys/private.key'),
  cert: fs.readFileSync('./keys/cert.crt')
};

exports.httpsPort = httpsPort;
exports.httpPort = httpPort;
exports.hostName = hostName;
exports.ssl_options = ssl_options;
exports.maxAge = maxAge;
