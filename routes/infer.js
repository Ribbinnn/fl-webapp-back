const express = require('express');
const router = express.Router();
const inferController = require('../controllers/inferController')
const userAuthentication = require('../middlewares/tokenVerification')
const upload = require('../middlewares/uploadFile')
const imageController = require('../controllers/imageController')
const path = require('path');
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data');
const extract = require('extract-zip')

router.post('/', upload.single('file'), async (req, res) => {
    try {
        const root = path.join(__dirname, "..");
        const data = new FormData() 
        data.append('file', fs.createReadStream(root + '\\resources\\uploads\\' + req.file.filename))
        data.append('model_name', 'classification_pylon_1024')

    
        let url = "http://localhost:7000/api/infer";
    
        axios.post(url, data, { // receive two parameter endpoint url ,form data 
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            },
            responseType: 'arraybuffer'
        })
        .then(res => { // then print response status
            fs.writeFile(root + '/resources/testzip.zip', res.data, (err) => {
                if (err) {
                    console.log('error')
                    throw err};
                console.log('save file');
                
                });
                extract(root + '/resources/testzip.zip', { dir: root + '/resources/testzip' })
            // const file = new File([res.data], 'untitled', { type: res.data.type })
        }).catch(e => {
            console.log(5)
            throw e
        })
        return res.status(200).send('hello')
    } catch (e) {
        return res.status(500).send(e.message)
    }
    
});

router.get('/', inferController.getAllResult);

router.get('/image', imageController.getImage)

module.exports = router;