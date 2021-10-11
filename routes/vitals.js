const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController')
const userAuthentication = require('../middlewares/tokenVerification')
const multer=require('multer')
  
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

// create project
// use multer to upload file
router.post('/', userAuthentication, upload.single('file'), vitalsController.create);

// get all projects by owner's full name
router.get('/owner', userAuthentication, vitalsController.getByOwner)

// get records by project id
router.get('/:id/medrec', userAuthentication, vitalsController.getRecordByProjectId)

// get all projects
router.get('/', userAuthentication, vitalsController.getAll)

module.exports = router;
