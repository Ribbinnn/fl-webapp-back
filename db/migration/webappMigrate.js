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

const prediction = [
  {
    "finding": "No Finding",
    "confidence": 0.27573996782302856,
    "selected": false,
    "threshold": 0.6230675578,
    "isPositive": false
  },
  {
    "finding": "Mass",
    "confidence": 0.003064417513087392,
    "selected": false,
    "threshold": 0.3871906698,
    "isPositive": false
  },
  {
    "finding": "Nodule",
    "confidence": 0.33192259073257446,
    "selected": false,
    "threshold": 0.3973264992,
    "isPositive": false
  },
  {
    "finding": "Lung Opacity",
    "confidence": 0.10383376479148865,
    "selected": false,
    "threshold": 0.3817337453,
    "isPositive": false
  },
  {
    "finding": "Patchy Opacity",
    "confidence": 0.005539996083825827,
    "selected": false,
    "threshold": 0.1769620031,
    "isPositive": false
  },
  {
    "finding": "Reticular Opacity",
    "confidence": 0.036761850118637085,
    "selected": false,
    "threshold": 0.1895534098,
    "isPositive": false
  },
  {
    "finding": "Reticulonodular Opacity",
    "confidence": 0.002486636396497488,
    "selected": false,
    "threshold": 0.5747563839,
    "isPositive": false
  },
  {
    "finding": "Nodular Opacity",
    "confidence": 0.0731302797794342,
    "selected": false,
    "threshold": 0.6876279712,
    "isPositive": false
  },
  {
    "finding": "Linear Opacity",
    "confidence": 0.009318945929408073,
    "selected": false,
    "threshold": 0.3714343011,
    "isPositive": false
  },
  {
    "finding": "Nipple Shadow",
    "confidence": 0.013178310357034206,
    "selected": false,
    "threshold": 0.1233664379,
    "isPositive": false
  },
  {
    "finding": "Osteoporosis",
    "confidence": 0.00043576533789746463,
    "selected": false,
    "threshold": 0.1537039429,
    "isPositive": false
  },
  {
    "finding": "Osteopenia",
    "confidence": 0.0011985679157078266,
    "selected": false,
    "threshold": 0.0570114627,
    "isPositive": false
  },
  {
    "finding": "Osteolytic Lesion",
    "confidence": 0.0024963540490716696,
    "selected": false,
    "threshold": 0.286719352,
    "isPositive": false
  },
  {
    "finding": "Fracture",
    "confidence": 0.1388310194015503,
    "selected": false,
    "threshold": 0.347702384,
    "isPositive": false
  },
  {
    "finding": "Healed Fracture",
    "confidence": 0.03100237064063549,
    "selected": false,
    "threshold": 0.6489098072,
    "isPositive": false
  },
  {
    "finding": "Old Fracture",
    "confidence": 0.042118411511182785,
    "selected": false,
    "threshold": 0.5180939436,
    "isPositive": false
  },
  {
    "finding": "Spondylosis",
    "confidence": 0.16517731547355652,
    "selected": false,
    "threshold": 0.3076757491,
    "isPositive": false
  },
  {
    "finding": "Scoliosis",
    "confidence": 0.024163585156202316,
    "selected": false,
    "threshold": 0.2380676866,
    "isPositive": false
  },
  {
    "finding": "Sclerotic Lesion",
    "confidence": 0.00928371399641037,
    "selected": false,
    "threshold": 0.3251270652,
    "isPositive": false
  },
  {
    "finding": "Mediastinal Mass",
    "confidence": 0.0022981218062341213,
    "selected": false,
    "threshold": 0.4449528158,
    "isPositive": false
  },
  {
    "finding": "Cardiomegaly",
    "confidence": 0.4129425287246704,
    "selected": false,
    "threshold": 0.4099305868,
    "isPositive": true
  },
  {
    "finding": "Pleural Effusion",
    "confidence": 0.002747146412730217,
    "selected": false,
    "threshold": 0.170565486,
    "isPositive": false
  },
  {
    "finding": "Pleural Thickening",
    "confidence": 0.006699377670884132,
    "selected": false,
    "threshold": 0.1786464006,
    "isPositive": false
  },
  {
    "finding": "Edema",
    "confidence": 0.001564030535519123,
    "selected": false,
    "threshold": 0.2325405926,
    "isPositive": false
  },
  {
    "finding": "Hiatal Hernia",
    "confidence": 9.830288036027923e-05,
    "selected": false,
    "threshold": 0.1721060127,
    "isPositive": false
  },
  {
    "finding": "Pneumothorax",
    "confidence": 0.000583312357775867,
    "selected": false,
    "threshold": 0.2610811889,
    "isPositive": false
  },
  {
    "finding": "Atelectasis",
    "confidence": 0.013617318123579025,
    "selected": false,
    "threshold": 0.6366727352,
    "isPositive": false
  },
  {
    "finding": "Subsegmental Atelectasis",
    "confidence": 0.0015408494509756565,
    "selected": false,
    "threshold": 0.0099582328,
    "isPositive": false
  },
  {
    "finding": "Elevation Of Hemidiaphragm",
    "confidence": 0.00041629798943176866,
    "selected": false,
    "threshold": 0.0423872843,
    "isPositive": false
  },
  {
    "finding": "Tracheal-Mediastinal Shift",
    "confidence": 6.76251293043606e-05,
    "selected": false,
    "threshold": 0.565830946,
    "isPositive": false
  },
  {
    "finding": "Volume Loss",
    "confidence": 6.639157072640955e-05,
    "selected": false,
    "threshold": 0.6945303679,
    "isPositive": false
  },
  {
    "finding": "Bronchiectasis",
    "confidence": 0.00029427374829538167,
    "selected": false,
    "threshold": 0.2106481194,
    "isPositive": false
  },
  {
    "finding": "Enlarged Hilum",
    "confidence": 0.004238585475832224,
    "selected": false,
    "threshold": 0.0333859064,
    "isPositive": false
  },
  {
    "finding": "Atherosclerosis",
    "confidence": 0.20150311291217804,
    "selected": false,
    "threshold": 0.1176939905,
    "isPositive": true
  },
  {
    "finding": "Tortuous Aorta",
    "confidence": 0.14627665281295776,
    "selected": false,
    "threshold": 0.3932620287,
    "isPositive": false
  },
  {
    "finding": "Calcified Tortuous Aorta",
    "confidence": 0.03279145434498787,
    "selected": false,
    "threshold": 0.3628055155,
    "isPositive": false
  },
  {
    "finding": "Calcified Aorta",
    "confidence": 0.021309519186615944,
    "selected": false,
    "threshold": 0.3663214743,
    "isPositive": false
  },
  {
    "finding": "Support Devices",
    "confidence": 0.02681363746523857,
    "selected": false,
    "threshold": 0.895901382,
    "isPositive": false
  },
  {
    "finding": "Surgical Material",
    "confidence": 0.00794508308172226,
    "selected": false,
    "threshold": 0.3150249124,
    "isPositive": false
  },
  {
    "finding": "Suboptimal Inspiration",
    "confidence": 0.003902374068275094,
    "selected": false,
    "threshold": 0.5532807112,
    "isPositive": false
  }
]

const focusingFinding = ['Pneumothorax', 'Mass', 'Nodule', 'Mediastinal Mass', 'Lung Opacity',
  'Pleural Effusion', 'Atelectasis', 'Tracheal-Mediastinal Shift', 'Volume Loss',
  'Osteolytic Lesion', 'Fracture', 'Sclerotic Lesion', 'Cardiomegaly', 'Bronchiectasis', 'original']

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