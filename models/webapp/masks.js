const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        result_id: { type: ObjectId, ref: "pred_results" },
        data: {
            label: { type: String },
            tool: { type: String },
            updated_by: { type: ObjectId, ref: "users" },
            data: { type: Object },
            updated_time: { type: Date }
        },
    },
    {
        timestamps: true
    }
);

const Mask = db.model("masks", schema);

module.exports = Mask;