const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const tokenGenerator = require('../middlewares/tokenGenerator');
const webModel = require('../models/webapp')
const axios = require('axios')
const { userStatus } = require('../utils/status')

dotenv.config();

const login = async (req, res) => {
    try {
        // check if username is in the database
        const user = await webModel.User.findOne({ username: req.body.username });
        if (!user || user.isChulaSSO || user.status !== userStatus.ACTIVE) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // check if password is correct
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // generate jwt token
        const data = tokenGenerator({
            _id: user._id,
            username: req.body.username,
            // first_name: user.first_name, 
            // last_name: user.last_name, 
            role: user.role
        }, req.body.remember ? true : false);

        // store token in database
        await webModel.User.findByIdAndUpdate(user._id, {
            $push: { token: data }
        })
        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            data: {
                user_id: user._id,
                username: user.username,
                // name: user.name,first_name: user.first_name, 
                // last_name: user.last_name, 
                role: user.role,
                token: data
            }
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

const logout = async (req, res) => {
    try {
        // update token to be empty
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        await webModel.User.findByIdAndUpdate(req.user._id, {
            $pullAll: { token: [token] }
        })
        return res.status(200).json({ success: true, message: 'Logout successfully' })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

const chulaSSO = async (req, res) => {
    try {
        const response = (await axios.get('https://account.it.chula.ac.th/serviceValidation', {
            headers: {
                'DeeAppId': process.env.DeeAppId,
                'DeeAppSecret': process.env.DeeAppSecret,
                'DeeTicket': req.query.ticket
            }
        })).data

        // console.log(response.username, response.email, response.roles)
        let user = await webModel.User.findOne({ username: response.username })
        if (!user) {
            user = await webModel.User.create({
                username: response.username,
                email: response.email,
                first_name: response.firstname,
                last_name: response.lastname,
                role: response.roles[0],
                token: [],
                isChulaSSO: true,
                projects: []
            })
        }

        const data = tokenGenerator({
            _id: user._id,
            username: user.username,
            role: user.role
        }, req.body.remember ? true : false);
        await webModel.User.findByIdAndUpdate(user._id, { $push: { token: data } })
        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            data: {
                user_id: user._id,
                username: user.username,
                role: user.role,
                token: data
            }
        })
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

module.exports = {
    login,
    logout,
    chulaSSO
}
