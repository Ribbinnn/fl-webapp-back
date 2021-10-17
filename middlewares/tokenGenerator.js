const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const secret = process.env.SECRET_TOKEN;

const generateToken = (data) => {
  // generate jwt token when user login
  return jwt.sign(data, secret, {
    expiresIn: "900m",
  });
}

module.exports = generateToken;