// mock up database
const PACS = require('../db/pacs').PACS

// get patient information from PACS by HN
const getByHN = async (req, res) => {
    try {
        const data = await PACS.findOne({'Patient ID': req.params.HN}, ['Patient Name'])
        return res.status(200).json({
            success: true, 
            message: 'Get pacs data successfully', 
            data
        })
    } catch (e) {
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

module.exports = {
    getByHN
}