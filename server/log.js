var winston = require('winston');
require('winston-daily-rotate-file');

exports.init = function(callback) {
    winston.add(winston.transports.DailyRotateFile, {
        filename: 'log/quizzard',
        datePattern: 'yyyy-MM-dd-',
        prepend: true
    });
    callback();
}

exports.logger = winston;
