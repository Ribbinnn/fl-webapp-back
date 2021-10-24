const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        name: { type: String, required: true, unique: false },
        task: { type: String, required: true },
        description: { type: String },
        requirements: { type: Object },
        predClasses: [{type: String}],
        users: [{type: ObjectId, ref: "users"}]
    },
    {
        timestamps: true
    }
    
);

// import webapp database
// schema for projects collection
const Project = db.model("projects", schema);

module.exports = Project;