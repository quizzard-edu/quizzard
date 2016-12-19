var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var logger = require('./log.js').logger;

var DB_HOST = process.env.DB_HOST || 'localhost';
var DB_PORT = process.env.DB_PORT || 27017;
var DB_NAME = process.env.DB_NAME || 'quizzard';

var db = new Db(DB_NAME, new Server(DB_HOST, DB_PORT));

exports.initialize = function(callback) {
    db.open(function(err, db) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
        logger.info('Connection to Quizzard database successful.');
        callback();
    });
}

/* allow other files to access the database connection */
exports.database = db;
