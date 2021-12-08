const Joi = require("joi"); 
const webModel = require('../models/webapp')

const schema = {
    report_id: Joi.string().required(),
    data: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        tool: Joi.string().required(),
        updated_by: Joi.string().required(),
        data: Joi.object().required(),
    })),
};

const validator = Joi.object(schema);

const insertBBox = async (req, res) => {
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: `Invalid input: ${(validatedResult.error.message)}`})
    }
    try {
        const mask = await webModel.Mask.findOneAndUpdate({result_id: req.body.report_id},{
            data: req.body.data
        })
        return res.status(200).json({
            success: true, 
            message: `Insert all bounding boxes to report id ${req.body.report_id} successfully`, 
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getBBox = async (req, res) => {
    try {
        const data = await webModel.Mask.findOne({result_id: req.params.report_id})
        return res.status(200).json({
            success: true, 
            message: `Get all bounding boxes by report id ${req.params.report_id} successfully`, 
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