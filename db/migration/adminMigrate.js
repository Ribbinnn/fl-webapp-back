const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { userStatus, userRole } = require('../../utils/status');
const dotenv = require('dotenv');

dotenv.config()

const adminSeed = async () => {
    const passwordHash = await bcrypt.hash('12345678', 10);

    mongoose.connect(process.env.webappDB);

    const schema = new mongoose.Schema()

    const User = mongoose.model('users', schema)

    const admin = await User.collection.findOne({ username: 'admin-fl' })

    if (!admin) {
        await User.collection.insertMany([
            {
                username: 'admin-fl',
                password: passwordHash,
                email: 'admin_fl@gmail.com',
                first_name: 'admin',
                last_name: 'fl',
                role: userRole.ADMIN,
                token: [],
                projects: [],
                isChulaSSO: false,
                status: userStatus.ACTIVE,
                createdAt: new Date('10/1/2021'),
                updatedAt: new Date('10/1/2021')
            }
        ])
    }
    mongoose.disconnect();
}


adminSeed()
