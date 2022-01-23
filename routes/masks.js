const express = require('express');
const router = express.Router();
const maskController = require('../controllers/maskController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// create mask(bounding box postion) by report id (pred_result_id)
router.patch('/', tokenValidation, verification.radiologistVerification, verification.reportVerification, verification.checkEditReportStatus, maskController.insertBBox)

// get bounding box postion by report id
router.get('/report/:report_id', tokenValidation, verification.reportVerification, maskController.getBBox)

// create mask(bounding box postion) local
router.patch('/local', tokenValidation, maskController.insertBBoxLocal)

// get bounding box postion by report id local
router.get('/local/', tokenValidation, maskController.getBBoxLocal)

module.exports = router;