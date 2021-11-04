const Joi = require("joi");
const webModel = require('../models/webapp')
const path = require('path');

const schema = {
    result_id: Joi.string().required(),
    finding: Joi.string().required()
};

const validator = Joi.object(schema);

const getImage = async (req, res) => {
    const validatedResult = validator.validate({ result_id: req.query.result_id, finding: req.query.finding })
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid query: ${(validatedImage.error.message)}` })
    }
    try {
        const root = path.join(__dirname, "..")
        // console.log({ result_id: req.query.result_id, finding: req.query.finding })
        if (req.query.finding === 'original') {
            const predRes = await webModel.PredResult.findById(req.query.result_id).populate('image_id')

            resPath = path.join(root, "/resources/", predRes.image_id.filepath)
            return res.status(200).sendFile(resPath)
        }
        const gradcam = await webModel.Gradcam
            .findOne({ result_id: req.query.result_id, finding: req.query.finding })
            .populate({
                path: 'result_id',
                populate: {
                    path: 'image_id'
                }
            })

        if(!gradcam){
            return res.status(200).json({ success: false, message: 'no data' });
        }

        resPath = path.join(root, "/resources/", gradcam.gradcam_path)
        // console.log(resPath)
        // let imageAsBase64 = fs.readFileSync(resPath, 'base64');
        return res.status(200).sendFile(resPath)

    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

module.exports = {
    getImage
}