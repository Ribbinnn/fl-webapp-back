const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController')
const userAuthentication = require('../middlewares/tokenVerification')

// get all dicom rows by patient's HN
router.get('/:rid', userAuthentication, reportController.getById)


module.exports = router;