const Joi = require("joi");
const webModel = require('../models/webapp')
const path = require('path');
const fs = require('fs')

const schema = {
    result_id: Joi.string().required(),
    finding: Joi.string().required()
};

const validator = Joi.object(schema);

const getImage = async (req, res) => {
    console.log(req.query)
    const validatedResult = validator.validate({ result_id: req.query.result_id, finding: req.query.finding })
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid query: ${(validatedImage.error.message)}` })
    }
    try {
        console.log({ result_id: req.query.result_id, finding: req.query.finding })
        const gradcam = await webModel.Gradcam
            .findOne({ result_id: req.query.result_id, finding: req.query.finding })
            .populate({
                path: 'result_id',
                populate: {
                    path: 'image_id'
                }
            })

        console.log(gradcam)
        if(!gradcam){
            return res.status(200).json({ success: false, message: 'no data' });
        }

        // const filename = gradcam.result_id.image_id.filename
        // const filetype = gradcam.result_id.image_id.filetype

        // const spawn = child_process.spawn;

        const root = path.join(__dirname, "..")
        // const pypath = path.join(root, "/python_model/pylon/overlay.py");
        // console.log(gradcam.gradcam)
        // const gradcam_filename = filename.split('.')[0] + '.txt'
        // let tmppath = path.join(root, "/resources/temp/", gradcam_filename);
        // fs.writeFile(tmppath, `{"Segmentation": ${JSON.stringify(gradcam.gradcam)} }`, function (err) {
        //     if (err)
        //         throw err;
        //     console.log('Saved!');
        // });

        // console.log(filename, root, filetype, gradcam_filename, gradcam.finding)

        // const process = spawn('python', [pypath, filename, root, filetype, gradcam_filename, gradcam.finding]);

        // process.stderr.on('data', async (data) => {
        //     console.log(data.toString())
        // })

        // process.stdout.on('data', async (data) => {

        //     // console.log(data.toString())
        //     console.log(data.toString())
        //     let imageAsBase64 = fs.readFileSync(tmppath, 'base64');
        //     // res.writeHead([
        //     //     ['Content-Type',  'image/png']
        //     // ]);
        //     const res_filename = `${filename.split('.')[0]}(${gradcam.finding}).png`
        //     let respath = path.join(root, "/resources/results/", res_filename);
        //     // res.writeHead(200, [
        //     //     ['Content-Type',  'image/png']
        //     // ]);
        //     // return res.end(imageAsBase64)
        //     return res.sendFile(respath)
        //     // fs.unlink(respath, (err) => {
        //     //     if (err) console.log(err)
        //     // })
        // });

        res_path = path.join(root, "/resources/", gradcam.gradcam_path)
        console.log(res_path)
        let imageAsBase64 = fs.readFileSync(res_path, 'base64');
        return res.status(200).send('data:image/png;base64,' + imageAsBase64)
        
        // return res.sendFile(path.join(root, "/resources/", gradcam.gradcam_path))

    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

module.exports = {
    getImage
}