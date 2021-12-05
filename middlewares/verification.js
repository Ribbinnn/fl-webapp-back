const webModel = require('../models/webapp')

// verify if user id in token match
const userVerification = (req, res, next) => {
    const user_id = req.body.user_id ?? req.body.clinician_id ?? req.query.user_id ?? req.params.id ?? undefined
    if (user_id) {
        if (user_id !== req.user._id)
            return res.status(403).json({ success: false, message: `User have no permission to access user ${user_id}'s resource'` })
    }
    next()
}

// verify if user is able to access project
const projectVerification = async (req, res, next) => {
    if (req.user.role !== "admin") {
        try {
            const project_id = req.body.project_id ?? req.params.project_id ?? undefined
            const project = await webModel.Project.findById(project_id)
            if (!project || !project.users.includes(req.user._id)) {
                return res.status(403).json({ success: false, message: e.message })
            }
        } catch (e) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    next()
}

// verify if user is radiologist
const radiologistVerification = (req, res, next) => {
    if (req.user.role !== "radiologist") {
        return res.status(403).json({ success: false, message: `User must be radiologist to access the resource` })
    }
    next()
}

// verify if user is admin
const adminVerification = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: `User must be admin to access the resource` })
    }
    next()
}

// verify if user is able to access report
const reportVerification = async (req, res, next) => {
    if (req.user.role !== "admin") {
        try {
            const report_id = req.params.rid ?? req.body.report_id ?? req.params.report_id ?? undefined
            const report = await webModel.PredResult.findById(report_id).populate('project_id')
            if (!report || !report.project_id.users.includes(req.user._id)) {
                return res.status(403).json({ success: false, message: `User have no permission to access report ${report_id}` })
            }
        } catch (e) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    next()
}

module.exports = {
    userVerification,
    projectVerification,
    radiologistVerification,
    reportVerification,
    adminVerification
}