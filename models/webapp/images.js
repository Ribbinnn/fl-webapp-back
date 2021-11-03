const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        project_id: { type: ObjectId, required: true, ref: "projects" },
        filepath: { type: String, required: true },
        filetype: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

const Image = db.model("images", schema);

module.exports = Image;