const express = require('express');
const router = express.Router();
const inferController = require('../controllers/inferController')
const userAuthentication = require('../middlewares/tokenVerification')
const upload = require('../middlewares/uploadFile')
const imageController = require('../controllers/imageController')
const path = require('path');
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data');
const extract = require('extract-zip')

router.post('/', upload.single('file'), inferController.createResult);

router.get('/', inferController.getAllResult);

router.get('/image', imageController.getImage)

module.exports = router;