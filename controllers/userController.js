// call user model
const bcrypt = require('bcryptjs');
const Joi = require("joi"); 
const webModel = require('../models/webapp')

// create data validator for input
const schema = {
    username: Joi.string().required(),
    password: Joi.string().required().min(8).max(32),
    name: Joi.string(),
    role: Joi.string()
};
  
const validator = Joi.object(schema);
const salt = 10;

// create new user
const create = async (req, res) => {
    // validate input (req.body)
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        // hash password
        const passwordHash = await bcrypt.hash(req.body.password, salt);
      
        // insert data to users collection
        const user = await webModel.User.create({
            ...req.body,
            password: passwordHash,
            token: ""
        })

        // send status and message
        return res.status(200).json({
            success: true, 
            message: 'Create user successfully', 
            data: {
                user_id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        })
    } catch (e) {
        // if username is duplicate
        if (e.message.includes('duplicate key')) {
            return res.status(400).json({success: false, message: 'Duplicate username'})
        }

        // other error
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

// get all users
const getAll = async (req, res) => {
    try {
        // Find all user from users collection
        const user = await webModel.User
                            .find()
                            .select(['_id', 'username', 'name', 'role'])

        // send status and message
        return res.status(200).json({message: 'Get all users successfully', data: user});
    } catch (e) {
        // if error, send status and message
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get user by id
const getById = async (req, res) => {
    try {
        const user = await webModel.User.findById(req.params.id, ['_id', 'username', 'name', 'role']);

        return res.status(200).json({message: 'Get all users successfully', data: user});
    } catch (e) {

    }
}

module.exports = {
    create,
    getAll,
    getById
}