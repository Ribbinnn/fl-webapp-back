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

// get projects
router.get(
    '/',
    tokenValidation,
    verification.userVerification,
    vitalsController.getProject
    )

// get records by project id
router.get('/projects/:id/medrec', tokenValidation, vitalsController.getRecordByProjectId)

// update record row by record id
router.patch('/records/updaterow', tokenValidation, vitalsController.updateRecRow);

// delete record row by id and entry id
router.patch('/records/deleterow', tokenValidation, vitalsController.deleteRecRow);

// delete record row by id 
router.patch('/records/deletefile/:id', tokenValidation, vitalsController.deleteRecFile);

// get all records by patient HN
router.get('/records/', tokenValidation, vitalsController.getRecordByHN)

// generate template by project name
router.get('/template/:project_id', tokenValidation, vitalsController.generateTemplate)

module.exports = router;
