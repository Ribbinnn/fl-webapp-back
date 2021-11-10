const webModel = require('../models/webapp')

const userVerification = (req, res, next) => {
    const user_id = req.body.user_id?? req.body.clinician_id?? req.params.id?? undefined
    if (user_id) {
        if (user_id !== req.user._id)
            return res.status(403).json({success: false, message: `User have no permission`})
    }
    next()
}

const projectVerification = async (req, res, next) => {
    const project = await webModel.Project.findById(req.body.project_id)
    if (!project || !project.users.includes(req.user._id)) {
        return res.status(403).json({success: false, message: `User have no permission to access project ${req.body.project_id}`})
    }
    next()
}

const radiologistVerification = (req, res, next) => {
    if (req.user.role !== "radiologist") {
        return res.status(403).json({success: false, message: `User must be radiologist to access the resource`})
    }
    next()
}

module.exports = {
    userVerification,
    projectVerification,
    radiologistVerification
}