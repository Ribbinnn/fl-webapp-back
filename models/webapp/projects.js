const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        name: { type: String, required: true, unique: false },
        owner_first_name: { type: String, required: true },
        owner_last_name: { type: String, required: true },
        task: { type: String, required: true },
        description: { type: String },
        cover_image: { type: String }
    },
    {
        timestamps: true
    }
    
);

// import webapp database
// schema for projects collection
const Project = db.model("projects", schema);

module.exports = Project;