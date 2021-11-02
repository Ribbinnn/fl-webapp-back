const Joi = require("joi");
const webModel = require('../models/webapp');
const path = require('path');
const child_process = require('child_process')
const fs = require('fs')

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

    // const image = await webModel.Image.create({
    //     project_id: req.body.project_id,
    //     filename: req.file.filename,
    //     filetype: req.file.mimetype
    // })

    // let pred = await webModel.PredResult.create({ image_id: image._id, status: "in process", result: {} })

    // const spawn = child_process.spawn;

    // const root = path.join(__dirname, "..");
    // const pypath = path.join(root, "/python_model/pylon/pylon.py");

    // console.log(req.file.filename, root, req.file.mimetype)

    // var data = JSON.parse(fs.readFileSync('./resources/temp/segmentation.txt'));

    // // console.log(data.segmentation[0])

    // const process = spawn('python', [pypath, req.file.filename, root, req.file.mimetype]);

    // process.stderr.on('data', function (data) {
    //     console.log(data.toString())
    // })

    // process.stdout.on('data', async (data) => {

    //     // console.log(data.toString())
    //     let result = JSON.parse(data
    //         .toString()
    //         .trim()
    //         .replace(/'/g, '"')
    //         .replace(/True/g, "true")
    //         .replace(/False/g, "false")
    //     )
    //     // .replace(/'/g,"")
    //     // .replace(/\r/g,"")
    //     // .replace(/\n/g,"")
    //     // .slice(1,-1).split(" ")
    //     console.log(result)
    //     // const predResult = await webModel.PredResult.findByIdAndUpdate(pred._id, {status:"annotated",result})
    //     // await Promise.all(result.Finding.map(async (item, i) => {
    //     //     const filename = (req.file.filename).split('.')[0] + "(" + String(i) + ").png"
    //     //     await webModel.Mask.create({
    //     //         res_id:predResult.id,
    //     //         image_id:image.id,
    //     //         finding:item,
    //     //         filename:filename
    //     //     })
    //     // }))

    //     console.log('Finished')

    //     // await  webModel.Mask.create({res_id:predResult.id,image_id:image.id,finding:result.resultFile[1],filename:result.resultFile[0]})
    // });

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

        const root = path.join(__dirname, "..");
        const pypath = path.join(root, "/python_model/pylon/pylon.py");
        const newPath = path.join(root, "/resources/results/", req.file.filename.split('.')[0])

        if (!fs.existsSync(newPath)){
            fs.mkdirSync(newPath);
        }

        const spawn = child_process.spawn;
        const start = new Date()
        const process = spawn('python', [pypath, req.file.filename, root, req.file.mimetype]);

        process.stderr.on('data', async (data) => {
            // await webModel.PredResult.findByIdAndUpdate(result._id, {status:"canceled"})
            console.log(data.toString())
        })

        process.stdout.on('data', async (data) => {
            console.log((new Date())-start)
            // console.log(data.toString())
            // var a = new Date()
            // console.log(data
            //     .toString()
            //     .trim()
            //     .split('end')[0])
            console.log(data
                .toString()
                .trim()
                .split('end')[0])
            const prediction = JSON.parse(data
                .toString()
                .trim()
                .split('end')[1]
                .replace(/'/g, '"')
                .replace(/True/g, "true")
                .replace(/False/g, "false")
            )

            // const segmentation = JSON.parse(fs.readFileSync('./resources/temp/' + req.file.filename.split('.')[0] + '.txt'));

            await webModel.PredClass.findByIdAndUpdate(predClass._id, {prediction: prediction})

            fs.readdir(newPath, async (err, files) => {
                if(err) return
                await Promise.all(files.map( async (item, i) => {
                    console.log(i,item)
                    // const imageAsBase64 = fs.readFileSync(`${newPath}/${item}`, 'base64');
                    await webModel.Gradcam.create({
                        result_id: result._id,
                        finding: item.split('.')[0],
                        gradcam_path: `results/${req.file.filename.split('.')[0]}/${item}`
                    })
                }))

                await webModel.PredResult.findByIdAndUpdate(result._id, {status:"annotated"})

                // fs.rm(newPath, { recursive: true, force: true }, (err) => {
                //     console.log(err)
                // });
                
                console.log('Finish')
            })

            

            
            // await Promise.all(segmentation.Segmentation.map(async (item, i) => {
            //     await webModel.Gradcam.create({
            //         result_id: result._id,
            //         finding: prediction.Finding[i],
            //         gradcam: `${req.file.filename.split('.')[0]}/`
            //     })
            // }))

            // await webModel.PredResult.findByIdAndUpdate(result._id, {status:"annotated"})

            // fs.unlink('./resources/temp/' + req.file.filename.split('.')[0] + '.txt', (err) => {
            //     if (err) console.log(err)
            // })
            // console.log(((new Date()) - a)/1000)
            
            // await  webModel.Mask.create({res_id:predResult.id,image_id:image.id,finding:result.resultFile[1],filename:result.resultFile[0]})
        });
        return res.status(200).json({ success: true, message: `Start inference` })
    } catch (e) {
        console.log(e.message)
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
