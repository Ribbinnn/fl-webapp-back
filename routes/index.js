const express = require('express');
const router = express.Router();

const user = require('./user')
const auth = require('./authentication')

router.use('/api/users', user);
router.use('/api/auth', auth);

// Express default homepage
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
