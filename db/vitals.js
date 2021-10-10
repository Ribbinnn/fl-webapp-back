const mongoose = require('mongoose');

// vitals database
db = mongoose
        .createConnection('mongodb://localhost/vitals')
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;