const Joi = require("joi");
const vitalsModel = require('../models/vitals');
const webModel = require('../models/webapp')
const XLSX = require('xlsx')

const schema = {
    project_id: Joi.string().required(),
    user_id: Joi.string().required(),
    record_name: Joi.string().required(),
    records: Joi.array().items(
        Joi.object({ 
            'entry_id': Joi.required(),
            'hn': Joi.required(),
            'gender(male/female)': Joi.required(),
            'age(year)': Joi.required(),
            'measured_time(yyyy-MM-ddTHH:mm:ssZ)': Joi.required() 
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
    entry_id: Joi.number().required()
}

const validator = Joi.object(schema);
const update_validator = Joi.object(update_schema);
const delete_validator = Joi.object(delete_schema);

// create project
const create = async (req, res) => {
    // validate input
    const validatedResult = validator.validate({
        project_id: req.body.project_id,
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
        const webProject = await webModel.Project.findById(req.body.project_id)

        if (!webProject)
            return res.status(400).json({ success: false, message: 'Project not found' });

        const requirements = [
            { name: "entry_id", type: "number", unit: "none" },
            { name: "hn", type: "number", unit: "none" },
            { name: "gender", type: "string", unit: "male/female" },
            { name: "age", type: "number", unit: "year" },
            { name: "measured_time", type: "object", unit: "yyyy-MM-ddTHH:mm:ssZ" },
            ...webProject.requirements
        ]

        const records = req.body.records.map((item) => {
            requirements.forEach((requirement) => {
                const fieldName = requirement.name + (requirement.unit == 'none' ? "" : "(" + requirement.unit + ")")
                if (!item[fieldName])
                    throw new Error(`Invalid record input: "${fieldName}" is required`)
                // check fields' type
                if (typeof(item[fieldName])!==requirement.type && requirement.name !== "measured_time") 
                    throw new Error(`Invalid record input: "${fieldName}" must be a ${requirement.type}`)
                if(requirement.name == "measured_time" && new Date(item[fieldName]) == "Invalid Date")
                    throw new Error(`Invalid record input: Incorrect "${fieldName}" date format`)
            })
            for (const k in item) {
                if (k.includes("(")) {
                    item[k.split("(")[0]] = item[k]
                    delete item[k]
                }
            }
            item["measured_time"] = new Date(item.measured_time)
            item["updated_time"] = new Date()
            return item
        })

        const user = await webModel.User.findById(req.body.user_id, ['_id', 'first_name', 'last_name'])

        // create project (vitals database)
        const project = await vitalsModel.Project.create({
            name: webProject.name,
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
        if (e.message.includes('Invalid record input'))
            return res.status(400).json({ success: false, message: e.message });
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

// get vitals project by clinician
const getProject = async (req, res) => {
    try {
        const user = await webModel.User.findById(req.query.user_id);
        const project = await webModel.Project.findById(req.query.project_id)
        if (!user || !project)
            return res.status(400).json({ success: false, message: 'User or project not found' })
        const data = await vitalsModel.Record.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project_id",
                    foreignField: "_id",
                    as: "project"
                },
            },
            { 
                $match: { 
                    "project.clinician_first_name": user.first_name,
                    "project.clinician_last_name": user.last_name,
                    "project.name": project.name
                } 
            },
            {
                $addFields: {
                    "createdAt": { "$arrayElemAt": ['$project.createdAt', 0] },
                    "record_name": { "$arrayElemAt": ['$project.record_name', 0] }
                }
            },
            { $unset: ["project", "_id"] },
        ])

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
                    'records.project_name': { "$arrayElemAt": ['$project.name', 0] },
                    'records.record_id': '$_id',
                    'records.clinician_first_name': { "$arrayElemAt": ['$project.clinician_first_name', 0] },
                    'records.updatedAt': '$updatedAt'
                }
            },
            { $replaceRoot: { newRoot: '$records' } },
            { $match: { hn: Number(req.query.HN), project_name: req.query.project_name } }
        ])
        return res.status(200).json({ success: true, message: 'Get project successfully', data: records });
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
        let updated_time = new Date();
        req.body.update_data[0]["records.$.updated_time"] = updated_time;
        vitalsModel.Record.findOneAndUpdate(
            { _id: req.body.record_id, "records.entry_id": req.body.update_data[0]["records.$.entry_id"] },
            req.body.update_data[0],
            (err) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ success: false, message: 'Internal server error' })
                }
                vitalsModel.Record.findOneAndUpdate(
                    { _id: req.body.record_id }, 
                    { updatedAt: updated_time },
                    (err) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).json({ success: false, message: 'Internal server error' })
                        }
                        return res.status(200).json({ success: true, message: `Update record ${req.body.record_id} successfully` });
                    });
            });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

//delete a single row of record by record id and entry id of row to be removed
const deleteRecRow = async (req, res) => {
    const validatedResult = delete_validator.validate(req.body)
    if (validatedResult.error) {
        console.log(validatedResult.error)
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        vitalsModel.Record.findById(req.body.record_id, (err, record) => {
            let new_records = (record.records).filter((item) => item.entry_id !== req.body.entry_id)
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
        // should find by web project id
        const project = await webModel.Project.findById(req.params.project_id)

        const requirements = project.requirements.map(item => `${item.name}${item.unit=='none'? "": "(" + item.unit + ")"}`)
        const headerField = ["entry_id", "hn", "measured_time(yyyy-MM-ddTHH:mm:ssZ)", "gender(male/female)", "age(year)", ...requirements]

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
    getProject,
    getRecordByProjectId,
    getRecordByHN,
    updateRecRow,
    deleteRecRow,
    deleteRecFile,
    generateTemplate
}