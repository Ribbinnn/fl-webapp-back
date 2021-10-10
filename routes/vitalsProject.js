const express = require('express');
const router = express.Router();
const vitalsProjectController = require('../controllers/vitalsProjectController')
const userAuthentication = require('../middlewares/tokenVerification')
const multer=require('multer')
  
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

// create project
// use multer to upload file
router.post('/', userAuthentication, upload.single('file'), vitalsProjectController.create);

// get project by owner name
router.get('/owner', userAuthentication, vitalsProjectController.getByOwner)

// get project by id
router.get('/:id', userAuthentication, vitalsProjectController.getById)

// get all projects
router.get('/', userAuthentication, vitalsProjectController.getAll)

module.exports = router;
