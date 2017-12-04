/*
These errors are only for BE and API use
Error codes and their corresponding message. Error codes are under different
categories:
1000 -> system
2000 -> user
3000 -> question
4000 -> class
5000 -> analytics
6000 -> import/export
7000 -> settings
*/

const errors = Object.freeze({
    //1000 system
    1000: 'invalid request',
    1001: 'missing requirement',
    1002: 'permission denied',
    1003: 'confirm password doesn\'t match',
    1004: 'failed to initialize database connection',
    1005: 'failed to validate password',
    1006: 'invalid credentials',
    1007: 'failed to make directory',
    1008: 'failed to remove from database',
    1009: 'failed to hash password',
    1010: 'failed to remove rmrf',
    1011: 'invalid input type',
    1012: 'failed to remove directory',
    1013: 'failed to write data to a file',

    //2000 user
    2000: 'user failed to log in',
    2001: 'failed to get student by id',
    2002: 'failed to get student list',
    2003: 'failed to get student list with status',
    2004: 'failed to sort accounts',
    2005: 'failed to add admin',
    2006: 'failed to get user by id',
    2007: 'failed to add student',
    2008: 'failed to deactivate student account',
    2009: 'user cannot be found',
    2010: 'user failed to authenticate',
    2011: 'failed to update profile',
    2012: 'failed to update student by id',
    2013: 'failed to get users list',
    2014: 'failed to check if user exists',
    2015: 'failed to get sorted student list',
    2016: 'failed to remove all users',
    2017: 'failed to find user',
    2018: 'failed to update user',
    2019: 'user already exists',
    2020: 'failed to get leaderboard',

    //3000 question
    3000: 'failed to get question list by user',
    3001: 'failed to find matching question type',
    3002: 'failed to look up question by id',
    3003: 'question not found',
    3004: 'failed to get all questions list',
    3005: 'question is not available',
    3006: 'failed to submit answer',
    3007: 'Failed to add question',
    3008: 'invalid rating',
    3009: 'failed to submit rating',
    3010: 'failed to get discussion board visibility enabled',
    3011: 'discussion board is not available',
    3012: 'failed to add comment',
    3013: 'failed to add reply',
    3014: 'invalid vote',
    3015: 'failed to vote on comment',
    3016: 'failed to vote on reply',
    3017: 'failed to get question list',
    3018: 'failed to add question',
    3019: 'failed to find question',
    3020: 'failed to update question',
    3021: 'failed to prepare question data',
    3022: 'invalid question attributes',
    3023: 'failed to remove question',

    //4000 class
    4000: 'failed to check if the class is active',

    //5000 analytics
    5000: 'graphs not available',

    //6000 import/export
    6000: 'failed to find a student from the export list',
    6001: 'export job failed',
    6002: 'invalid file format',
    6003: 'failed to upload file',
    6004: 'failed to parse the CSV file',
    6005: 'invalid student list',
    6006: 'file cannot be found',
    6007: 'failed to download',

    //7000 setting
    7000: 'failed to reset all settings',
    7001: 'failed to update settings',
    7002: 'failed to add setting',
    7003: 'failed to get settings object',
    7004: 'settings object not found',
    7005: 'failed to get all settings',
    7006: 'class is not active',

    //9000 setting
    9000: 'failed to clean the virtual file system',
    9001: 'failed to add to the virtual file system',
    9002: 'error trying to find item in virtual file system',
    9003: 'can not find item in virtual file system',
    9004: 'can not add item in virtual file system'
});
exports.errors = errors;
