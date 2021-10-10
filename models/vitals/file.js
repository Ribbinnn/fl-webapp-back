const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/vitals')

const schema = new Schema(
    {
        project_id: { type: ObjectId, required: true, ref: "projects" },
        file_name: {type: String, required: true},
        file_type: {type: String, required: true}
    },
    {
        timestamps: true
    }
    
);

// import vitals database
// schema for files collection
const Record = db.model("records", schema);

module.exports = Project;