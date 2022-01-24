const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { modelStatus, userStatus, userRole } = require('../../utils/status');
const mongoose = require('../webapp')
const mg = require("mongoose");
const schema = new mg.Schema();

let projectIds = {}
let userIds = {}

const pylon_classes = [
  'No Finding',
  'Mass',
  'Nodule',
  'Lung Opacity',
  'Patchy Opacity',
  'Reticular Opacity',
  'Reticulonodular Opacity',
  'Nodular Opacity',
  'Linear Opacity',
  'Nipple Shadow',
  'Osteoporosis',
  'Osteopenia',
  'Osteolytic Lesion',
  'Fracture',
  'Healed Fracture',
  'Old Fracture',
  'Spondylosis',
  'Scoliosis',
  'Sclerotic Lesion',
  'Mediastinal Mass',
  'Cardiomegaly',
  'Pleural Effusion',
  'Pleural Thickening',
  'Edema',
  'Hiatal Hernia',
  'Pneumothorax',
  'Atelectasis',
  'Subsegmental Atelectasis',
  'Elevation Of Hemidiaphragm',
  'Tracheal-Mediastinal Shift',
  'Volume Loss',
  'Bronchiectasis',
  'Enlarged Hilum',
  'Atherosclerosis',
  'Tortuous Aorta',
  'Calcified Tortuous Aorta',
  'Calcified Aorta',
  'Support Devices',
  'Surgical Material',
  'Suboptimal Inspiration'
]

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
    },
    {
      username: 'user',
      password: passwordHash,
      email: 'user@gmail.com',
      first_name: 'user',
      last_name: 'user',
      role: userRole.RADIOLOGIST,
      token: [],
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/1/2021'),
      updatedAt: new Date('10/1/2021')
    }
  ])

  const project = await Project.collection.insertMany([
    {
      name: 'Abnormal Detection',
      task: 'classification_pylon_1024',
      description: '2D_image_classification for abnormal detection',
      requirements: [],
      predClasses: pylon_classes,
      users: [user.insertedIds[1]],
      head: [user.insertedIds[1]],
      rating: 0,
      rating_count: 0,
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
  ])

  await User.collection.updateOne({ _id: user.insertedIds[1] }, { $set: { projects: [project.insertedIds[0]] } })


  mongoose.close()
}

const main = async () => {
  await webappSeed()
  // await vitalsSeed(projectIds, userIds)
}

main()