const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const userAuthentication = require('../middlewares/tokenVerification')

// Create new user
router.post('/', userController.create);

// Get all users
router.get('/', userAuthentication, userController.getAll);

// Get user by id
router.get('/:id', userAuthentication, userController.getById);

module.exports = router;
