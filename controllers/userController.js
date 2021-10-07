// call user model
const User = require('../models/users')
const bcrypt = require('bcryptjs');
const Joi = require("joi"); 

// create data validator for input
const schema = {
    username: Joi.string().required(),
    password: Joi.string().required().min(8).max(32),
};
  
const validator = Joi.object(schema);

// Create new user
createUser = async (req, res) => {
    // validate input (req.body)
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        res.statusCode = 400;
        return res.send({message: 'Incorrect input'})
    }
    try {
        // hash password
        const passwordHash = await bcrypt.hash(req.body.password, 10);
      
        // insert data to users collection
        const user = await User.create({
            username: req.body.username,
            password: passwordHash
        })

        // send status and message
        res.statusCode = 200;
        return res.send({message: 'Create user successfully', data: {username: user.username}})
    } catch (e) {
        // if error, send status and message
        res.statusCode = 500;
        return res.send({message: 'Cannot create user'})
    }
}

// Get all users
getAll = async (req, res) => {
    try {
        // Find all user from users collection
        const user = await User.find();

        // send status and message
        res.statusCode = 200;
        return res.send({message: 'Get all user successfully', data: user})
    } catch (e) {
        // if error, send status and message
        res.statusCode = 500;
        return res.send({message: 'Cannot get user'})
    }
}

module.exports = {
    createUser,
    getAll
}