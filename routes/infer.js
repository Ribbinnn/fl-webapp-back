const express = require('express');
const router = express.Router();
const inferController = require('../controllers/inferController')
const userAuthentication = require('../middlewares/tokenVerification')
const upload = require('../middlewares/uploadFile')

// predict result from dicom file
router.post('/', userAuthentication, inferController.inferResult);

// get all results
router.get('/', userAuthentication, inferController.getAllResult);

module.exports = router;