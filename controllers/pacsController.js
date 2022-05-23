const axios = require('axios');
const webModel = require("../models/webapp");
const { modelStatus } = require("../utils/status");
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const AdmZip = require("adm-zip");

const pythonURL = process.env.PY_SERVER + '/api/pacs';

// get patient information from PACS by HN
const getInfoByHN = async (req, res) => {
    try {
        let acc_no = (await webModel.PythonDCMPath.findOne({ hn: req.query.HN }))

        if (!acc_no) {
            return res.status(200).json({
                success: true,
                message: "Get patient's info successfully"
            })
        }

        acc_no = acc_no.accession_no
        const data = (await axios.post(pythonURL, {
            'acc_no_list': [acc_no]
        })).data

        return res.status(200).json({
            success: true,
            message: "Get patient's info successfully",
            data: data.data == [] ? undefined : {
                'Patient ID': data.data[0]['Patient ID'],
                'Patient Name': data.data[0]['Patient Name'],
                'Patient Sex': data.data[0]['Patient Sex'],
                'Patient Birthdate': data.data[0]['Patient Birthdate'],
                'Age': data.data[0]['Age']
            }
        })
    } catch (e) {
        if (e.response)
            return res.status(e.response.status).json({ success: false, message: `${e.response.data.message}` })
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// get all data from PACS by HN
const getAllByQuery = async (req, res) => {
    try {
        const startDate = new Date(req.query.start_date)
        startDate.setHours(startDate.getHours() + 7);
        const endDate = new Date(req.query.end_date)
        endDate.setHours(endDate.getHours() + 7);

        const hn = req.query.HN
        const acc_no = req.query.accession_no
        const start_date = req.query.start_date
        const end_date = req.query.end_date

        var accNoList = []
        if (!hn && !acc_no && !start_date && !end_date) {
            accNoList = await webModel.PythonDCMPath.find()
        } else {
            let conditions = []
            conditions.push({ hn: { $ne: null } })
            if (hn) conditions.push({ hn: hn })
            if (acc_no) conditions.push({ accession_no: accession_no })
            if (start_date) conditions.push({ study_time: { $gte: start_date } })
            if (end_date) conditions.push({ study_time: { $lte: end_date } })
            accNoList = await webModel.PythonDCMPath.find({ $and: conditions })
        }
        const acc_no_list = accNoList.map(item => item.accession_no)

        const data = (await axios.post(pythonURL, {
            'acc_no_list': acc_no_list
        })).data

        return res.status(200).json({
            success: true,
            message: 'Get dicom files by HN successfully',
            data: data.data
        })
    } catch (e) {
        if (e.response)
            return res.status(e.response.status).json({ success: false, message: `${e.response.data.message}` })
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// save report back to PACS
const saveToPACS = async (req, res) => {
    const root = path.join(__dirname, "..");
    let resultDir = ""
    let reqDir = ""
    let report = {}
    try {
        report = await webModel.PredResult.findById(
            req.params.report_id
        ).populate(["project_id", "image_id"]);

        // check if report's status is human-annoated and user is project's head
        if (
            !report ||
            report.status !== modelStatus.HUMAN_ANNOTATED ||
            !report.project_id.head.includes(req.user._id)
        ) {
            return res.status(400).json({
                success: false,
                message: !report.project_id.head.includes(req.user._id)
                    ? `User must be project's head to save report ${req.params.report_id} back to PACS`
                    : `Report's status must be 'Human-Annotated' to be saved to PACS`,
            });
        }

        const gradcam = await webModel.Gradcam.findOne({ result_id: report._id })

        resultDir = path.join(root, 'resources', gradcam.gradcam_path.split("/").slice(0, -1).join("/"))
        reqDir = path.join(resultDir, report.image_id.accession_no + '.zip')
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message,
        });
    }

    try {
        let bbox_data = (await webModel.Mask.findOne({ result_id: report._id })).toObject();
        bbox_data['acc_no'] = report.image_id.accession_no
        const zip = new AdmZip();
        // select heatmap to be sent to pacs
        report.label?.finding?.map(finding => {
            if (finding != 'No Finding' && fs.existsSync(path.join(resultDir, finding + '.png'))) {
                // await fs.promises.copyFile(path.join(resultDir, finding + '.png'), path.join(reqDir, finding + '.png'))
                imgName = finding.split(' ').join('_')
                zip.addLocalFile(path.join(resultDir, finding + '.png'), "", imgName + '.png')
            }
        })
        zip.writeZip(reqDir);

        // create FormData to send to python server
        const data = new FormData()
        data.append('file', fs.createReadStream(reqDir))
        data.append('bbox_data', JSON.stringify(bbox_data))

        /* CALLS PYTHON API */
        let url = pythonURL + "/save"

        const response = (
            await axios.post(url, data, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    'Authorization': `Bearer ${req.headers["authorization"].split(' ')[1]}`
                }
            })
        ).data;

        // delete hn in database and change report's status
        await webModel.Image.findByIdAndUpdate(report.image_id._id, {
            hn: null
        })
        await webModel.MedRecord.findByIdAndUpdate(report.record_id, {
            'record.hn': null
        })
        await webModel.PredResult.findByIdAndUpdate(req.params.report_id, {
            hn: null,
            patient_name: null,
            status: modelStatus.FINALIZED
        })
        await webModel.PythonDCMPath.findOneAndUpdate({ accession_no: report.image_id.accession_no }, {
            hn: null
        })

        // delete zip file
        if (fs.existsSync(reqDir)) {
            fs.rmSync(reqDir);
        }

        // delete gradcam
        const gradcams = await webModel.Gradcam.find({ result_id: report._id })
        await Promise.all(gradcams.map(async gradcam => {
            const findingFile = gradcam.finding
            if (findingFile != 'original' && !report.label.finding.includes(findingFile)) {
                await webModel.Gradcam.findOneAndDelete({ _id: gradcam._id })
            }
        }))

        // delete patient's info in report that has the same Accession Number
        const reportAcc = await webModel.PredResult.aggregate([
            {
                $lookup: {
                    from: "images",
                    localField: "image_id",
                    foreignField: "_id",
                    as: "image"
                }
            },
            {
                $lookup: {
                    from: "medrecords",
                    localField: "record_id",
                    foreignField: "_id",
                    as: "record"
                }
            },
            {
                $match: {
                    "image.accession_no": report.image_id.accession_no,
                }
            },
            // { $unset: ["image", "record"] },
        ])
        await Promise.all(reportAcc.map(async rep => {
            await webModel.Image.findByIdAndUpdate(rep.image_id, {
                hn: null
            })
            await webModel.MedRecord.findByIdAndUpdate(rep.record_id, {
                'record.hn': null
            })
            await webModel.PredResult.findByIdAndUpdate(rep._id, {
                hn: null,
                patient_name: null,
            })
        }))

        return res
            .status(200)
            .json({
                success: true,
                message: `Save report to PACS successfully`,
            });

    } catch (e) {
        if (fs.existsSync(reqDir)) {
            fs.rmSync(reqDir);
        }
        // if (e.response)
        //     return res.status(e.response.status).json({ success: false, message: `${e.response.data.message}` })
        const errMsg = e.response ? `Model Error` : e.message
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: errMsg,
        });
    }
};

module.exports = {
    getInfoByHN,
    getAllByQuery,
    saveToPACS
}