let mongoose = require('mongoose');

// vitals database
mongoose = mongoose
        .createConnection('mongodb://localhost/vitals')
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;