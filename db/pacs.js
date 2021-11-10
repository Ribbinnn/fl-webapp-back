let mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

const schema = new mongoose.Schema({}, { strict: false });

// pacs database (mongodb mock up)
mongoose = mongoose
        .createConnection(process.env.pacsDB)
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

const PACS = mongoose.model('pacs', schema);

module.exports = { PACS };