const Joi = require("joi");
const webModel = require('../models/webapp')
const { task } = require('../utils/taskList')
const { checkExistedUser } = require('../utils/checkExistedUser')
const { userStatus, userRole } = require('../utils/status')

const schema = {
    name: Joi.string().required().max(32),
    task: Joi.string().required().valid(
        "classification_pylon_256",
        "classification_pylon_1024",
        "covid19_admission"
    ),
    description: Joi.string().max(160),
    predClasses: Joi.array().items(Joi.string()),
    head: Joi.array().items(Joi.string()).required().min(1)
    // requirements: Joi.array().items(Joi.object({
    //     name: Joi.string(),
    //     type: Joi.string(),
    //     unit: Joi.string()
    // }))
};

const manageSchema = {
    id: Joi.string().required(),
    users: Joi.array().items(Joi.string())
}

const validator = Joi.object(schema);
const updateValidator = Joi.object({ ...schema, id: Joi.string().required() });
const manageValidator = Joi.object(manageSchema)

// create new project
const create = async (req, res) => {
    // validate input
    const validatedResult = validator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        // create project
        const existedUsers = await checkExistedUser(req.body.head, [userRole.RADIOLOGIST])
        if (existedUsers.length < 1)
            return res.status(400).json({
                success: false,
                message: 'Cannot create project when head list is empty, please check if user assigned to be head is valid'
            });

        const project = await webModel.Project.create({ ...req.body, users: existedUsers, requirements: task[req.body.task] })

        // update project list of associated user
        await Promise.all(existedUsers.map(async (id) => {
            await webModel.User.findByIdAndUpdate(id, { $push: { projects: project.id } })
        }))

        return res.status(200).json({
            success: true,
            message: 'Create project successfully',
            data: project
        })
    } catch (e) {
        if (e.message.includes('duplicate key')) {
            return res.status(400).json({ success: false, message: 'Duplicate project name' })
        }
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// get project by id
const getById = async (req, res) => {
    try {
        const project = await webModel.Project.findById(req.params.project_id);
        return res.status(200).json({ success: true, message: `Get project ${req.params.project_id} successfully`, data: project });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// get all projects by user id
const getByUserId = async (req, res) => {
    try {
        const data = await webModel.User.findById(req.params.id).populate('projects');
        return res.status(200).json({
            success: true,
            message: `Get project by user ${req.params.id} successfully`,
            data: { projects: data ? data.projects : [] }
        });
    } catch (e) {
        // invalid mongoose object id
        if (e.message.includes('Cast to ObjectId failed')) {
            return res.status(400).json({ success: false, message: 'Invalid user id' })
        }

        // other error
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

// get all projects
const getAll = async (req, res) => {
    try {
        const data = await webModel.Project.find({}, ['_id', 'name', 'head']).populate('head', 'username');
        return res.status(200).json({ success: true, message: 'Get all projects successfully', data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
}

// get all AI tasks
const getTask = async (req, res) => {
    return res.status(200).json({ success: true, message: 'Get task successfully', data: Object.keys(task) });
}

// update project by id
const update = async (req, res) => {
    const validatedResult = updateValidator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        const project = await webModel.Project.findById(req.body.id)
        if (!project)
            return res.status(400).json({ success: false, message: 'Project not found' });

        // update head list with only active users
        const existedUsers = await checkExistedUser(req.body.head, [userRole.RADIOLOGIST])
        if (existedUsers.length < 1)
            return res.status(400).json({
                success: false,
                message: 'Cannot update project when head list is empty, please check if user assigned to be head is valid'
            });

        // if new user is added to head, then add project id to the user's project list
        let newUsers = project.users
        await Promise.all(existedUsers.map(async id => {
            if (!newUsers.includes(id)) {
                newUsers.push(id)
                await webModel.User.findOneAndUpdate({ _id: id, status: userStatus.ACTIVE }, { $addToSet: { projects: project.id } })
            }
        }))

        // change project's head list and user list
        await webModel.Project.findByIdAndUpdate(req.body.id, { ...req.body, users: newUsers, head: existedUsers })

        return res.status(200).json({
            success: true,
            message: `Update project ${req.body.id} successfully`,
            data: project
        })
    } catch (e) {
        if (e.message.includes('duplicate key')) {
            return res.status(400).json({ success: false, message: 'Duplicate project name' })
        }
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// delete project by id
const deleteById = async (req, res) => {
    try {
        const project = await webModel.Project.findOneAndDelete({ _id: req.params.project_id })
        return res.status(200).json({
            success: true,
            message: `Delete project ${project.id} successfully`,
        })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

// manage project's user list
const manageUser = async (req, res) => {
    const validatedResult = manageValidator.validate(req.body)
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid input: ${(validatedResult.error.message)}` })
    }
    try {
        const project = await webModel.Project.findById(req.body.id);
        project.head.forEach((id) => {
            if (!req.body.users.includes(String(id)))
                throw new Error(`Invalid input: Cannot delete head user ${id}`)
        })

        // if user is inactive, then do not add that user to the project
        const existedUsers = await checkExistedUser(req.body.users, [userRole.RADIOLOGIST, userRole.CLINICIAN])

        // delete project from associated user's list
        await Promise.all(project.users.map(async (id) => {
            await webModel.User.findByIdAndUpdate(id, {
                $pullAll: {
                    projects: [project.id]
                }
            })
        }))

        // add project to associated user's list
        let users = []
        await Promise.all(existedUsers.map(async (userId) => {
            const user = await webModel.User.findByIdAndUpdate(userId['_id'], {
                $addToSet:
                {
                    projects: project.id
                }
            })
            users.push(user.id)
        }))

        await webModel.Project.findByIdAndUpdate(req.body.id, { users })

        return res.status(200).json({
            success: true,
            message: `Manage user list of project ${project.id} successfully`,
            data: existedUsers
        })
    } catch (e) {
        if (e.message.includes('head user'))
            return res.status(400).json({ success: false, message: e.message })
        return res.status(500).json({ success: false, message: 'Internal server error', error: e.message })
    }
}

module.exports = {
    create,
    getById,
    getByUserId,
    getAll,
    getTask,
    update,
    deleteById,
    manageUser
}