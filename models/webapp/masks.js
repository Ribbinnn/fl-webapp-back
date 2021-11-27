const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        result_id: { type: ObjectId, ref: "pred_results" },
        label: { type: String },
        tool: { type: String },
        data: { type: Object },
        updated_by: {type: ObjectId, ref: "users"}
    },
    {
        timestamps: true
    }
);

const Mask = db.model("masks", schema);

module.exports = Mask;