const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        result_id: { type: ObjectId, ref: "pred_results" },
        finding: { type: String },
        position: { type: Object },
        clinician_id: {type: ObjectId, ref: "users"}
    },
    {
        timestamps: true
    }
);

const Mask = db.model("masks", schema);

module.exports = Mask;