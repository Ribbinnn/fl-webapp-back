const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const tokenValidation = require('../middlewares/tokenVerification')

// Create new user
router.post('/', userController.create);

// Get all users
router.get('/', tokenValidation, userController.getAll);

// Get user by id
router.get('/:id', tokenValidation, userController.getById);

module.exports = router;
