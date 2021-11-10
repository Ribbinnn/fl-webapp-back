let mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// webapp database
mongoose = mongoose
        .createConnection(process.env.webappDB)
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;