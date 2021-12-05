const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// Create new user
router.post('/', userController.create);

// Update user (admin)
router.patch('/', tokenValidation, verification.adminVerification, userController.update);

// Get users (admin)
router.get('/', tokenValidation, verification.adminVerification, userController.getAll);

// Get user by id (admin)
router.get('/:id', tokenValidation, verification.adminVerification, userController.getById);

module.exports = router;
