const webModel = require('../models/webapp');
const { userStatus } = require('./status');

const checkExistedUser = async (userList) => {
    try {
        const existedUsers = await webModel.User.find({ _id: { $in: userList }, status: userStatus.ACTIVE }, ['_id']);
        return existedUsers.map(user => user["_id"]);
    } catch (e) {
        throw e;
    }
}

module.exports = {
    checkExistedUser
}