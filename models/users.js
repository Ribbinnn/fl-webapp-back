const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true
    }
    
);

// Create schema for users collection
const User = mongoose.model("users", schema);

module.exports = User;
