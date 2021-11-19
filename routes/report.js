const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// get all dicom rows by patient's HN
router.get('/:rid', tokenValidation, reportController.getById)

// update report
router.patch('/', tokenValidation, reportController.update)

// delete report
router.patch('/delete/:rid', tokenValidation, reportController.deleteById)

// view history by project id
router.get(
    '/list/project/:project_id',
    tokenValidation,
    verification.projectVerification,
    reportController.viewHistory
)

module.exports = router;