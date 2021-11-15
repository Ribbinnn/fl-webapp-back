const Joi = require("joi"); 
const webModel = require('../models/webapp')

const schema = {
    report_id: Joi.string().required(),
    data: Joi.array().items(Joi.object()),
    user_id: Joi.string()
};

const validator = Joi.object(schema);

const insertBBox = async (req, res) => {
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: `Invalid input: ${(validatedResult.error.message)}`})
    }
    try {
        await Promise.all(req.body.data.map(async (item) => {
            await webModel.Mask.create({
                result_id: req.body.report_id,
                finding: item.finding,
                position: item,
                user_id: req.body.user_id
            })
        }))
        return res.status(200).json({
            success: true, 
            message: 'Insert all bounding boxes successfully', 
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getBBox = async (req, res) => {
    try {
        const data = await webModel.Mask.find({result_id: req.params.report_id})
        return res.status(200).json({
            success: true, 
            message: 'Get all bounding boxes successfully', 
            data
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    insertBBox,
    getBBox
}