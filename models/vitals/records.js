const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/vitals')

const schema = new Schema(
    {
        project_id: { type: ObjectId, required: true, ref: "projects" },
        pacs_no: { type: String },
        lab_test: { type: Object },
        clinical: { type: Object }
    },
    {
        timestamps: true
    }
    
);

// import vitals database
// schema for records collection
const Record = db.model("records", schema);

module.exports = Project;