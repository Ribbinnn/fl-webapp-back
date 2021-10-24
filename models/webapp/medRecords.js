const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        project_id: { type: ObjectId, required: true, ref: "projects" },
        record: { type: Object }
    },
    {
        timestamps: true
    }
);

// import webapp database
// schema for projects collection
const MedRecord = db.model("medrecords", schema);

module.exports = MedRecord;