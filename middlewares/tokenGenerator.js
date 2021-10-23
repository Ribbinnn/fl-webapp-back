const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const secret = process.env.SECRET_TOKEN;

const generateToken = (data, remember) => {
  // generate jwt token when user login
  return jwt.sign(data, secret, {
    expiresIn: remember? "90d": "24h",
  });
}

module.exports = generateToken;