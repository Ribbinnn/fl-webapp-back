// call user model
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const Joi = require("joi"); 

// create data validator for input
const schema = {
    username: Joi.string().required(),
    password: Joi.string().required().min(8).max(32),
};
  
const validator = Joi.object(schema);
const salt = 10;

// Create new user
const create = async (req, res) => {
    // validate input (req.body)
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Incorrect input'})
    }
    try {
        // hash password
        const passwordHash = await bcrypt.hash(req.body.password, salt);
      
        // insert data to users collection
        const user = await User.create({
            username: req.body.username,
            password: passwordHash,
            token: ""
        })

        // send status and message
        return res.status(200).json({success: true, message: 'Create user successfully', data: {username: user.username}})
    } catch (e) {
        // if error, send status and message
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

// Get all users
const getAll = async (req, res) => {
    try {
        // Find all user from users collection
        const user = await User.find();

        // send status and message
        res.statusCode = 200;
        return res.send({message: 'Get all users successfully', data: user});
    } catch (e) {
        // if error, send status and message
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

module.exports = {
    create,
    getAll
}