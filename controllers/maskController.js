const Joi = require("joi");
const webModel = require('../models/webapp')
const { modelStatus } = require('../utils/status')
const XLSX = require('xlsx')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const axios = require('axios')

const pythonURL = process.env.PY_SERVER + '/api';

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

const generateMaskXLSX = async (req, res) => {
    try {
        let masks = []
        if (req.query.is_acc_no == 'true') {
            // generate by accession_no
            masks = await webModel.Mask.find({ accession_no: { $in: req.query.list } })
        }
        else { 
            // generate by report_id
            const ids = req.query.list.map(id => ObjectId(id))
            console.log(req.query)
            masks = await webModel.Mask.aggregate([
                {
                    $lookup: {
                        from: "pred_results",
                        localField: "result_id",
                        foreignField: "_id",
                        as: "result"
                    }
                },
                {
                    $lookup: {
                        from: "images",
                        localField: "result.image_id",
                        foreignField: "_id",
                        as: "image"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "result.updated_by",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $match: { result_id: { $in: ids } } },
                { $addFields: { 
                    accession_no: { "$arrayElemAt": ['$image.accession_no', 0] }, 
                    username: { "$arrayElemAt": ['$user.username', 0] }, 
                } },
                { $unset: ["result", "image", "user"] },
            ])
        }

        let xlsxData = []
        masks.map((mask) => {
            mask.data.map(obj => {
                let row = {}
                switch (obj.tool) {
                    case "rectangleRoi" || "length":
                        row = {
                            'Image ID': "",
                            'Accession Number': mask.accession_no,
                            'Class Name': obj.label,
                            'User': req.query.is_acc_no == 'true'? req.user.username: mask.username,
                            'Tool': obj.tool == "length" ? "Length" : "Rectangle",
                            'Index': 0,
                            'x': obj.data.handles.start.x,
                            'y': obj.data.handles.start.y,
                            'Value': "",
                            'Folder Name': ""
                        }
                        xlsxData.push(row)
                        row = {
                            'Image ID': "",
                            'Accession Number': mask.accession_no,
                            'Class Name': obj.label,
                            'User': req.query.is_acc_no == 'true'? req.user.username: mask.username,
                            'Tool': obj.tool == "length" ? "Length" : "Rectangle",
                            'Index': 1,
                            'x': obj.data.handles.end.x,
                            'y': obj.data.handles.end.y,
                            'Value': "",
                            'Folder Name': ""
                        }
                        xlsxData.push(row)
                        break
                    case "freehand":
                        obj.data.handles.map((point, idx) => {
                            row = {
                                'Image ID': "",
                                'Accession Number': mask.accession_no,
                                'Class Name': obj.label,
                                'User': req.query.is_acc_no == 'true'? req.user.username: mask.username,
                                'Tool': "Polygon",
                                'Index': idx,
                                'x': point.x,
                                'y': point.y,
                                'Value': "",
                                'Folder Name': ""
                            }
                            xlsxData.push(row)
                        })
                        break
                    case "ratio":
                        row = {
                            'Image ID': "",
                            'Accession Number': mask.accession_no,
                            'Class Name': obj.label,
                            'User': req.query.is_acc_no == 'true'? req.user.username: mask.username,
                            'Tool': "Ratio",
                            'Index': 0,
                            'x': "",
                            'y': "",
                            'Value': obj.data.ratio,
                            'Folder Name': ""
                        }
                        xlsxData.push(row)
                        break
                }
            })
        })

        const response = (await axios.patch(pythonURL + '/local/loc/', { data: xlsxData })).data;

        const ws = XLSX.utils.json_to_sheet(response.data)
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws);
        const wbbuf = XLSX.write(wb, { type: 'buffer' });

        res.writeHead(200, [
            ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        ]);
        return res.end(wbbuf)
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

const generateMaskPNG = async (req, res) => {
    try {
        let mask = {}
        if (req.query.is_acc_no == 'true') {
            mask = await webModel.Mask.find({ accession_no: req.query.accession_no })
        }
        else {
            mask = await webModel.Mask.aggregate([
                {
                    $lookup: {
                        from: "pred_results",
                        localField: "result_id",
                        foreignField: "_id",
                        as: "result"
                    }
                },
                {
                    $lookup: {
                        from: "images",
                        localField: "result.image_id",
                        foreignField: "_id",
                        as: "image"
                    }
                },
                { $match: { result_id: ObjectId(req.query.report_id) } },
                { $addFields: { accession_no: { "$arrayElemAt": ['$image.accession_no', 0] }, } },
                { $unset: ["result", "image"] },
            ])
        }

        mask = JSON.stringify(mask[0])

        const data = (await axios.post(pythonURL + '/local/png/', { bbox_data: mask }, {
            responseType: 'arraybuffer'
        })).data
        return res.status(200).send(data)
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

module.exports = {
    insertBBox,
    getBBox,
    insertBBoxLocal,
    getBBoxLocal,
    generateMaskXLSX,
    generateMaskPNG
}