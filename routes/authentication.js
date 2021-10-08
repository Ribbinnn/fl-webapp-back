const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')
const userAuthentication = require('../middlewares/tokenVerification')

router.post('/login', authController.login)

router.post('/logout', authController.logout)

module.exports = router;
