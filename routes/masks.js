const express = require('express');
const router = express.Router();
const maskController = require('../controllers/maskController')
const tokenValidation = require('../middlewares/tokenVerification')

// router.post('/', tokenValidation, maskController.insertBBox)

// router.get('/result/:result_id', tokenValidation, maskController.getBBox)

module.exports = router;