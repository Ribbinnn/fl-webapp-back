const webModel = require('../models/webapp')
const { modelStatus, userRole } = require('../utils/status')

// verify if user id in token match
const userVerification = async (req, res, next) => {
    if (req.user.role !== userRole.ADMIN) {
        const user_id = req.body.user_id ?? req.query.user_id ?? req.params.id ?? req.body.id ?? undefined
        const user = await webModel.User.findById(user_id)
        if (!user || user.id !== req.user._id)
            return res.status(403).json({ success: false, message: `User have no permission to access user ${user_id}'s resource` })
    }
    next()
}

// verify if user is able to access project
const projectVerification = async (req, res, next) => {
    if (req.user.role !== userRole.ADMIN) {
        try {
            const project_id = req.body.project_id ?? req.params.project_id ?? undefined
            const project = await webModel.Project.findById(project_id)
            if (!project || !project.users.includes(req.user._id)) {
                return res.status(403).json({ success: false, message: `User have no permission to access project ${project_id}` })
            }
        } catch (e) {
            return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
        }
    }
    next()
}

// verify if user is radiologist
const radiologistVerification = (req, res, next) => {
    if (req.user.role !== userRole.RADIOLOGIST) {
        return res.status(403).json({ success: false, message: `User must be radiologist to access the resource` })
    }
    next()
}

// verify if user is admin
const adminVerification = (req, res, next) => {
    if (req.user.role !== userRole.ADMIN) {
        return res.status(403).json({ success: false, message: `User must be admin to access the resource` })
    }
    next()
}

// verify if user is able to access report
const reportVerification = async (req, res, next) => {
    if (req.user.role !== userRole.ADMIN) {
        try {
            const report_id = req.params.rid ?? req.body.report_id ?? req.params.report_id ?? undefined
            const report = await webModel.PredResult.findById(report_id).populate('project_id')
            if (!report || !report.project_id.users.includes(req.user._id)) {
                return res.status(403).json({ success: false, message: `User have no permission to access report ${report_id}` })
            }
        } catch (e) {
            return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
        }
    }
    next()
}

// check if report is able to be updated
const checkEditReportStatus = async (req, res, next) => {
    try {
        const report = await webModel.PredResult.findById(req.body.report_id);
        if (!(report.status === modelStatus.AI_ANNOTATED || report.status === modelStatus.HUMAN_ANNOTATED))
            return res.status(400).json({
                success: false,
                message: `Report's status must be 'Human-Annotated' or 'AI-Annotated' to be able to be updated`
            });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
    next()
}

module.exports = {
    userVerification,
    projectVerification,
    radiologistVerification,
    reportVerification,
    adminVerification,
    checkEditReportStatus
}