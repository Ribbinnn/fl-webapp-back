const mongoose = require('mongoose');

// webapp database
db = mongoose
        .createConnection('mongodb://localhost/webapp')
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;