const express = require('express');
const router = express.Router();
const maskController = require('../controllers/maskController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// create mask(bounding box postion) by report id (pred_result_id)
router.patch('/', tokenValidation, verification.reportVerification, maskController.insertBBox)

// get bounding box postion by report id
router.get('/report/:report_id', tokenValidation, maskController.getBBox)

module.exports = router;