const Joi = require("joi"); 
const webModel = require('../models/webapp')
const vitalsModel = require('../models/vitals')

const schema = {
    project_id: Joi.string().required(),
    record: Joi.object()
};

const update_schema = {
    record_id: Joi.string().required(),
    HN: Joi.number().integer().required(),
    update_data: Joi.object(),
}

const delete_schema = {
    record_id: Joi.string().required(),
    record_index: Joi.number().integer()
}

const validator = Joi.object(schema);
const update_validator = Joi.object(update_schema);
const delete_validator = Joi.object(delete_schema);

const insertMedRec = async (req, res) => {
    // validate input
    const validatedResult = validator.validate({project_id: req.params.id, record: req.body})
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        // return data before update
        const medRec = await webModel.MedRecord.findOneAndUpdate({'project_id': req.params.id}, {$push: {records: req.body}})
        return res.status(200).json({
            success: true, 
            message: 'Insert medical record successfully', 
            data: medRec 
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

const updateRecRow = async (req, res) => {
    const validatedResult = update_validator.validate(req.body)
    if (validatedResult.error) {
        console.log(validatedResult.error)
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        // change req.body.update_data key from [key] to [records.$.key] to update nested object
        for (const key in req.body.update_data) {
            req.body.update_data["records.$." + key] = req.body.update_data[key];
            delete req.body.update_data[key];
        }
        vitalsModel.Record.findOneAndUpdate(
            {_id: req.body.record_id, "records.HN": req.body.HN}, 
            req.body.update_data, 
            (err) => {
                return res.status(200).json({success: true, message: `Update record ${req.body.record_id}, HN ${req.body.HN} successfully`});
            })
    } catch (e) {
        console.log(e)
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

//delete a single row of record by record id and index of row to remove
const deleteRecRow = async (req, res) => {
    const validatedResult = delete_validator.validate(req.body)
    if (validatedResult.error) {
        console.log(validatedResult.error)
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        webModel.MedRecord.findById(req.body.record_id, (err, record) => {
            let new_records = (record.records).filter((item, i) => i !== req.body.record_index)
            record.records = new_records
            record.save((err) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({success: false, message: 'Internal server error'})
                }
                return res.status(200).json({
                    success: true,
                    message: 'Delete one record successfully'
                })
            })
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

const deleteRecFile = async (req, res) => {
    const validatedResult = delete_validator.validate({record_id: req.params.id})
    console.log(req.params)
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        webModel.MedRecord.findByIdAndRemove(req.params.id, (err, record) => {
            if (err){
                console.log(err)
            }
            else{
                return res.status(200).json({success: true, message: `remove record ${record.id} successfully`})
            }
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({success: false, message: 'Internal server error'})
    } 

}

module.exports = {
    insertMedRec,
    updateRecRow,
    deleteRecRow,
    deleteRecFile
}