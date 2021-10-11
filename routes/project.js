const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController')
const medRecController = require('../controllers/medRecController')
const userAuthentication = require('../middlewares/tokenVerification')

// Create new project
router.post('/', userAuthentication, projectController.create);

// Insert new record by project id
router.post('/:id/insert', userAuthentication, medRecController.insertMedRec);

module.exports = router;