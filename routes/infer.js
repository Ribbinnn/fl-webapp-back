const express = require('express');
const router = express.Router();
const inferController = require('../controllers/inferController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')
const upload = require('../middlewares/uploadFile')

// predict result from dicom file
router.post(
    '/',
    tokenValidation,
    verification.userVerification,
    verification.projectVerification,
    inferController.inferResult
);

// get all results
router.get('/', tokenValidation, inferController.getAllResult);

// view history by project id
router.get(
    '/list/project/:project_id',
    tokenValidation,
    verification.projectVerification,
    inferController.viewHistory
)

module.exports = router;