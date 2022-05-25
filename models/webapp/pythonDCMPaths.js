const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        accession_no: { type: String, required: true, unique: true, index: true },
        hn: { type: String },
        study_time: { type: Date }
    }
);

const PythonDCMPath = db.model("python_dcm_paths", schema);

module.exports = PythonDCMPath;