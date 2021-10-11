const express = require('express');
const router = express.Router();

const user = require('./user')
const auth = require('./authentication')
const vitalsProject = require('./vitals')
const project = require('./project')

router.use('/api/users', user);
router.use('/api/auth', auth);
router.use('/api/projects/', project);
router.use('/api/vitals/', vitalsProject);

// Express default homepage
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
