const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController')
const tokenValidation = require('../middlewares/tokenVerification')
const verification = require('../middlewares/verification')

// create project
router.post(
    '/records/',
    tokenValidation,
    verification.userVerification,
    vitalsController.create
);

// get all projects by clinician's user id
router.get(
    '/projects/clinician/:id',
    tokenValidation,
    verification.userVerification,
    vitalsController.getProjectByClinician
    )

// get records by project id
router.get('/projects/:id/medrec', tokenValidation, vitalsController.getRecordByProjectId)

// get all projects
router.get('/projects', tokenValidation, vitalsController.getAll)

// update record row by record id
router.patch('/records/updaterow', tokenValidation, vitalsController.updateRecRow);

// delete record row by id and index
router.patch('/records/deleterow', tokenValidation, vitalsController.deleteRecRow);

// delete record row by id and index
router.delete('/records/deletefile/:id', tokenValidation, vitalsController.deleteRecFile);

// get all records by patient HN
router.get('/records/HN/:HN', tokenValidation, vitalsController.getRecordByHN)

// generate template by project name
router.get('/template/:project_name', tokenValidation, vitalsController.generateTemplate)

module.exports = router;
