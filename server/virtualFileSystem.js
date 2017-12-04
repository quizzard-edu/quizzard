/*

virtualFileSystem.js

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
const path = require('path');
const rimraf = require('rimraf');
const common = require('./common.js');
const db = require('./db.js');

/**
 * make a directory given the path and the name of the new directory
 * 
 * @param {string} parentPath 
 * @param {string} directoryName 
 * @param {function} callback 
 */
var mkdir = function (parentPath, directoryName, callback) {
    var fullPath = path.join(parentPath, directoryName);
    fs.mkdir(fullPath, function (err) {
        return callback(err ? getError(1007) : null, err ? null : 'ok');
    });
}
exports.mkdir = mkdir;

/**
 * BE CAREFUL: remove a directory given the path and the name of the new directory
 * 
 * @param {string} parentPath 
 * @param {string} directoryName 
 * @param {function} callback 
 */
var rmdir = function (parentPath, directoryName, callback) {
    var fullPath = path.join(parentPath, directoryName);
    fs.rmdir(fullPath, function (err) {
        return callback(err ? getError(1012) : null, err ? null : 'ok');
    });
}
exports.rmdir = rmdir;

/**
 * BE CAREFUL: perform rm -rf on a directory
 * 
 * @param {string} parentPath 
 * @param {string} directoryName 
 * @param {function} callback 
 */
var rmrf = function (parentPath, directoryName, callback) {
    var fullPath = path.join(parentPath, directoryName);
    rimraf(fullPath, function (err) {
        return callback(err ? getError(1010) : null, err ? null : 'ok');
    });
}
exports.rmrf = rmrf;

/**
 * check if a directory exists
 * 
 * @param {string} parentPath 
 * @param {string} name 
 */
var existsSync = function (parentPath, name) {
    var fullPath = path.join(parentPath, name);
    return fs.existsSync(fullPath);
}
exports.dirExists = existsSync;
exports.fileExists = existsSync;

/**
 * write data to a fils
 * 
 * @param {string} filePath 
 * @param {string} fileName 
 * @param {string} fileExtension 
 * @param {string} fileData 
 * @param {function} callback 
 */
var writeFile = function (filePath, fileName, fileExtension, fileData, filePermissions, callback) {
    var randomName = common.getUUID();
    var fullPath = path.join(filePath, fileName) + '.' + fileExtension;
    fs.writeFile(fullPath, fileData, function (err) {
        return callback(err ? getError(1013) : null, err ? null : 'ok');
    });
}
exports.saveFile = writeFile;

// convert string to a path
exports.joinPath = path.join;

/**
 * clean up the virtual file system
 * 
 * @param {function} callback 
 */
exports.removeVirtualFileSystem = function (callback) {
    rmrf(common.vfsTree.HOME, 'Users', function (err, result) {
        if (err) {
            logger.error(err);
            return callback(common.getError(2016), null);
        }

        mkdir(common.vfsTree.HOME, 'Users', function (err, result) {
            if (err) {
                logger.error(err);
                return callback(common.getError(1007), null);
            }

            rmrf(common.vfsTree.HOME, 'Questions', function (err, result) {
                if (err) {
                    logger.error(err);
                    return callback(common.getError(1010), null);
                }

                mkdir(common.vfsTree.HOME, 'Questions', function (err, result) {
                    if (err) {
                        logger.error(err);
                        return callback(common.getError(1007), null);
                    }

                    db.removeVirtualFileSystem(callback);
                });
            });
        });
    });
}