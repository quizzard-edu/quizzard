var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var DB_HOST = process.env.DB_HOST || 'localhost';
var DB_PORT = process.env.DB_PORT || 27017;
var DB_NAME = process.env.DB_NAME || 'quizzard';

var db = new Db(DB_NAME, new Server(DB_HOST, DB_PORT));

db.open(function(err, db) {
    if (err)
        console.log(err);
});

/* allow other files to access the database connection */
exports.database = db;
