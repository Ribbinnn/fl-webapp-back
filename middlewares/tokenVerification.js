const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../models/users')

dotenv.config();

const secret = process.env.SECRET_TOKEN;

const verifyToken = async (req, res, next) => {
    // get token from header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // if no token, send error message
    if (!token) {
        return res.status(401).json({success: false, message: 'Unauthorized'});
    }

    // check if token is not expired
    jwt.verify(token, secret, async (err, user) => {
        // check if user still login
        const result = await User.findOne({token: token});
        if (err || !result) {
            return res.status(401).json({success: false, message: 'Unauthorized'});
        }
        req.user = user;
        next();
    })
}

module.exports = verifyToken;