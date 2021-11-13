const webModel = require('../models/webapp')

const userVerification = (req, res, next) => {
    const user_id = req.body.user_id?? req.body.clinician_id?? req.params.id?? req.query.user_id?? undefined
    if (user_id) {
        if (user_id !== req.user._id)
            return res.status(403).json({success: false, message: `User have no permission to access user ${user_id}'s resource'`})
    }
    next()
}

const projectVerification = async (req, res, next) => {
    const project_id = req.body.project_id?? req.params.project_id
    const project = await webModel.Project.findById(project_id)
    if (!project || !project.users.includes(req.user._id)) {
        return res.status(403).json({success: false, message: `User have no permission to access project ${project_id}`})
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