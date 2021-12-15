const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        record_id: { type: ObjectId, ref: "medrecords" },
        image_id: { type: ObjectId, required: true, ref: "images" },
        project_id: { type: ObjectId, required: true, ref: "projects" },
        status: { type: String }, // in progress, annotated, reviewed, finalized, canceled
        hn: { type: Number },
        label: { type: Object },
        note: { type: String },
        created_by: {type: ObjectId, ref: "users"},
        finalized_by: {type: ObjectId, ref: "users"},
    },
    {
        timestamps: true
    }
);

const PredResult = db.model("pred_results", schema);

module.exports = PredResult;