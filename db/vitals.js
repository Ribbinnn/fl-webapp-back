let mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

// vitals database
mongoose = mongoose
        .createConnection(process.env.vitalsDB)
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;