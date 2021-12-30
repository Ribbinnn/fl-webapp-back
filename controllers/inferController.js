const Joi = require("joi");
const webModel = require('../models/webapp');
const PACS = require('../db/pacs').PACS
const path = require('path');
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data');
const extract = require('extract-zip')
const dotenv = require('dotenv')
const { modelStatus } = require('../utils/status')
// let con1 = require('../db/webapp')
dotenv.config()

const imageSchema = {
    project_id: Joi.string().required(),
    accession_no: Joi.string().required(),
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
    if (!req.body.user_id) {
        return res.status(400).json({ success: false, message: `Invalid input: "user_id" is required` })
    }

    // mock-up
    // get filepath (from PACS) by accession no
    let pacs = {}
    let project = {}
    try {
        pacs = await PACS.findOne({ 'Accession No': req.body.accession_no })
        project = await webModel.Project.findById(req.body.project_id)
        if (!pacs)
            return res.status(400).json({ success: false, message: 'File not found' });
        if (!project)
            return res.status(400).json({ success: false, message: 'Project not found' });
    } catch {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }

    // define directory path and AI server url
    filename = pacs.filepath.split('/')[1]
    const root = path.join(__dirname, "..");
    const projectDir = path.join(root, "/resources/results/", project.id)
    const resultDir = path.join(projectDir, filename.split('.')[0])
    const url = process.env.PY_SERVER + '/api/infer';

    try {
        // project's requirements
        const requirements = [
            { name: "entry_id", type: "number", unit: "none" },
            { name: "hn", type: "number", unit: "none" },
            { name: "gender", type: "string", unit: "male/female" },
            { name: "age", type: "number", unit: "year" },
            { name: "measured_time", type: "object", unit: "yyyy-MM-ddTHH:mm:ssZ" },
            ...project.requirements
        ]

        // record can be null (might be changed in the future)
        if (!req.body.record)
            throw new Error(`Invalid record input: "record" is required`)
        // check required fields
        requirements.forEach((requirement) => {
            const fieldName = requirement.name
            if (!req.body.record[fieldName])
                throw new Error(`Invalid record input: "${fieldName}" is required`)
            // check fields' type
            if (typeof (req.body.record[fieldName]) !== requirement.type && fieldName !== "measured_time")
                throw new Error(`Invalid record input: "${fieldName}" must be a ${requirement.type}`)
            if (fieldName == "measured_time" && new Date(req.body.record[fieldName]) == "Invalid Date")
                throw new Error(`Invalid record input: Incorrect "${fieldName}" date format`)
        })
        // create record
        record = await webModel.MedRecord.create({
            project_id: req.body.project_id,
            record: req.body.record
        })

        // create image
        const image = await webModel.Image.create({
            project_id: req.body.project_id,
            accession_no: req.body.accession_no,
            hn: req.body.record.hn
        })

        // create predicted result referenced to image and record    
        const predResult = await webModel.PredResult.create({
            record_id: record ? record._id : undefined,
            image_id: image._id,
            project_id: project._id,
            status: modelStatus.IN_PROGRESS,
            label: "",
            note: "",
            rating: 0,
            created_by: req.body.user_id,
            updated_by: undefined,
            hn: req.body.record.hn
        })

        // create predicted class and mask
        const predClass = await webModel.PredClass.create({ result_id: predResult._id, prediction: {} })
        const mask = await webModel.Mask.create({ result_id: predResult._id, data: [] })

        // create FormData to send to python server
        const data = new FormData()
        data.append('file', fs.createReadStream(root + '\\resources\\uploads\\' + filename))
        data.append('model_name', project.task)

        console.log('Start')

        // get result from python model
        axios.post(url, data, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            },
            responseType: 'arraybuffer'
        })
            .then(async res => {
                // make new directory if does not exist
                if (!fs.existsSync(projectDir)) {
                    fs.mkdirSync(projectDir);
                    fs.mkdirSync(resultDir);
                }
                if (!fs.existsSync(resultDir)) {
                    fs.mkdirSync(resultDir);
                }

                // save zip file sent from AI server
                fs.writeFile(resultDir + '/result.zip', res.data, (err) => {
                    if (err) throw err
                });

                // extract zip file to result directory (overlay files + prediction file)
                await extract(resultDir + '/result.zip', { dir: resultDir })

                // parse prediction.txt to JSON
                const modelResult = JSON.parse(fs.readFileSync(resultDir + '/prediction.txt'));

                let prediction = []
                switch (project.task) {
                    case "classification_pylon_256":
                    case "classification_pylon_1024":
                        for (let i = 0; i < modelResult["Finding"].length; i++) {
                            prediction.push({
                                finding: modelResult["Finding"][i],
                                confidence: modelResult["Confidence"][i],
                                selected: false
                            })
                        }
                        // delete zip file
                        await fs.promises.unlink(resultDir + '/result.zip')

                        // delete probability prediction file
                        await fs.promises.unlink(resultDir + '/prediction.txt')

                        // delete PACS file in local
                        if (!['0041018.dcm', '0041054.dcm', '0041099.dcm'].includes(filename)) {
                            await fs.promises.unlink(path.join(root, "/resources/uploads/", filename))
                        }

                        // iterate over files in result directory to get overlay files
                        fs.readdir(resultDir, async (err, files) => {
                            if (err) throw err
                            // create gradcam from each overlay file paths
                            await Promise.all(files.map(async (item, i) => {
                                await webModel.Gradcam.create({
                                    result_id: predResult._id,
                                    finding: item.split('.')[0],
                                    gradcam_path: `results/${project.id}/${filename.split('.')[0]}/${item}`
                                })
                            }))
                            // update result's status to annotated
                            await webModel.PredResult.findByIdAndUpdate(predResult._id, { status: modelStatus.AI_ANNOTATED })
                            // update probability prediction
                            await webModel.PredClass.findByIdAndUpdate(predClass._id, { prediction: prediction })
                            console.log('Finish')
                        })
                        break;
                    case "covid19_admission":
                        prediction = modelResult
                        fs.rm(resultDir, { recursive: true, force: true }, (err) => {
                            if (err) throw err
                        });
                        await webModel.PredResult.findByIdAndUpdate(predResult._id, { status: modelStatus.AI_ANNOTATED })
                        await webModel.PredClass.findByIdAndUpdate(predClass._id, { prediction: prediction })
                        console.log('Finish')
                        break;
                    default:
                        break;
                }
            }).catch(async e => {
                // if AI server send an error, then change result's status to canceled
                await webModel.PredResult.findByIdAndUpdate(predResult._id, { status: modelStatus.CANCELED })
                console.log(e.message)
            })

        return res.status(200).json({ success: true, message: `Start inference` })
    } catch (e) {
        if (e.message.includes('Invalid record input'))
            return res.status(400).json({ success: false, message: e.message });

        // delete result folder if error occurs
        if (!['0041018.dcm', '0041054.dcm', '0041099.dcm'].includes(filename) && fs.existsSync(resultDir)) {
            fs.rm(resultDir, { recursive: true, force: true }, (err) => {
                console.log(err)
            });
        }
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

const getAllResult = async (req, res) => {
    try {
        const data = await webModel.PredClass.find().populate('result_id');
        // console.log(data)

        return res.status(200).json({ success: true, message: 'Get all predicted classes successfully', data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

module.exports = {
    inferResult,
}
