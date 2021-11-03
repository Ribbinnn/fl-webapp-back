const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        result_id: { type: ObjectId, ref: "pred_results" },
        finding: { type: String },
        gradcam_path: {type: String}
    },
    {
        timestamps: true
    }
);

const Gradcam = db.model("gradcams", schema);

module.exports = Gradcam;