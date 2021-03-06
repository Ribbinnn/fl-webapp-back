const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        result_id: { type: ObjectId, ref: "pred_results" },
        prediction: { type: Object }
    },
    {
        timestamps: true
    }
);

const PredClass = db.model("pred_classes", schema);

module.exports = PredClass;