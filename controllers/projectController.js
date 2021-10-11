const Joi = require("joi"); 
const webModel = require('../models/webapp')

const schema = {
    name: Joi.string().required(),
    task: Joi.string(),
    description: Joi.string(),
    cover_img: Joi.string(),
    users: Joi.array().items(Joi.string()),
    fields: Joi.object()
};

const validator = Joi.object(schema);

const create = async (req, res) => {
    // validate input
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        const project = await webModel.Project.create({...req.body})
        await Promise.all(req.body.users.map(async (id) => {
            await webModel.User.findByIdAndUpdate(id, {$push: {projects: project.id}})
        }))
        await webModel.MedRecord.create({project_id: project.id, records: []})
        return res.status(200).json({
            success: true, 
            message: 'Create project successfully', 
            data: project
        })
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

module.exports = {
    create
}