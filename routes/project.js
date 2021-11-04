const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const medRecController = require('../controllers/medRecController');
const pacsController = require('../controllers/pacsController');
const userAuthentication = require('../middlewares/tokenVerification');

// create new project
router.post('/', userAuthentication, projectController.create);

// get all projects
router.get('/', userAuthentication, projectController.getAll);

// get all projects by user id
router.get('/user/:id', userAuthentication, projectController.getByUserId);

// get project by id
router.get('/:id', userAuthentication, projectController.getById);

// insert new record by project id
router.post('/:id/insert', userAuthentication, medRecController.insertMedRec);

module.exports = router;