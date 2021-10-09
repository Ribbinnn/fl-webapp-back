const Joi = require("joi"); 
const vitalsModdel = require('../models/vitals');

const schema = {
    name: Joi.string().required(),
    HN: Joi.string().required(),
    description: Joi.string(),
};

const validator = Joi.object(schema);

// create project
const create = async (req, res) => {
    // validate input (req.body)
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        // req.user contains {id, username, name, role} of the user
        const project = await vitalsModdel.Project.create({...req.body, owner: req.user.name})
        // send status and message
        return res.status(200).json({
            success: true, 
            message: 'Create project successfully', 
            data: {
                project_id: project._id,
                name: project.name,
                owner: project.owner,
                HN: project.HN,
                description: project.description,
            }
        })
    } catch (e) {
        // error
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

// get project by owner
const getByOwner = async (req, res) => {
    try {
        const data = await vitalsModdel.Project.find({owner: req.user.name})

        return res.status(200).json({message: 'Get projects successfully', data: data});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get project by id
const getById = async (req, res) => {
    try {
        const data = await vitalsModdel.Project.findById(req.params.id);
        return res.status(200).json({message: 'Get project successfully', data: data});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

module.exports = {
    create,
    getByOwner,
    getById
}