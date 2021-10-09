const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../../db/config')

const schema = new Schema(
    {
        username: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        type: {type: String},
        name: { type: String },
        role: {type: String}
    },
    {
        timestamps: true
    }
    
);

// select webapp database
// Create schema for users collection
const User = db.webapp.model("users", schema);

module.exports = User;
