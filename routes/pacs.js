const express = require('express');
const router = express.Router();
const pacsController = require('../controllers/pacsController')

// get all dicom rows by patient's HN
router.get('/HN/:HN', pacsController.getAllByHN)

// get patient's data from PACS
router.get('/HN/:HN/info', pacsController.getInfoByHN);

module.exports = router;