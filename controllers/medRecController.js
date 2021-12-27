const Joi = require("joi"); 
const webModel = require('../models/webapp')
const vitalsModel = require('../models/vitals')

const schema = {
    project_id: Joi.string().required(),
    record: Joi.object()
};

const validator = Joi.object(schema);

const insertMedRec = async (req, res) => {
    // validate input
    const validatedResult = validator.validate({project_id: req.params.id, record: req.body})
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: `Invalid input: ${(validatedResult.error.message)}`})
    }
    try {
        // return data before update
        const medRec = await webModel.MedRecord.create({project_id: req.params.id, record: req.body})
        return res.status(200).json({
            success: true, 
            message: 'Insert medical record successfully', 
            data: medRec 
        })
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error', error: e.message})
    }
}

module.exports = {
    insertMedRec
}