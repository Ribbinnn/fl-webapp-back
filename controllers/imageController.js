const webModel = require('../models/webapp')
const PACS = require('../db/pacs').PACS
const path = require('path');

// get image by accession_no (PACS) or by predicted result id + finding's name (overlay image)
const getImage = async (req, res) => {
    try {
        const root = path.join(__dirname, "..")

        // mock-up
        // PACS
        if (req.query.accession_no) {
            const data = await PACS.findOne({ 'Accession No': req.query.accession_no })

            if (!data) {
                return res.status(200).json({ success: true, message: 'File not found' });
            }

            resPath = path.join(root, "/resources/", data.filepath)
            return res.status(200).sendFile(resPath)
        }

        // overlay image
        if (req.query.result_id && req.query.finding) {
            const gradcam = await webModel.Gradcam
                .findOne({ result_id: req.query.result_id, finding: req.query.finding })
                .populate({
                    path: 'result_id',
                    populate: {
                        path: 'image_id'
                    }
                })

            if (!gradcam) {
                return res.status(200).json({ success: true, message: 'File not found' });
            }

            resPath = path.join(root, "/resources/", gradcam.gradcam_path)
            return res.status(200).sendFile(resPath)
        }
        return res.status(400).json({ success: false, message: 'Incorrect image query' })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

module.exports = {
    getImage
}