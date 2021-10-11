const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController')
const userAuthentication = require('../middlewares/tokenVerification')
const multer=require('multer')
  
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

// create project
// use multer to upload file
router.post('/records/', userAuthentication, upload.single('file'), vitalsController.create);

// get all projects by clinician's full name
router.get('/projects/clinician', userAuthentication, vitalsController.getByClinician)

// get records by project id
router.get('/projects/:id/medrec', userAuthentication, vitalsController.getRecordByProjectId)

// get all projects
router.get('/projects', userAuthentication, vitalsController.getAll)

module.exports = router;
