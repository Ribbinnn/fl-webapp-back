const express = require('express');
const router = express.Router();
const pacsController = require('../controllers/pacsController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// get all dicom rows by patient's HN
router.get('/', tokenValidation, pacsController.getAllByQuery)

// get patient's data from PACS
router.get('/info/', tokenValidation, pacsController.getInfoByHN);

// save back to PACS
router.post(
    '/save',
    tokenValidation,
    verification.reportVerification,
    pacsController.saveToPACS
)

module.exports = router;