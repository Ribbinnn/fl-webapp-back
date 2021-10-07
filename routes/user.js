const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

// Create new user
router.post('/', userController.createUser);

// Get all user
router.get('/', userController.getAll);

module.exports = router;
