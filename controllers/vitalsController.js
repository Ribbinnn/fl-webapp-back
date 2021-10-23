const Joi = require("joi"); 
const vitalsModel = require('../models/vitals');
const webModel = require('../models/webapp')
const XLSX = require('xlsx');

const schema = {
    name: Joi.string().required(),
    user_id: Joi.string().required(),
    file: Joi.required()
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

// create project
const create = async (req, res) => {
    // validate input
    const validatedResult = validator.validate({
                                name: req.body.project_name,
                                user_id: req.body.user_id,
                                record_name: req.body.record_name
                            })
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        // convert excel file to json
        // const workbook = XLSX.read(req.file.buffer);
        // const sheet_name_list = workbook.SheetNames;
        // const xdata = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
        
        // const filename = req.file.originalname.replace('.', `-${Date.now()}.`);

        const user = await webModel.User.findById(req.body.user_id, ['_id', 'first_name', 'last_name'])

        // create project (vitals database)
        const project = await vitalsModel.Project.create({
                                name: req.body.project_name,
                                clinician_first_name: user.first_name,
                                clinician_last_name: user.last_name,
                                record_name: req.body.record_name
                            })

        // create file (vitals database)
        // const file = await vitalsModel.File.create({
        //                     project_id: project._id, 
        //                     filename, 
        //                     file: {
        //                         data: req.file.buffer, 
        //                         contentType: req.file.mimetype
        //                     }
        //                 })

        // create record (vitals database)
        const record = await vitalsModel.Record.create({
                            project_id: project._id, 
                            records: req.body.records
                        })

        // send status and message
        return res.status(200).json({
            success: true, 
            message: 'Create project successfully', 
            data: project
        })
    } catch (e) {
        // error
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

// get vitals project by clinician
const getProjectByClinician = async (req, res) => {
    try {
        const user = await webModel.User.findById(req.params.id);
        const data = await vitalsModel.Project.find({clinician_first_name: user.first_name, clinician_last_name: user.last_name})

        return res.status(200).json({success: true, message: 'Get projects successfully', data: data});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get record by project id
const getRecordByProjectId = async (req, res) => {
    try {
        // get all records from this project
        const records = await vitalsModel.Record.find({project_id: req.params.id});
        return res.status(200).json({success: true, message: 'Get project successfully', data: records});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get all records by patient HN
const getRecordByHN = async (req, res) => {
    try {
        const records = await vitalsModel.Record.aggregate([
            { $lookup: {
                from: "projects",
                localField: "project_id",
                foreignField: "_id",
                as: "project"
            }},
            { $unwind: {path: '$records'} },
            { $addFields: {
                'records.project_id': { "$arrayElemAt": ['$project._id', 0] },
                'records.record_id': '$_id',
                'records.clinician_first_name': { "$arrayElemAt": ['$project.clinician_first_name', 0] },
                'records.uploaded_time': '$updatedAt'
            }},
            { $replaceRoot: {newRoot: '$records'} },
            { $match: {HN: Number(req.params.HN)} }
        ])
        return res.status(200).json({success: true, message: 'Get project successfully', data: records});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get all projects
const getAll = async (req, res) => {
    try {
        const data = await vitalsModel.Project.find();
        return res.status(200).json({success: true, message: 'Get all projects successfully', data: data});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// update selected row in record file by record id and patient HN with update data
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
        vitalsModel.Record.findById(req.body.record_id, (err, record) => {
            let new_records = (record.records).filter((item, i) => i !== req.body.record_index)
            record.records = new_records
            record.save((err) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({success: false, message: 'Internal server error'})
                }
                let updated_time = new Date();
                vitalsModel.Project.findByIdAndUpdate(record.project_id,{"updatedAt": updated_time}, (err, result) => {
                    if(err){
                        console.log(err)
                        return res.status(500).json({success: false, message: 'Internal server error'})
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'Delete one record successfully'
                    })
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
        vitalsModel.Record.findByIdAndRemove(req.params.id, (err, record) => {
            if (err){
                console.log(err)
                return res.status(500).json({success: false, message: 'Internal server error'})
            }
            vitalsModel.Project.findByIdAndRemove(record.project_id, (err, result) => {
                if (err){
                    console.log(err)
                    return res.status(500).json({success: false, message: 'Internal server error'})
                }
                return res.status(200).json({success: true, message: `remove record ${record.id} successfully`})
            })
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({success: false, message: 'Internal server error'})
    } 

} 

module.exports = {
    create,
    getProjectByClinician,
    getRecordByProjectId,
    getRecordByHN,
    getAll,
    updateRecRow,
    deleteRecRow,
    deleteRecFile
}