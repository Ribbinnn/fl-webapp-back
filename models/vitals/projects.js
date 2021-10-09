const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../../db/vitals')

const schema = new Schema(
    {
        name: { type: String, required: true, unique: false },
        owner: { type: String, required: true },
        HN: { type: String, required: true },
        description: { type: String },
    },
    {
        timestamps: true
    }
    
);

// import vitals database
// schema for projects collection
const Project = db.model("projects", schema);

module.exports = Project;