const webModel = require('../models/webapp');
const { userStatus } = require('./status');

// filter inactive users
const checkExistedUser = async (userList, role = [userRole.ADMIN, userRole.RADIOLOGIST, userRole.CLINICIAN]) => {
    try {
        const existedUsers = await webModel.User.find({
            _id: { $in: userList },
            role: { $in: role },
            status: userStatus.ACTIVE
        }, ['_id']);
        return existedUsers.map(user => user["_id"]);
    } catch (e) {
        throw e;
    }
}

const convertIdToShorthand = (id) => {
    return (parseInt(id.slice(0, 8) + id.slice(-3), 16)).toString(36)
}

module.exports = {
    checkExistedUser,
    convertIdToShorthand
}