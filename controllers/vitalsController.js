const Joi = require("joi");
const vitalsModel = require('../models/vitals');
const webModel = require('../models/webapp')
const XLSX = require('xlsx')

const schema = {
    project_name: Joi.string().required(),
    user_id: Joi.string().required(),
    record_name: Joi.string().required(),
    records: Joi.array().items(
        Joi.object({ 
            'entry_id': Joi.required(),
            'hn': Joi.required(),
            'gender': Joi.required(),
            'age': Joi.required(),
            'measured_time': Joi.required() 
        }).unknown(true)).unique('entry_id')
};

const update_schema = {
    record_id: Joi.string().required(),
    update_data: Joi.array().items(
        Joi.object({ 
            'entry_id': Joi.required(),
            'hn': Joi.required(),
            'gender': Joi.required(),
            'age': Joi.required(),
            'measured_time': Joi.required(),
            // 'updated_time': Joi.required()
        }).unknown(true)).unique('entry_id'),
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
        project_name: req.body.project_name,
        // project_id: req.body.project_id,
        user_id: req.body.user_id,
        record_name: req.body.record_name,
        records: req.body.records
    })
    if (validatedResult.error) {
        // console.log(validatedResult.error.message)
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {

        // validate requirements
        // const webProject = await webModel.Project.findById(req.body.project_id)

        // if (!webProject)
        //     return res.status(400).json({ success: false, message: 'Project not found' });

        // const requirements = [
        //     { name: "entry_id", type: "string" },
        //     { name: "hn", type: "number" },
        //     { name: "gender", type: "string" },
        //     { name: "age", type: "string" },
        //     { name: "measured_time", type: "object" },
        //     ...webProject.requirements
        // ]

        // const records = req.body.records.map((item) => {
        //     requirements.forEach((requirement) => {
        //         if (!req.body.record[requirement.name])
        //             throw new Error(`Invalid record input: "${requirement.name}" is required`)
        //         // check fields' type
        //         // if (typeof(req.body.record[item.name])!==item.type) 
        //         //     throw new Error(`Invalid record input: "${item.name}" must be a ${item.type}`)
        //     })
        //     item["measured_time"] = new Date(item.measured_time)
        //     item["updated_time"] = new Date()
        //     return item
        // })

        const records = req.body.records.map((item) => {
            item["updated_time"] = new Date()
            return item
        })
        const user = await webModel.User.findById(req.body.user_id, ['_id', 'first_name', 'last_name'])

        // create project (vitals database)
        const project = await vitalsModel.Project.create({
            name: req.body.project_name,
            clinician_first_name: user.first_name,
            clinician_last_name: user.last_name,
            record_name: req.body.record_name
        })

        // create record (vitals database)
        const record = await vitalsModel.Record.create({
            project_id: project._id,
            records
        })

        // send status and message
        return res.status(200).json({
            success: true,
            message: 'Create project successfully',
            data: project
        })
    } catch (e) {
        // error
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// get vitals project by clinician
const getProjectByClinician = async (req, res) => {
    try {
        const user = await webModel.User.findById(req.params.id);
        const data = await vitalsModel.Project.find({ clinician_first_name: user.first_name, clinician_last_name: user.last_name })

        return res.status(200).json({ success: true, message: 'Get projects successfully', data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// get record by project id
const getRecordByProjectId = async (req, res) => {
    try {
        // get all records from this project
        const records = await vitalsModel.Record.find({ project_id: req.params.id });
        return res.status(200).json({ success: true, message: 'Get project successfully', data: records });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// get all records by patient HN
const getRecordByHN = async (req, res) => {
    try {
        const records = await vitalsModel.Record.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project_id",
                    foreignField: "_id",
                    as: "project"
                }
            },
            { $unwind: { path: '$records' } },
            {
                $addFields: {
                    'records.project_id': { "$arrayElemAt": ['$project._id', 0] },
                    'records.record_id': '$_id',
                    'records.clinician_first_name': { "$arrayElemAt": ['$project.clinician_first_name', 0] },
                    'records.updatedAt': '$updatedAt'
                }
            },
            { $replaceRoot: { newRoot: '$records' } },
            { $match: { hn: Number(req.params.HN) } }
        ])
        return res.status(200).json({ success: true, message: 'Get project successfully', data: records });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// get all projects
const getAll = async (req, res) => {
    try {
        const data = await vitalsModel.Project.find();
        return res.status(200).json({ success: true, message: 'Get all projects successfully', data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// update selected row in record file by record id and patient HN with update data
const updateRecRow = async (req, res) => {
    const validatedResult = update_validator.validate(req.body)
    if (validatedResult.error) {
        console.log(validatedResult.error)
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        // change req.body.update_data key from [key] to [records.$.key] to update nested object
        for (const key in req.body.update_data[0]) {
            req.body.update_data[0]["records.$." + key] = req.body.update_data[0][key];
            delete req.body.update_data[0][key];
        }
        vitalsModel.Record.findOneAndUpdate(
            { _id: req.body.record_id, "records.entry_id": req.body.update_data[0]["records.$.entry_id"] },
            req.body.update_data[0],
            (err) => {
                return res.status(200).json({ success: true, message: `Update record ${req.body.record_id} successfully` });
            })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

//delete a single row of record by record id and index of row to remove
const deleteRecRow = async (req, res) => {
    const validatedResult = delete_validator.validate(req.body)
    if (validatedResult.error) {
        console.log(validatedResult.error)
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        vitalsModel.Record.findById(req.body.record_id, (err, record) => {
            let new_records = (record.records).filter((item, i) => i !== req.body.record_index)
            record.records = new_records
            record.save((err) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ success: false, message: 'Internal server error' })
                }
                let updated_time = new Date();
                vitalsModel.Project.findByIdAndUpdate(record.project_id, { "updatedAt": updated_time }, (err, result) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ success: false, message: 'Internal server error' })
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
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

const deleteRecFile = async (req, res) => {
    const validatedResult = delete_validator.validate({ record_id: req.params.id })
    console.log(req.params)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        vitalsModel.Record.findByIdAndRemove(req.params.id, (err, record) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ success: false, message: 'Internal server error' })
            }
            vitalsModel.Project.findByIdAndRemove(record.project_id, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ success: false, message: 'Internal server error' })
                }
                return res.status(200).json({ success: true, message: `remove record ${record.id} successfully` })
            })
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// generate template from project's requirements
const generateTemplate = async (req, res) => {
    try {
        const project = await webModel.Project.findOne({ name: req.params.project_name })

        const requirements = project.requirements.map(item => item.name)
        const headerField = ["entry_id", "hn", "gender", "age", "measured_time", ...requirements]

        const ws = XLSX.utils.json_to_sheet([], { header: headerField })
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws);
        const wbbuf = XLSX.write(wb, { type: 'buffer' });

        res.writeHead(200, [
            ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        ]);
        return res.end(wbbuf)
    } catch (e) {
        return res.status(500).json({ success: false, message: `Internal server error` })
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
    deleteRecFile,
    generateTemplate
}