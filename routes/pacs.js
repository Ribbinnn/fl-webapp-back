const express = require('express');
const router = express.Router();
const pacsController = require('../controllers/pacsController')
const verification = require('../middlewares/verification')

// get all dicom rows by patient's HN
router.get('/HN/:HN', pacsController.getAllByHN)

// get patient's data from PACS
router.get('/HN/:HN/info', pacsController.getInfoByHN);

// save back to PACS
router.post(
    '/save',
    tokenValidation,
    verification.reportVerification,
    pacsController.saveToPACS
)

module.exports = router;