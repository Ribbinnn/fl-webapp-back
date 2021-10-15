const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/vitals')

const schema = new Schema(
    {
        project_id: { type: ObjectId, required: true, ref: "projects" },
        filename: {type: String, required: true},
        file:
        {
            data: Buffer,
            contentType: String
        }
    },
    {
        timestamps: true
    }
    
);

const File = db.model("files", schema);

// module.exports = File;