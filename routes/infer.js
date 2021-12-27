const express = require('express');
const router = express.Router();
const inferController = require('../controllers/inferController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')
// const upload = require('../middlewares/uploadFile')

// predict result from dicom file
router.post(
    '/',
    tokenValidation,
    verification.userVerification,
    verification.projectVerification,
    inferController.inferResult
);

// get all results
// router.get('/', tokenValidation, inferController.getAllResult);

module.exports = router;