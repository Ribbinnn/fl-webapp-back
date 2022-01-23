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
        const data = (
            await axios.get(pythonURL + `/HN/${req.query.HN}/info`)
        ).data;

        return res.status(200).json({
            success: true,
            message: "Get patient's info successfully",
            data: data.data['Patient ID'] ? data.data : undefined
        })
    } catch (e) {
        if (e.response)
            return res.status(e.response.status).json({ success: false, message: e.response.data.message })
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// get all data from PACS by HN
const getAllByQuery = async (req, res) => {
    try {
        const params = {
            params: {
                hn: req.query.HN,
                acc_no: req.query.accession_no,
                start_date: req.query.start_date ? (new Date(req.query.start_date)).getTime() : undefined,
                end_date: req.query.end_date ? (new Date(req.query.end_date)).getTime() : undefined
            }
        }

        const data = (await axios.get(pythonURL + "/HN/", params)).data;
        return res.status(200).json({
            success: true,
            message: 'Get dicom files by HN successfully',
            data: data.data
        })
    } catch (e) {
        if (e.response)
            return res.status(e.response.status).json({ success: false, message: e.response.data.message })
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
        report.label.finding.map(finding => {
            if (finding == 'No Finding') finding = 'original'
            if (fs.existsSync(path.join(resultDir, finding + '.png'))) {
                // await fs.promises.copyFile(path.join(resultDir, finding + '.png'), path.join(reqDir, finding + '.png'))
                zip.addLocalFile(path.join(resultDir, finding + '.png'))
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

        console.log(response)
        await webModel.Image.findByIdAndUpdate(report.image_id._id, {
            hn: null
        })
        await webModel.MedRecord.findByIdAndUpdate(report.record_id, {
            'record.hn': null
        })
        report = await webModel.PredResult.findByIdAndUpdate(req.params.report_id, {
            hn: null,
            patient_name: null,
            status: modelStatus.FINALIZED
        }, { new: true })

        if (fs.existsSync(reqDir)) {
            fs.rmSync(reqDir);
        }

        return res
            .status(200)
            .json({
                success: true,
                message: `Save report to PACS successfully`,
                data: report,
            });

    } catch (e) {
        if (fs.existsSync(reqDir)) {
            fs.rmSync(reqDir);
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message,
        });
    }
};

module.exports = {
    getInfoByHN,
    getAllByQuery,
    saveToPACS
}