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

module.exports = {
    checkExistedUser
}