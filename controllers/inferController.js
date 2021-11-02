const Joi = require("joi");
const webModel = require('../models/webapp');
const path = require('path');
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data');
const extract = require('extract-zip')

const imageSchema = {
    project_id: Joi.string().required(),
    filepath: Joi.string().required(),
    filetype: Joi.string().valid('application/octet-stream', 'application/dicom', 'image/png').required(),
};

const recordSchema = {
    // project_id: Joi.string().required(),
    project_id: Joi.string(),
    record: Joi.object()
};

const imageValidator = Joi.object(imageSchema);
const recordValidator = Joi.object(recordSchema)

const createResult = async (req, res) => {

    /*
    req body:
    {
        file (dicom/png),
        record (object),
        project id
    }
    */

    const validatedImage = imageValidator.validate({ 
        project_id: req.body.project_id?? "617978ad0fc7ab3ebbba2db4", 
        filepath: req.file? req.file.filename: undefined, 
        filetype: req.file? req.file.mimetype: undefined 
    })
    if (validatedImage.error) {
        return res.status(400).json({ success: false, message: `Invalid image input: ${(validatedImage.error.message)}` })
    }
    const validatedRecord = recordValidator.validate({ 
        project_id: req.body.project_id, 
        record: req.body.record 
    })
    if (validatedRecord.error) {
        console.log(validatedRecord.error.message)
        return res.status(400).json({ success: false, message: `Invalid record input: ${(validatedRecord.error.message)}` })
    }
    if (!req.body.clinician_id) {
        return res.status(400).json({ success: false, message: `Invalid input: "clinician_id" is required` })
    }

    const root = path.join(__dirname, "..");
    const resDir = path.join(root, "/resources/results/", req.file.filename.split('.')[0])
    const url = "http://localhost:7000/api/infer";

    try {
        console.log('Start')
        const image = await webModel.Image.create({ 
            project_id: req.body.project_id?? "617978ad0fc7ab3ebbba2db4", 
            filepath: 'uploads/' + req.file.filename, 
            filetype: req.file.mimetype 
        })

        let record = ""
        if(req.body.record) {
            record = await webModel.MedRecord.create({ 
                project_id: req.body.project_id, 
                record: req.body.record 
            })
        }
            
        const result = await webModel.PredResult.create({ 
            record_id: record? record._id: undefined,
            image_id: image._id, 
            status: "in progress", 
            label: {},
            note: ""
        })

        const predClass = await webModel.PredClass.create({result_id: result._id, prediction: {}})

        const project = await webModel.Project.findById(req.body.project_id)

        const data = new FormData() 
        data.append('file', fs.createReadStream(root + '\\resources\\uploads\\' + req.file.filename))
        data.append('model_name', project.task)

        axios.post(url, data, { // receive two parameter endpoint url ,form data 
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            },
            responseType: 'arraybuffer'
        })
        .then(async res => { // then print response status
            if (!fs.existsSync(resDir)){
                fs.mkdirSync(resDir);
            }
            fs.writeFile(resDir + '/result.zip', res.data, (err) => {
                if (err) throw err
            });
            await extract(resDir + '/result.zip', { dir: resDir })

            const prediction = JSON.parse(fs.readFileSync(resDir + '/prediction.txt'));

            await webModel.PredResult.findByIdAndUpdate(result._id, {status:"annotated"})
            await webModel.PredClass.findByIdAndUpdate(predClass._id, {prediction: prediction})
            console.log('Finish')
        }).catch(e => {
            throw e
        })

        return res.status(200).json({ success: true, message: `Start inference` })
    } catch (e) {
        if (fs.existsSync(resDir)){
            fs.rm(resDir, { recursive: true, force: true }, (err) => {
                console.log(err)
            });
        }
        console.log(e.message)
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getAllResult = async (req, res) => {
    try {
        const data = await webModel.PredClass.find().populate('result_id');
        // console.log(data)

        return res.status(200).json({ success: true, message: 'Get all predicted classes successfully', data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getImage = async (req, res) => {
    try {
        const root = path.join(__dirname, "..");

        const mask = await webModel.Mask.findOne({ res_id: req.query.res_id, finding: req.query.finding })

        let fullPath = path.join(root, "/resources/results/", mask.filename);
        let imageAsBase64 = fs.readFileSync(fullPath, 'base64');
        res.send('data:image/png;base64,' + imageAsBase64)
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    createResult,
    getAllResult,
    getImage
}
