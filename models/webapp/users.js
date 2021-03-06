const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        username: { type: String, required: true, unique: true, index: true },
        password: { type: String },
        email: { type: String },
        first_name: { type: String },
        last_name: { type: String },
        role: { type: String },
        token: [{ type: String }],
        isChulaSSO: { type: Boolean, required: true },
        projects: [{ type: ObjectId, ref: "projects" }],
        status: { type: String }
    },
    {
        timestamps: true
    }

);

// import webapp database
// schema for users collection
const User = db.model("users", schema);

module.exports = User;
