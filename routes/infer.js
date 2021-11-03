const express = require('express');
const router = express.Router();
const inferController = require('../controllers/inferController')
const userAuthentication = require('../middlewares/tokenVerification')
const upload = require('../middlewares/uploadFile')

router.post('/', userAuthentication, upload.single('file'), inferController.inferResult);

router.get('/', userAuthentication, inferController.getAllResult);

module.exports = router;