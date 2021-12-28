const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const db = require('../../db/webapp')
const path = require('path');
const fs = require('fs')

const PredResult = require('./predResults')
const User = require('./users')

const schema = new Schema(
    {
        name: { type: String, required: true },
        task: { type: String, required: true },
        description: { type: String },
        requirements: { type: Object },
        predClasses: [{ type: String }],
        users: [{ type: ObjectId, ref: "users" }],
        head: [{ type: ObjectId, ref: "users", required: true }],
        rating: { type: Number },
        rating_count: { type: Number }
    },
    {
        timestamps: true
    }

);

schema.index({ name: 1, head: 1 }, { unique: true })

schema.pre('findOneAndDelete', { document: false, query: true }, async function () {
    const pid = this.getQuery()['_id']

    // delete project from associated user's list
    const project = await Project.findById(pid)
    await Promise.all(project.users.map(async (id) => {
        const user = await User.findByIdAndUpdate(id, {
            $pullAll: {
                projects: [pid]
            }
        })
    }))

    // delete all project's reports
    const result = await PredResult.find({ project_id: pid }, ['_id'])
    await Promise.all(result.map(async (id) => {
        await PredResult.findOneAndDelete({ _id: id })
    }))

    // delete project directory if exist
    const projectDir = path.join(__dirname, "../../resources/results", pid)
    if (fs.existsSync(projectDir)) {
        await fs.promises.rm(projectDir, { recursive: true, force: true });
    }

})

// import webapp database
// schema for projects collection
const Project = db.model("projects", schema);

module.exports = Project;