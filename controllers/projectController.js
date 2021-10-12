const Joi = require("joi"); 
const webModel = require('../models/webapp')

const schema = {
    name: Joi.string().required(),
    task: Joi.string(),
    description: Joi.string(),
    cover_img: Joi.string(),
    users: Joi.array().items(Joi.string()),
    predClasses: Joi.array().items(Joi.string()),
    requirements: Joi.array()
};

const validator = Joi.object(schema);

// create new project
const create = async (req, res) => {
    // validate input
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        // create project
        const project = await webModel.Project.create({...req.body})

        // update project list of associated user
        await Promise.all(req.body.users.map(async (id) => {
            await webModel.User.findByIdAndUpdate(id, {$push: {projects: project.id}})
        }))

        // create medical record for the project
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

// get project by id
const getById = async (req, res) => {
    try {
        const project = await webModel.Project.findById(req.params.id);
        return res.status(200).json({success: true, message: 'Get project successfully', data: project});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

// get all projects by user id
const getByUserId = async (req, res) => {
    try {
        const data = await webModel.User.findById(req.params.id).populate('projects');
        return res.status(200).json({
                                success: true, 
                                message: 'Get project successfully', 
                                data: {projects: data? data.projects: []}
                            });
    } catch (e) {
        // invalid mongoose object id
        if (e.message.includes('Cast to ObjectId failed')) {
            return res.status(400).json({success: false, message: 'Invalid user id'})
        }

        // other error
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get all projects
const getAll = async (req, res) => {
    try {
        const data = await webModel.Project.find();
        return res.status(200).json({success: true, message: 'Get project successfully', data: data});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

module.exports = {
    create,
    getById,
    getByUserId,
    getAll
}