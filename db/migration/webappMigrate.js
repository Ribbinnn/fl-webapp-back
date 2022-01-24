const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { modelStatus, userStatus, userRole } = require('../../utils/status');
const mongoose = require('../webapp')
const mg = require("mongoose");
const schema = new mg.Schema();

let projectIds = {}
let userIds = {}

dotenv.config();

const webappSeed = async () => {

  const Project = mongoose.model('projects', schema)
  const User = mongoose.model('users', schema)
  const MedRecord = mongoose.model('medrecords', schema)
  const PredResult = mongoose.model('pred_results', schema)
  const PredClass = mongoose.model('pred_classes', schema)
  const Mask = mongoose.model('masks', schema)
  const Image = mongoose.model('images', schema)
  const Gradcam = mongoose.model('gradcams', schema)

  await Project.collection.drop()
  await User.collection.drop()
  await MedRecord.collection.drop()
  await PredResult.collection.drop()
  await PredClass.collection.drop()
  await Mask.collection.drop()
  await Image.collection.drop()
  await Gradcam.collection.drop()

  const passwordHash = await bcrypt.hash('12345678', 10);

  const user = await User.collection.insertMany([
    {
      username: 'admin1',
      password: passwordHash,
      email: 'admin1@gmail.com',
      first_name: 'admin1',
      last_name: 'admin1',
      role: userRole.ADMIN,
      token: [],
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/1/2021'),
      updatedAt: new Date('10/1/2021')
    }
  ])

  
  mongoose.close()
}

const main = async () => {
  await webappSeed()
  // await vitalsSeed(projectIds, userIds)
}

main()