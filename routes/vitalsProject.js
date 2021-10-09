const express = require('express');
const router = express.Router();
const vitalsProjectController = require('../controllers/vitalsProjectController')
const userAuthentication = require('../middlewares/tokenVerification')

// create project
router.post('/', userAuthentication, vitalsProjectController.create);

// get project by owner name
router.get('/', userAuthentication, vitalsProjectController.getByOwner)

// get project by id
router.get('/:id', userAuthentication, vitalsProjectController.getById)

module.exports = router;
