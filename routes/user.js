const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// Create new user
router.post('/', tokenValidation, verification.adminVerification, userController.create);

// Update user
router.patch('/', tokenValidation, verification.userVerification, userController.update);

// Get users (admin)
router.get('/', tokenValidation, verification.adminVerification, userController.getAll);

// Get user by id
router.get('/:id', tokenValidation, verification.userVerification, userController.getById);

// Delete user by id (admin)
router.patch('/:id', tokenValidation, verification.adminVerification, userController.deleteUserById);

module.exports = router;
