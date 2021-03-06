const Joi = require("joi");
const webModel = require('../models/webapp');
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
    user_id: Joi.string().required(),
    record: Joi.object().required()
};

const imageValidator = Joi.object(imageSchema);

const inferResult = async (req, res) => {

    // validate input
    const validatedImage = imageValidator.validate({
        project_id: req.body.project_id,
        accession_no: req.body.accession_no,
        user_id: req.body.user_id,
        record: req.body.record
    })
    if (validatedImage.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedImage.error.message)}` })
    }

    const todayYear = String((new Date()).getUTCFullYear())
    const todayMonth = String((new Date()).getUTCMonth() + 1)

    // get filepath (from PACS) by accession no
    let pacs = {}
    let project = {}
    try {
        project = (await webModel.Project.findById(req.body.project_id)).toObject()
        if (!project)
            return res.status(400).json({ success: false, message: 'Project not found' });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }

    // project's requirements
    const requirements = [
        { name: "entry_id", type: "number", unit: "none", required: true },
        { name: "hn", type: "number", unit: "none", required: true },
        { name: "gender", type: "string", unit: "male/female", required: true },
        { name: "age", type: "number", unit: "year", required: true },
        { name: "measured_time", type: "object", unit: "YYYY-MM-DD HH:mm", required: true },
        ...project.requirements
    ]

    // check required fields
    for (const requirement of requirements) {
        const fieldName = requirement.name
        if ((req.body.record[fieldName] === undefined || req.body.record[fieldName] === null) && !requirement.required) {
            req.body.record[fieldName] = null
            continue
        }
        if (!req.body.record[fieldName] && requirement.required)
            return res.status(400).json({ success: false, message: `Invalid record input: "${fieldName}" is required` })
        // check fields' type
        if (typeof (req.body.record[fieldName]) !== requirement.type && fieldName !== "measured_time")
            return res.status(400).json({ success: false, message: `Invalid record input: "${fieldName}" must be a ${requirement.type}` })
        if (fieldName == "measured_time" && new Date(req.body.record[fieldName]) == "Invalid Date")
            return res.status(400).json({ success: false, message: `Invalid record input: Incorrect "${fieldName}" date format` })
    }

    let predResult = {}
    try {
        // create predicted result
        predResult = await webModel.PredResult.create({})
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }

    // define directory path and AI server url
    const root = path.join(__dirname, "..");
    const projectDir = path.join(root, "/resources/results/", todayYear, todayMonth)
    const resultDir = path.join(projectDir, predResult.id)
    const url = process.env.PY_SERVER + '/api/infer';

    try {
        // create record
        const record = await webModel.MedRecord.create({
            project_id: req.body.project_id,
            record: req.body.record
        })

        // create image
        const image = await webModel.Image.create({
            project_id: req.body.project_id,
            accession_no: req.body.accession_no,
            hn: req.body.record.hn
        })

        // update predicted result referenced to image and record
        await webModel.PredResult.findByIdAndUpdate(predResult._id, {
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

        let reqRecord = req.body.record
        delete reqRecord.hn
        delete reqRecord.entry_id
        delete reqRecord.measured_time
        // console.log(reqRecord)

        console.log('Start Inference')

        // get result from python model
        axios.post(url, {
            'model_name': project.task,
            'acc_no': String(req.body.accession_no),
            'record': JSON.stringify(reqRecord)
        }, { responseType: 'arraybuffer' })
            .then(async res => {
                // make new directory if does not exist
                if (!fs.existsSync(resultDir)) {
                    fs.mkdirSync(resultDir, { recursive: true });
                }

                // save zip file sent from AI server
                fs.writeFileSync(path.join(resultDir, '/result.zip'), res.data);

                // extract zip file to result directory (overlay files + prediction file)
                await extract(path.join(resultDir, '/result.zip'), { dir: resultDir })

                // parse prediction.txt to JSON
                let modelResult = JSON.parse(fs.readFileSync(path.join(resultDir, '/prediction.txt')));

                patient_name = "-"
                if (modelResult.patient_name)
                    patient_name = modelResult.patient_name
                delete modelResult.patient_name

                // zip file received from python includes:
                // 1. prediction.txt (JSON format consisted of Finding, Confidence, Threshold, and isPositive)
                // 2. original.png (original dicom file in png format)
                // 3. gradcam/heatmap (any png file that is not original.png)
                let prediction = []
                for (let i = 0; i < modelResult["Finding"].length; i++) {
                    prediction.push({
                        finding: modelResult["Finding"][i],
                        confidence: modelResult["Confidence"][i],
                        threshold: modelResult["Threshold"][i],
                        isPositive: modelResult["isPositive"][i],
                        selected: false
                    })
                }

                // delete zip file
                await fs.promises.unlink(path.join(resultDir, '/result.zip'))

                // delete probability prediction file
                await fs.promises.unlink(path.join(resultDir, '/prediction.txt'))

                // iterate over files in result directory to get gradcam/heatmap files
                fs.readdir(resultDir, async (err, files) => {
                    if (err) throw err
                    // create gradcam in database from each gradcam file paths
                    await Promise.all(files.map(async (item, i) => {
                        await webModel.Gradcam.create({
                            result_id: predResult._id,
                            finding: item.split('.')[0],
                            gradcam_path: `results/${todayYear}/${todayMonth}/${String(predResult._id)}/${item}`
                        })
                    }))
                    // update result's status to annotated
                    await webModel.PredResult.findByIdAndUpdate(predResult._id, {
                        status: modelStatus.AI_ANNOTATED,
                        patient_name
                    })
                    // update probability prediction
                    await webModel.PredClass.findByIdAndUpdate(predClass._id, { prediction: prediction })
                    console.log('Finish Saving Gradcam')
                })
                console.log('Finish Inference')
            }).catch(async e => {
                // if AI server send an error, then change result's status to canceled
                await webModel.PredResult.findByIdAndUpdate(predResult._id, { status: modelStatus.CANCELED })
                // delete result folder if error occurs
                if (fs.existsSync(resultDir)) {
                    fs.rm(resultDir, { recursive: true, force: true }, (err) => {
                        console.log(err)
                    });
                }
                console.log(e.message, e.response?.data.toString())
                // const errMsg = e.message.includes('status code 500')? `Model Error: ${e.response?.data.toString()}`: e.message
            })

        return res.status(200).json({ success: true, message: `Start inference` })
    } catch (e) {
        // delete result folder if error occurs
        if (fs.existsSync(resultDir)) {
            fs.rm(resultDir, { recursive: true, force: true }, (err) => {
                console.log(err);
            });
        }
        await webModel.PredResult.findByIdAndUpdate(predResult._id, { status: modelStatus.CANCELED });
        console.log(e.message);
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

// infer many CXR
const batchInfer = async (req, res) => {
    // req.body.dicom_info_list, req.body.user_id, req.body.project_id
    const todayYear = String((new Date()).getUTCFullYear())
    const todayMonth = String((new Date()).getUTCMonth() + 1)

    // get filepath (from PACS) by accession no
    let project = {}
    try {
        project = await webModel.Project.findById(req.body.project_id)
        if (!project)
            return res.status(400).json({ success: false, message: 'Project not found' });
        if (typeof (project.requirements) == 'object' && project.requirements.length !== 0)
            return res.status(400).json({ success: false, message: `Project ${project._id} requires medical record` });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }

    let predResults = []
    try {
        await Promise.all(req.body.dicom_info_list.map(async dcm_info => {
            // project's requirements
            const requirements = [
                { name: "entry_id", type: "number", unit: "none", required: true },
                { name: "hn", type: "number", unit: "none", required: true },
                { name: "gender", type: "string", unit: "male/female", required: true },
                { name: "age", type: "number", unit: "year", required: true },
                { name: "measured_time", type: "object", unit: "YYYY-MM-DD HH:mm", required: true }
            ]

            // check required fields
            for (const requirement of requirements) {
                const fieldName = requirement.name
                if (fieldName == 'hn' && !dcm_info.record[fieldName])
                    return res.status(400).json({ success: false, message: `Invalid record input: "${fieldName}" is required` })
                if (dcm_info.record && dcm_info.record[fieldName]) {
                    if (typeof (dcm_info.record[fieldName]) !== requirement.type && fieldName !== "measured_time")
                        return res.status(400).json({ success: false, message: `Invalid record input: "${fieldName}" must be a ${requirement.type}` })
                    if (fieldName == "measured_time" && new Date(dcm_info.record[fieldName]) == "Invalid Date")
                        return res.status(400).json({ success: false, message: `Invalid record input: Incorrect "${fieldName}" date format` })
                }
            }

            let predResult = {}
            predResult = await webModel.PredResult.create({})

            // create record
            const record = await webModel.MedRecord.create({
                project_id: req.body.project_id,
                record: dcm_info.record
            })

            // create image
            const image = await webModel.Image.create({
                project_id: req.body.project_id,
                accession_no: dcm_info.accession_no,
                hn: dcm_info.record.hn
            })

            // update predicted result referenced to image and record
            await webModel.PredResult.findByIdAndUpdate(predResult._id, {
                record_id: record ? record._id : undefined,
                image_id: image._id,
                project_id: project._id,
                status: modelStatus.WAITING,
                label: "",
                note: "",
                rating: 0,
                created_by: req.body.user_id,
                updated_by: undefined,
                hn: dcm_info.record.hn
            })
            predResults.push({
                result_id: predResult._id,
                accession_no: dcm_info.accession_no
            })
        }))
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }

    const inferPromise = async () => {
        // const groupSize = process.env.GROUP_SIZE
        // const groupCount = Math.ceil(predResults.length / groupSize)
        // let predResultGroups = []
        // for (let i = 0; i < groupCount; i++) {
        //     let group = []
        //     for (let j = 0; j < groupSize; j++) {
        //         if (!predResults[i * groupSize + j]) break
        //         group.push(predResults[i * groupSize + j])
        //     }
        //     predResultGroups.push(group)
        // }
        const startTime = new Date()
        console.log('Start Batch Inference')

        // infer all of selected images
        for (let result of predResults) {
            const root = path.join(__dirname, "..");
            const projectDir = path.join(root, "/resources/results/", todayYear, todayMonth)
            const resultDir = path.join(projectDir, String(result.result_id))
            const url = process.env.PY_SERVER + '/api/infer';
            try {
                await webModel.PredResult.findByIdAndUpdate(result.result_id, { status: modelStatus.IN_PROGRESS })

                // create predicted class and mask
                const predClass = await webModel.PredClass.create({ result_id: result.result_id, prediction: {} })
                const mask = await webModel.Mask.create({ result_id: result.result_id, data: [] })

                // get result from python model
                const res = await axios.post(url, {
                    'model_name': project.task,
                    'acc_no': String(result.accession_no),
                    'record': '{}'
                }, { responseType: 'arraybuffer' })

                // make new directory if does not exist
                if (!fs.existsSync(resultDir)) {
                    fs.mkdirSync(resultDir, { recursive: true });
                }

                // save zip file sent from AI server
                await fs.promises.writeFile(path.join(resultDir, '/result.zip'), res.data);

                // extract zip file to result directory (overlay files + prediction file)
                await extract(path.join(resultDir, '/result.zip'), { dir: resultDir })

                // parse prediction.txt to JSON
                let modelResult = JSON.parse(await fs.promises.readFile(path.join(resultDir, '/prediction.txt')));

                patient_name = "-"
                if (modelResult.patient_name)
                    patient_name = modelResult.patient_name
                delete modelResult.patient_name

                let prediction = []

                for (let i = 0; i < modelResult["Finding"].length; i++) {
                    prediction.push({
                        finding: modelResult["Finding"][i],
                        confidence: modelResult["Confidence"][i],
                        threshold: modelResult["Threshold"][i],
                        isPositive: modelResult["isPositive"][i],
                        selected: false
                    })
                }
                // delete zip file
                await fs.promises.unlink(path.join(resultDir, '/result.zip'))

                // delete probability prediction file
                await fs.promises.unlink(path.join(resultDir, '/prediction.txt'))

                const files = await fs.promises.readdir(resultDir)
                // iterate over files in result directory to get overlay files
                // create gradcam from each overlay file paths
                await Promise.all(files.map(async (item, i) => {
                    await webModel.Gradcam.create({
                        result_id: result.result_id,
                        finding: item.split('.')[0],
                        gradcam_path: `results/${todayYear}/${todayMonth}/${String(result.result_id)}/${item}`
                    })
                }))
                // update result's status to annotated
                await webModel.PredResult.findByIdAndUpdate(result.result_id, {
                    status: modelStatus.AI_ANNOTATED,
                    patient_name
                })
                // update probability prediction
                await webModel.PredClass.findByIdAndUpdate(predClass._id, { prediction: prediction })

            } catch (e) {
                console.log(`[Error: ${result.result_id}] ${e.message}`)
                await webModel.PredResult.findByIdAndUpdate(result.result_id, { status: modelStatus.CANCELED })
                // delete result folder if error occurs
                if (fs.existsSync(resultDir)) {
                    fs.rm(resultDir, { recursive: true, force: true }, (err) => {
                        console.log(err)
                    });
                }
            }

        }
        console.log(`Time: ${(new Date() - startTime) / 1000}s`)
    }

    inferPromise().then(r => {
        console.log(`Finish Batch Inference`)
    }).catch(e => {
        console.log(e.message)
    })

    return res.status(200).json({ success: true, message: `Start batch inference` })
}

module.exports = {
    inferResult,
    batchInfer
}