const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')

const schema = new Schema(
    {
        name: { type: String, required: true },
        task: { type: String, required: true },
        description: { type: String },
        requirements: { type: Object },
        predClasses: [{type: String}],
        users: [{type: ObjectId, ref: "users"}],
        head: [{type: ObjectId, ref: "users", required: true}]
    },
    {
        timestamps: true
    }
    
);

schema.index({name: 1, head: 1}, {unique: true})

// import webapp database
// schema for projects collection
const Project = db.model("projects", schema);

module.exports = Project;