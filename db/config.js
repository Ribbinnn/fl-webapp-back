const mongoose = require('mongoose');

// create two databases

// webapp database
mongoose.webapp = mongoose
                    .createConnection('mongodb://localhost/webapp')
                    .on('error', console.error.bind(console, 'MongoDB connection error:'));

// vitals database
mongoose.vitals = mongoose
                    .createConnection('mongodb://localhost/vitals')
                    .on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;