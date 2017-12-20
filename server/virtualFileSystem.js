/*
Copyright (C) 2016
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
const logger = require('./log.js');

/**
 * make a directory given the path and the name of the new directory
 *
 * @param {string} parentPath
 * @param {string} directoryName
 * @param {string} directoryPermissions
 * @param {function} callback
 */
var mkdir = function (parentPath, directoryName, directoryPermissions, callback) {
    var fullPath = path.join(parentPath, directoryName);
    var fileObject = {
        _id: directoryName,
        path: fullPath,
        type: common.vfsTypes.DIRECTORY,
        permission: directoryPermissions
    };

    db.addToVirtualFileSystem(fileObject, function (err, result) {
        if (err) {
            return callback(common.getError(9004), null);
        }

        fs.mkdir(fullPath, function (err) {
            return callback(err ? common.getError(1007) : null, err ? null : fileObject);
        });
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
        return callback(err ? common.getError(1012) : null, err ? null : 'ok');
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
        return callback(err ? common.getError(1010) : null, err ? null : 'ok');
    });
}
exports.rmrf = rmrf;

/**
 * check if a directory exists
 *
 * @param {string} fileId
 * @param {function} callback
 */
var existsSync = function (fileId, callback) {
    db.findInVirtualFileSystem({_id: fileId}, function (err, fileObj) {
        if (err || !fs.existsSync(fileObj.path)) {
            return callback(common.getError(9003), null);
        }

        return callback(null, fileObj);
    });
}
exports.dirExists = existsSync;
exports.fileExists = existsSync;

/**
 * write data to a fils
 *
 * @param {object} fileObj
 * @param {function} callback
 */
var writeFile = function (fileObj, callback) {
    var fullPath = path.join(fileObj.filePath, fileObj.fileName) + '.' + fileObj.fileExtension;
    var fileObject = {
        _id: fileObj.fileName,
        path: fullPath,
        type: common.vfsTypes.FILE,
        extension: fileObj.fileExtension,
        creator: fileObj.fileCreator,
        permission: fileObj.filePermissions
    };

    db.addToVirtualFileSystem(fileObject, function (err, result) {
        if (err) {
            return callback(common.getError(9004), null);
        }

        fs.writeFile(fullPath, fileObj.fileData, function (err) {
            return callback(err ? common.getError(1013) : null, err ? null : fileObject);
        });
    });
}
exports.writeFile = writeFile;

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
            logger.error(JSON.stringify(err));
            return callback(common.getError(2016), null);
        }

        mkdir(common.vfsTree.HOME, 'Users', common.vfsPermission.SYSTEM, function (err, result) {
            if (err) {
                logger.error(JSON.stringify(err));
                return callback(common.getError(1007), null);
            }

            rmrf(common.vfsTree.HOME, 'Questions', function (err, result) {
                if (err) {
                    logger.error(JSON.stringify(err));
                    return callback(common.getError(1010), null);
                }

                mkdir(common.vfsTree.HOME, 'Questions', common.vfsPermission.SYSTEM, function (err, result) {
                    if (err) {
                        logger.error(JSON.stringify(err));
                        return callback(common.getError(1007), null);
                    }

                    db.removeVirtualFileSystem(callback);
                });
            });
        });
    });
}
