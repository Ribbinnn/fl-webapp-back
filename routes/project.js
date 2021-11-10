const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const medRecController = require('../controllers/medRecController');
const tokenValidation = require('../middlewares/tokenVerification');
const verification = require('../middlewares/verification')

// create new project
router.post('/', tokenValidation, projectController.create);

// get all projects
router.get('/', tokenValidation, projectController.getAll);

// get all projects by user id
router.get(
    '/user/:id',
    tokenValidation,
    verification.userVerification,
    projectController.getByUserId
);

// get project by id
router.get(
    '/:id',
    tokenValidation,
    verification.projectVerification,
    projectController.getById
);

// insert new record by project id
router.post('/:id/insert', tokenValidation, medRecController.insertMedRec);

module.exports = router;