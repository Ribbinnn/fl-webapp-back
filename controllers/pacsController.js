const axios = require('axios');
const webModel = require("../models/webapp");
const { modelStatus } = require("../utils/status");
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const AdmZip = require("adm-zip");

const pythonURL = process.env.PY_SERVER + '/api';

// get patient information from PACS by HN
const getInfoByHN = async (req, res) => {
    try {
        let url = ""
        if (req.query.dir === 'local')
            url = pythonURL + `/local/HN/${req.query.HN}/info`
        else
            url = pythonURL + `/pacs/HN/${req.query.HN}/info`
        if(isNaN(Number(req.query.HN))) {
            return res.status(200).json({
                success: true,
                message: "Invalid HN",
            })
        }

        const data = (
            await axios.get(url)
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
        let url = ""
        let params = {}
        if (req.query.dir === 'local') {
            
            url = pythonURL + `/local/HN/`
            params = {
                params: {
                    hn: req.query.HN,
                    acc_no: req.query.accession_no,
                    start_date: req.query.start_date? (new Date(req.query.start_date)).getTime(): undefined,
                    end_date: req.query.end_date? (new Date(req.query.end_date)).getTime(): undefined
                }
            }
        }
        else
            url = pythonURL + `/pacs/HN/${req.query.HN}`
        const data = (await axios.get(url, params)).data;
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

module.exports = {
    getInfoByHN,
    getAllByQuery,
}