const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController')
const tokenValidation = require('../middlewares/tokenVerification')

// get all dicom rows by patient's HN
router.get('/:rid', tokenValidation, reportController.getById)

// update report
router.patch('/', tokenValidation, reportController.update)

module.exports = router;