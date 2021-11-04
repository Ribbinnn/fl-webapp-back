const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController')
const userAuthentication = require('../middlewares/tokenVerification')

// create project
router.post('/records/', userAuthentication, vitalsController.create);

// get all projects by clinician's user id
router.get('/projects/clinician/:id', userAuthentication, vitalsController.getProjectByClinician)

// get records by project id
router.get('/projects/:id/medrec', userAuthentication, vitalsController.getRecordByProjectId)

// get all projects
router.get('/projects', userAuthentication, vitalsController.getAll)

// update record row by record id
router.patch('/records/updaterow', userAuthentication, vitalsController.updateRecRow);

// delete record row by id and index
router.patch('/records/deleterow', userAuthentication, vitalsController.deleteRecRow);

// delete record row by id and index
router.delete('/records/deletefile/:id', userAuthentication, vitalsController.deleteRecFile);

// get all records by patient HN
router.get('/records/HN/:HN', userAuthentication, vitalsController.getRecordByHN)

// generate template by project name
router.get('/template/:project_name', userAuthentication, vitalsController.generateTemplate)

module.exports = router;
