const Joi = require("joi");
const webModel = require('../models/webapp')
const { task } = require('../utils/taskList')

const schema = {
    name: Joi.string().required().max(32),
    task: Joi.string().required().valid(
        "classification_pylon_256",
        "classification_pylon_1024",
        "covid19_admission"
    ),
    description: Joi.string().max(160),
    predClasses: Joi.array().items(Joi.string()),
    head: Joi.array().items(Joi.string()).required().min(1)
    // requirements: Joi.array().items(Joi.object({
    //     name: Joi.string(),
    //     type: Joi.string(),
    //     unit: Joi.string()
    // }))
};

const validator = Joi.object(schema);
const updatedValidator = Joi.object({ ...schema, id: Joi.string().required() });

// create new project
const create = async (req, res) => {
    // validate input
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        // create project
        const project = await webModel.Project.create({ ...req.body, users: req.body.head, requirements: task[req.body.task] })

        // update project list of associated user
        await Promise.all(req.body.head.map(async (id) => {
            await webModel.User.findByIdAndUpdate(id, { $push: { projects: project.id } })
        }))

        return res.status(200).json({
            success: true,
            message: 'Create project successfully',
            data: project
        })
    } catch (e) {
        if (e.message.includes('duplicate key')) {
            return res.status(400).json({ success: false, message: 'Duplicate project name' })
        }
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// get project by id
const getById = async (req, res) => {
    try {
        const project = await webModel.Project.findById(req.params.project_id);
        return res.status(200).json({ success: true, message: 'Get project successfully', data: project });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// get all projects by user id
const getByUserId = async (req, res) => {
    try {
        const data = await webModel.User.findById(req.params.id).populate('projects');
        return res.status(200).json({
            success: true,
            message: 'Get project successfully',
            data: { projects: data ? data.projects : [] }
        });
    } catch (e) {
        // invalid mongoose object id
        if (e.message.includes('Cast to ObjectId failed')) {
            return res.status(400).json({ success: false, message: 'Invalid user id' })
        }

        // other error
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// get all projects
const getAll = async (req, res) => {
    try {
        const data = await webModel.Project.find({}, ['_id', 'name', 'head']).populate('head', 'username');
        return res.status(200).json({ success: true, message: 'Get project successfully', data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// get all AI tasks
const getTask = async (req, res) => {
    return res.status(200).json({ success: true, message: 'Get task successfully', data: Object.keys(task) });
}

// update project by id
const update = async (req, res) => {
    const validatedResult = updatedValidator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        const project = await webModel.Project.findById(req.body.id)
        let newUsers = project.users
        await Promise.all(req.body.head.map(async id => {
            if (!newUsers.includes(id)){
                newUsers.push(id)
                await webModel.User.findByIdAndUpdate(id, { $addToSet: { projects: project.id } })
            }
        }))
        
        await webModel.Project.findByIdAndUpdate(req.body.id, {...req.body, users: newUsers})

        return res.status(200).json({
            success: true,
            message: `Update project ${req.body.id} successfully`,
            data: project
        })
    } catch (e) {
        if (e.message.includes('duplicate key')) {
            return res.status(400).json({ success: false, message: 'Duplicate project name' })
        }
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// delete project by id
const deleteById = async (req, res) => {
    try {
        const project = await webModel.Project.findOneAndDelete({_id: req.params.project_id})
        return res.status(200).json({
            success: true,
            message: `Delete project ${project.id} successfully`,
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

module.exports = {
    create,
    getById,
    getByUserId,
    getAll,
    getTask,
    update,
    deleteById
}