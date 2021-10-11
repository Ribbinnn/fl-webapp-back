const Joi = require("joi"); 
const vitalsModel = require('../models/vitals');
const XLSX = require('xlsx');

const schema = {
    name: Joi.string().required(),
    owner_first_name: Joi.string().required(),
    owner_last_name: Joi.string().required(),
    file: Joi.required()
};

const validator = Joi.object(schema);

// create project
const create = async (req, res) => {
    // validate input
    const validatedResult = validator.validate({
                                name: req.body.name,
                                owner_first_name: req.body.owner_first_name,
                                owner_last_name: req.body.owner_last_name,
                                file: req.file
                            })
    if (validatedResult.error) {
        return res.status(400).json({success: false, message: 'Invalid input'})
    }
    try {
        // convert excel file to json
        const workbook = XLSX.read(req.file.buffer);
        const sheet_name_list = workbook.SheetNames;
        const xdata = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
        
        const filename = req.file.originalname.replace('.', `-${Date.now()}.`);

        // create project (vitals database)
        const project = await vitalsModel.Project.create({
                                name: req.body.name,
                                owner_first_name: req.body.owner_first_name,
                                owner_last_name: req.body.owner_last_name,
                                filename
                            })

        // create file (vitals database)
        const file = await vitalsModel.File.create({
                            project_id: project._id, 
                            filename, 
                            img: {
                                data: req.file.buffer, 
                                contentType: req.file.mimetype
                            }
                        })

        // create record (vitals database)
        const record = await vitalsModel.Record.create({
                            project_id: project._id, 
                            records: xdata
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

// get project by owner
const getByOwner = async (req, res) => {
    try {
        const data = await vitalsModel.Project.find({owner_first_name: req.query.first, owner_last_name: req.query.last})

        return res.status(200).json({message: 'Get projects successfully', data: data});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get record by project id
const getRecordByProjectId = async (req, res) => {
    try {
        // get all records from this project
        const records = await vitalsModel.Record.find({project_id: req.params.id});
        return res.status(200).json({message: 'Get project successfully', data: records});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// get all projects
const getAll = async (req, res) => {
    try {
        const data = await vitalsModel.Project.find();
        return res.status(200).json({message: 'Get all projects successfully', data: data});
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

module.exports = {
    create,
    getByOwner,
    getRecordByProjectId,
    getAll
}