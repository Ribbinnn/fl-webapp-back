const Joi = require("joi");
const webModel = require('../models/webapp')
const { modelStatus } = require('../utils/status')

const schema = {
    report_id: Joi.string().required(),
    data: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        tool: Joi.string().required(),
        updated_by: Joi.string().required(),
        data: Joi.object().required(),
        updated_time: Joi.date()
    })),
    mask_id: Joi.string(),
    dir: Joi.string()
};

const validator = Joi.object(schema);
const validatorLocal = Joi.object({ ...schema, report_id: Joi.string() });

const insertBBox = async (req, res) => {
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        const mask = await webModel.Mask.findOneAndUpdate({ result_id: req.body.report_id }, {
            data: req.body.data
        }, { new: true })
        await webModel.PredResult.findByIdAndUpdate(req.body.report_id, {
            status: modelStatus.HUMAN_ANNOTATED,
            updated_by: req.user._id
        })
        return res.status(200).json({
            success: true,
            message: `Insert all bounding boxes to report ${req.body.report_id} successfully`,
            data: mask
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

const getBBox = async (req, res) => {
    try {
        const mask = await webModel.Mask
            .findOne({ result_id: req.params.report_id })
            .populate({
                path: 'data.updated_by',
                select: 'username first_name last_name'
            });
        const user = await webModel.User.findById(req.user._id, ['first_name', 'last_name'])
        let data = mask.toObject()
        data.user = user

        return res.status(200).json({
            success: true,
            message: `Get all bounding boxes by report ${req.params.report_id} successfully`,
            data
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

const insertBBoxLocal = async (req, res) => {
    // req.body.mask_id
    const validatedResult = validatorLocal.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        const mask = await webModel.Mask.findOneAndUpdate({ _id: req.body.mask_id }, {
            data: req.body.data
        }, { new: true })

        return res.status(200).json({
            success: true,
            message: `Insert bounding boxes ${req.body.mask_id} successfully`,
            data: mask
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

const getBBoxLocal = async (req, res) => {
    // req.query.accession_no , req.query.project_id, req.query.HN
    try {
        let mask = ""
        mask = await webModel.Mask.findOne({ accession_no: req.query.accession_no })
        if (!mask) {
            mask = await webModel.Mask.create({ data: [], accession_no: req.query.accession_no })
        }
        mask = await webModel.Mask.findOne({ accession_no: req.query.accession_no }).populate({
            path: 'data.updated_by',
            select: 'username first_name last_name'
        });
        const user = await webModel.User.findById(req.user._id, ['first_name', 'last_name'])
        const data = mask.toObject()
        data.user = user

        return res.status(200).json({
            success: true,
            message: `Get bounding boxes successfully`,
            data
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

module.exports = {
    insertBBox,
    getBBox,
    insertBBoxLocal,
    getBBoxLocal
}