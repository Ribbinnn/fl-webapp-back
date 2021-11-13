const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        project_id: { type: ObjectId, required: true, ref: "projects" },
        accession_no: { type: String, required: true },
        hn: { type: Number }
    },
    {
        timestamps: true
    }
);

const Image = db.model("images", schema);

module.exports = Image;