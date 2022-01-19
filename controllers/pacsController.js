const axios = require('axios')

const pythonURL = process.env.PY_SERVER + '/api/pacs';

// get patient information from PACS by HN
const getInfoByHN = async (req, res) => {
    try {
        const data = (
            await axios.get(pythonURL + `/HN/${req.params.HN}/info`)
        ).data;
        
        return res.status(200).json({
            success: true,
            message: "Get patient's info successfully",
            data: data.data['Patient ID']? data.data: undefined
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// get all data from PACS by HN
const getAllByHN = async (req, res) => {
    try {
        const data = (await axios.get(pythonURL + "/HN/" + req.params.HN)).data;
        return res.status(200).json({
            success: true,
            message: 'Get dicom files by HN successfully',
            data: data.data
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

module.exports = {
    getInfoByHN,
    getAllByHN
}