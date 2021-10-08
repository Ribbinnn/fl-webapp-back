const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const userAuthentication = require('../middlewares/tokenVerification')

// Create new user
router.post('/', userController.create);

// Get all user
router.get('/', userController.getAll);

module.exports = router;
