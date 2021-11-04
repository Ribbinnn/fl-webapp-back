const Joi = require("joi");
const webModel = require('../models/webapp');
const PACS = require('../db/pacs').PACS
const path = require('path');
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data');
const extract = require('extract-zip')

const imageSchema = {
    project_id: Joi.string().required(),
    accession_no: Joi.string().required(),
    filetype: Joi.string(),
};
const imageValidator = Joi.object(imageSchema);

const inferResult = async (req, res) => {

    // validate input
    const validatedImage = imageValidator.validate({ 
        project_id: req.body.project_id, 
        accession_no: req.body.accession_no
    })
    if (validatedImage.error) {
        return res.status(400).json({ success: false, message: `Invalid image input: ${(validatedImage.error.message)}` })
    }
    if (!req.body.clinician_id) {
        return res.status(400).json({ success: false, message: `Invalid input: "clinician_id" is required` })
    }

    const root = path.join(__dirname, "..");
    const url = "http://localhost:7000/api/infer";

    // get filepath (from PACS) by accession no
    let pacs = {}
    try {
        pacs = await PACS.findOne({'Accession No': req.body.accession_no})
        if (!pacs) {
            return res.status(200).json({ success: false, message: 'File not found' });
        }
    } catch {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    filename = pacs.filepath.split('/')[1]

    const resultDir = path.join(root, "/resources/results/", filename.split('.')[0])

    try {
        // get project's requirements
        const project = await webModel.Project.findById(req.body.project_id)
        const requirements = [
            {name: "entry_id", type: "string"}, 
            {name: "hn", type: "number"}, 
            {name: "gender", type: "string"}, 
            {name: "age", type: "string"}, 
            {name: "measured_time", type: "object"},
            ...project.requirements
        ]

        // record can be null (might be changed in the future)
        let record = ""
        if(req.body.record) {
            // check required fields
            requirements.forEach((item) => {
                if (!req.body.record[item.name]) 
                    throw new Error(`Invalid record input: "${item.name}" is required`)
                // check fields' type
                // if (typeof(req.body.record[item.name])!==item.type) 
                //     throw new Error(`Invalid record input: "${item.name}" must be a ${item.type}`)
            })
            // create record
            record = await webModel.MedRecord.create({ 
                project_id: req.body.project_id, 
                record: req.body.record 
            })
        }

        // create image
        const image = await webModel.Image.create({ 
            project_id: req.body.project_id, 
            accession_no: req.body.accession_no
        })

        // create predicted result referenced to image and record    
        const result = await webModel.PredResult.create({ 
            record_id: record? record._id: undefined,
            image_id: image._id, 
            status: "in progress", 
            label: "",
            note: "",
            clinician_id: req.body.clinician_id
        })

        // create predicted classes
        const predClass = await webModel.PredClass.create({result_id: result._id, prediction: {}})

        // create FormData to send to python server
        const data = new FormData() 
        data.append('file', fs.createReadStream(root + '\\resources\\uploads\\' + filename))
        data.append('model_name', project.task)

        console.log('Start')
        // console.log(data)

        // get result from python model
        axios.post(url, data, { 
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            },
            responseType: 'arraybuffer'
        })
        .then(async res => { 
            // make new directory if does not exist
            if (!fs.existsSync(resultDir)){
                fs.mkdirSync(resultDir);
            }

            // save zip file
            fs.writeFile(resultDir + '/result.zip', res.data, (err) => {
                if (err) throw err
            });

            // extract zip file and get probability prediction + overlay files
            await extract(resultDir + '/result.zip', { dir: resultDir })
            const prediction = JSON.parse(fs.readFileSync(resultDir + '/prediction.txt'));

            // delete zip file
            fs.unlink(resultDir + '/result.zip', (err) => {
                if (err) throw err
            })

            // delete probability prediction file
            fs.unlink(resultDir + '/prediction.txt', (err) => {
                if (err) throw err
            })

            // delete PACS file in local
            if (!['0041018.dcm', '0041054.dcm', '0041099.dcm'].includes(filename)) {
                fs.unlink(path.join(root, "/resources/uploads/", filename), (err) => {
                    if (err) throw err
                })
            }

            // create gradcam and change predicted result's status to annotated in database
            fs.readdir(resultDir, async (err, files) => {
                if(err) throw err
                await Promise.all(files.map( async (item, i) => {
                    await webModel.Gradcam.create({
                        result_id: result._id,
                        finding: item.split('.')[0],
                        gradcam_path: `results/${filename.split('.')[0]}/${item}`
                    })
                }))
                await webModel.PredResult.findByIdAndUpdate(result._id, {status:"annotated"})
                await webModel.PredClass.findByIdAndUpdate(predClass._id, {prediction: prediction})
                console.log('Finish')
            })
        }).catch(e => {
            // console.log((e.response.data).toString())
            console.log(e)
        })

        return res.status(200).json({ success: true, message: `Start inference` })
    } catch (e) {
        console.log(e.message)
        if (e.message.includes('Invalid record input'))
            return res.status(400).json({ success: false, message: e.message });
        
        // delete result folder if error occurs
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
