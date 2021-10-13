const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController')
const userAuthentication = require('../middlewares/tokenVerification')
const upload = require('../middlewares/uploadFile')
const medRecController = require('../controllers/medRecController');

// create project
// use multer to upload file
router.post('/records/', userAuthentication, upload.single('file'), vitalsController.create);

// get all projects by clinician's full name
router.get('/projects/clinician', userAuthentication, vitalsController.getByClinician)

// get records by project id
router.get('/projects/:id/medrec', userAuthentication, vitalsController.getRecordByProjectId)

// get all projects
router.get('/projects', userAuthentication, vitalsController.getAll)

// delete record row by id and index
router.delete('/records/deleterow', userAuthentication, medRecController.deleteRecRow);

// delete record row by id and index
router.delete('/records/deletefile/:id', userAuthentication, medRecController.deleteRecFile);

module.exports = router;
