const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const tokenGenerator = require('../middlewares/tokenGenerator');
const User = require('../models/users');

dotenv.config();

const login = async (req, res) => {
    try {
        // check if username is in the database
        const user = await User.findOne({username: req.body.username});
        if (!user) {
            return res.status(401).json({success: false, message: 'Wrong username or password'});
        }

        // check if password is correct
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) {
            return res.status(401).json({success: false, message: 'Wrong username or password'});
        }

        // generate jwt token
        const data = tokenGenerator({username: req.body.username});

        // store token in database
        await User.findByIdAndUpdate(user._id, { token : data })
        return res.status(200).json({
            success: true, 
            message: 'Login successfully', 
            data: {
                user_id: user._id,
                username: user.username,
                token: data
            }
        })
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

const logout = async (req, res) => {
    try {
        // update token to be empty
        await User.findByIdAndUpdate(req.body.user_id, { token : "" })
        return res.status(200).json({success: true, message: 'Logout successfully'})
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

module.exports = {
    login,
    logout
}
