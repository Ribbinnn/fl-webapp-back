const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const medRecController = require('../controllers/medRecController');
const tokenValidation = require('../middlewares/tokenVerification');
const verification = require('../middlewares/verification')

// create new project (admin)
router.post(
    '/',
    tokenValidation,
    verification.adminVerification,
    projectController.create
);

// update project by id (admin)
router.patch(
    '/',
    tokenValidation,
    verification.adminVerification,
    projectController.update
);

// manage project's user list (admin)
router.patch(
    '/manage',
    tokenValidation,
    verification.adminVerification,
    projectController.manageUser
);

// get all projects (admin)
router.get(
    '/',
    tokenValidation,
    verification.adminVerification,
    projectController.getAll
);

// get all projects by user id
router.get(
    '/user/:id',
    tokenValidation,
    verification.userVerification,
    projectController.getByUserId
);

// get task 
router.get(
    '/tasks',
    tokenValidation,
    projectController.getTask
)

// delete project by id
router.delete(
    '/delete/:project_id',
    tokenValidation,
    verification.projectVerification,
    projectController.deleteById
);

// get project by id
router.get(
    '/:project_id',
    tokenValidation,
    verification.projectVerification,
    projectController.getById
);

// router.post('/:id/insert', tokenValidation, medRecController.insertMedRec);

module.exports = router;