const Joi = require("joi");
const webModel = require('../models/webapp');
const path = require('path');
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data');
const extract = require('extract-zip')

/* Validate Record */

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

const inferResult = async (req, res) => {

    const validatedImage = imageValidator.validate({ 
        project_id: req.body.project_id, 
        filepath: req.file.filename, 
        filetype: req.file.mimetype 
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
    const resultDir = path.join(root, "/resources/results/", req.file.filename.split('.')[0])
    const url = "http://localhost:7000/api/infer";

    try {
        const project = await webModel.Project.findById(req.body.project_id)

        console.log('Start')
        const image = await webModel.Image.create({ 
            project_id: req.body.project_id, 
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
            label: "",
            note: "",
            clinician_id: req.body.clinician_id
        })

        const predClass = await webModel.PredClass.create({result_id: result._id, prediction: {}})

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
            if (!fs.existsSync(resultDir)){
                fs.mkdirSync(resultDir);
            }
            fs.writeFile(resultDir + '/result.zip', res.data, (err) => {
                if (err) throw err
            });
            await extract(resultDir + '/result.zip', { dir: resultDir })

            const prediction = JSON.parse(fs.readFileSync(resultDir + '/prediction.txt'));

            fs.unlink(resultDir + '/result.zip', (err) => {
                if (err) throw err
            })

            fs.unlink(resultDir + '/prediction.txt', (err) => {
                if (err) throw err
            })

            fs.readdir(resultDir, async (err, files) => {
                if(err) throw err
                await Promise.all(files.map( async (item, i) => {
                    await webModel.Gradcam.create({
                        result_id: result._id,
                        finding: item.split('.')[0],
                        gradcam_path: `results/${req.file.filename.split('.')[0]}/${item}`
                    })
                }))
                await webModel.PredResult.findByIdAndUpdate(result._id, {status:"annotated"})
                await webModel.PredClass.findByIdAndUpdate(predClass._id, {prediction: prediction})
                console.log('Finish')
            })
        }).catch(e => {
            throw e
        })

        return res.status(200).json({ success: true, message: `Start inference` })
    } catch (e) {
        if (fs.existsSync(resultDir)){
            fs.rm(resultDir, { recursive: true, force: true }, (err) => {
                console.log(err)
            });
        }
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

module.exports = {
    inferResult,
    getAllResult
}
