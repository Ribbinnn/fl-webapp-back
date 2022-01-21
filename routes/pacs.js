const express = require('express');
const router = express.Router();
const pacsController = require('../controllers/pacsController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// get all dicom rows by patient's HN
router.get('/HN/', tokenValidation, pacsController.getAllByHN)

// get patient's data from PACS
router.get('/HN/info/', tokenValidation, pacsController.getInfoByHN);

// save back to PACS
router.post(
    '/save/:report_id',
    tokenValidation,
    verification.reportVerification,
    pacsController.saveToPACS
)

module.exports = router;