let mongoose = require('mongoose');

// webapp database
mongoose = mongoose
        .createConnection('mongodb://localhost/webapp')
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;