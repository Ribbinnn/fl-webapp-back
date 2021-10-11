let mongoose = require('mongoose');

const schema = new mongoose.Schema({}, { strict: false });

// pacs database (mongodb mock up)
mongoose = mongoose
        .createConnection('mongodb://localhost/pacs')
        .on('error', console.error.bind(console, 'MongoDB connection error:'));

const PACS = mongoose.model('pacs', schema);

module.exports = { PACS };