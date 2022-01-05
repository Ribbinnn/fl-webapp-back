const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadFile')
const path = require('path')

// // upload file
// router.post('/', upload.single('file'), async (req, res) => {
//     console.log(req.file)
//     return res.status(200).send('success')
// });

// // get file
// router.get('/:filename', async (req, res) => {
//     console.log(req.params.filename)
//     const uploadPath = path.join(__dirname, '../resources/uploads/', req.params.filename)
//     return res.status(200).sendFile(uploadPath)
// })

module.exports = router;
