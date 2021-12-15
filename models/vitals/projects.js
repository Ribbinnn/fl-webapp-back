const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/vitals')

const schema = new Schema(
    {
        name: { type: String, required: true, unique: false },
        webproject_id: { type: ObjectId },
        user_id: { type: ObjectId },
        clinician_first_name: { type: String, required: true },
        clinician_last_name: { type: String, required: true },
        record_name: { type: String },
    },
    {
        timestamps: true
    }
);

// import vitals database
// schema for projects collection
const Project = db.model("projects", schema);

module.exports = Project;