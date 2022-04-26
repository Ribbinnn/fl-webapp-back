const webModel = require('../models/webapp')
const path = require('path');
const axios = require('axios')

const url = process.env.PY_SERVER;

// get image by accession_no (PACS) or by predicted result id + finding's name (overlay image)
const getImage = async (req, res) => {
    try {
        const root = path.join(__dirname, "..")

        // PACS
        if (req.query.accession_no) {
            data = (await axios.get(url + `/api/pacs/acc_no/${req.query.accession_no}`, {
                responseType: 'arraybuffer'
            })).data
            return res.status(200).send(data)
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
        const errMsg = e.response? `Model Error`: e.message
        return res.status(500).json({ success: false, message: 'Internal server error', error: errMsg })
    }
}

module.exports = {
    getImage
}