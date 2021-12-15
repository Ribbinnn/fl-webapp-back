const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { modelStatus, userStatus } = require('../../utils/status');
const vitalsSeed = require('./vitalsMigrate');
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
    "selected": false
  },
  {
    "finding": "Mass",
    "confidence": 0.003064417513087392,
    "selected": false
  },
  {
    "finding": "Nodule",
    "confidence": 0.33192259073257446,
    "selected": false
  },
  {
    "finding": "Lung Opacity",
    "confidence": 0.10383376479148865,
    "selected": false
  },
  {
    "finding": "Patchy Opacity",
    "confidence": 0.005539996083825827,
    "selected": false
  },
  {
    "finding": "Reticular Opacity",
    "confidence": 0.036761850118637085,
    "selected": false
  },
  {
    "finding": "Reticulonodular Opacity",
    "confidence": 0.002486636396497488,
    "selected": false
  },
  {
    "finding": "Nodular Opacity",
    "confidence": 0.0731302797794342,
    "selected": false
  },
  {
    "finding": "Linear Opacity",
    "confidence": 0.009318945929408073,
    "selected": false
  },
  {
    "finding": "Nipple Shadow",
    "confidence": 0.013178310357034206,
    "selected": false
  },
  {
    "finding": "Osteoporosis",
    "confidence": 0.00043576533789746463,
    "selected": false
  },
  {
    "finding": "Osteopenia",
    "confidence": 0.0011985679157078266,
    "selected": false
  },
  {
    "finding": "Osteolytic Lesion",
    "confidence": 0.0024963540490716696,
    "selected": false
  },
  {
    "finding": "Fracture",
    "confidence": 0.1388310194015503,
    "selected": false
  },
  {
    "finding": "Healed Fracture",
    "confidence": 0.03100237064063549,
    "selected": false
  },
  {
    "finding": "Old Fracture",
    "confidence": 0.042118411511182785,
    "selected": false
  },
  {
    "finding": "Spondylosis",
    "confidence": 0.16517731547355652,
    "selected": false
  },
  {
    "finding": "Scoliosis",
    "confidence": 0.024163585156202316,
    "selected": false
  },
  {
    "finding": "Sclerotic Lesion",
    "confidence": 0.00928371399641037,
    "selected": false
  },
  {
    "finding": "Mediastinal Mass",
    "confidence": 0.0022981218062341213,
    "selected": false
  },
  {
    "finding": "Cardiomegaly",
    "confidence": 0.4129425287246704,
    "selected": false
  },
  {
    "finding": "Pleural Effusion",
    "confidence": 0.002747146412730217,
    "selected": false
  },
  {
    "finding": "Pleural Thickening",
    "confidence": 0.006699377670884132,
    "selected": false
  },
  {
    "finding": "Edema",
    "confidence": 0.001564030535519123,
    "selected": false
  },
  {
    "finding": "Hiatal Hernia",
    "confidence": 0.00009830288036027923,
    "selected": false
  },
  {
    "finding": "Pneumothorax",
    "confidence": 0.000583312357775867,
    "selected": false
  },
  {
    "finding": "Atelectasis",
    "confidence": 0.013617318123579025,
    "selected": false
  },
  {
    "finding": "Subsegmental Atelectasis",
    "confidence": 0.0015408494509756565,
    "selected": false
  },
  {
    "finding": "Elevation Of Hemidiaphragm",
    "confidence": 0.00041629798943176866,
    "selected": false
  },
  {
    "finding": "Tracheal-Mediastinal Shift",
    "confidence": 0.0000676251293043606,
    "selected": false
  },
  {
    "finding": "Volume Loss",
    "confidence": 0.00006639157072640955,
    "selected": false
  },
  {
    "finding": "Bronchiectasis",
    "confidence": 0.00029427374829538167,
    "selected": false
  },
  {
    "finding": "Enlarged Hilum",
    "confidence": 0.004238585475832224,
    "selected": false
  },
  {
    "finding": "Atherosclerosis",
    "confidence": 0.20150311291217804,
    "selected": false
  },
  {
    "finding": "Tortuous Aorta",
    "confidence": 0.14627665281295776,
    "selected": false
  },
  {
    "finding": "Calcified Tortuous Aorta",
    "confidence": 0.03279145434498787,
    "selected": false
  },
  {
    "finding": "Calcified Aorta",
    "confidence": 0.021309519186615944,
    "selected": false
  },
  {
    "finding": "Support Devices",
    "confidence": 0.02681363746523857,
    "selected": false
  },
  {
    "finding": "Surgical Material",
    "confidence": 0.00794508308172226,
    "selected": false
  },
  {
    "finding": "Suboptimal Inspiration",
    "confidence": 0.003902374068275094,
    "selected": false
  }
]

const focusingFinding = ['Pneumothorax', 'Mass', 'Nodule', 'Mediastinal Mass', 'Lung Opacity',
  'Pleural Effusion', 'Atelectasis', 'Tracheal-Mediastinal Shift', 'Volume Loss',
  'Osteolytic Lesion', 'Fracture', 'Sclerotic Lesion', 'Cardiomegaly', 'Bronchiectasis',]

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
      username: 'john',
      password: passwordHash,
      email: 'john@gmail.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'radiologist',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/13/2021'),
      updatedAt: new Date('10/14/2021')
    },
    {
      username: 'jane',
      password: passwordHash,
      email: 'jane@gmail.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'clinician',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/13/2021'),
      updatedAt: new Date('10/16/2021')
    },
    {
      username: 'lavy',
      password: passwordHash,
      email: 'lavy@gmail.com',
      first_name: 'Lavy',
      last_name: 'Smith',
      role: 'radiologist',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/13/2021'),
      updatedAt: new Date('10/13/2021')
    },
    {
      username: 'gigi',
      password: passwordHash,
      email: 'gigi@hotmail.com',
      first_name: 'Gigi',
      last_name: 'Hadid',
      role: 'clinician',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/13/2021'),
      updatedAt: new Date('10/13/2021')
    },
    {
      username: 'ian',
      password: passwordHash,
      email: 'ian@hotmail.com',
      first_name: 'Ian',
      last_name: 'Boston',
      role: 'clinician',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/13/2021'),
      updatedAt: new Date('10/13/2021')
    },
    {
      username: 'edward',
      password: passwordHash,
      email: 'edward@yahoo.com',
      first_name: 'Edward',
      last_name: 'Cullen',
      role: 'radiologist',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/13/2021'),
      updatedAt: new Date('10/13/2021')
    },
    {
      username: 'admin1',
      password: passwordHash,
      email: 'admin1@gmail.com',
      first_name: 'admin1',
      last_name: 'admin1',
      role: 'admin',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/1/2021'),
      updatedAt: new Date('10/1/2021')
    },
    {
      username: 'admin2',
      password: passwordHash,
      email: 'admin2@gmail.com',
      first_name: 'admin2',
      last_name: 'admin2',
      role: 'admin',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/1/2021'),
      updatedAt: new Date('10/1/2021')
    },
    {
      username: 'admin3',
      password: passwordHash,
      email: 'admin3@gmail.com',
      first_name: 'admin3',
      last_name: 'admin3',
      role: 'admin',
      token: '',
      projects: [],
      isChulaSSO: false,
      status: userStatus.ACTIVE,
      createdAt: new Date('10/1/2021'),
      updatedAt: new Date('10/1/2021')
    }
  ])

  userIds = {
    'John': user.insertedIds[0],
    'Jane': user.insertedIds[1],
    'Lavy': user.insertedIds[2],
    'Gigi': user.insertedIds[3],
    'Ian': user.insertedIds[4],
    'Edward': user.insertedIds[5]
  }

  const project = await Project.collection.insertMany([
    {
      name: 'COVID-19',
      task: 'classification_pylon_1024',
      description: '2D-classification for COVID-19',
      requirements: [
        { name: 'pulse', type: 'number', unit: 'bpm' },
        { name: 'weight', type: 'number', unit: 'kg' },
        { name: 'height', type: 'number', unit: 'cm' }
      ],
      predClasses: pylon_classes,
      users: [user.insertedIds[0], user.insertedIds[4], user.insertedIds[5]],
      head: [user.insertedIds[0]],
      createdAt: new Date('10/14/2021'),
      updatedAt: new Date('10/14/2021')
    },
    {
      name: 'Abnormal Detection',
      task: 'classification_pylon_1024',
      description: '2D_image_classification for abnormal detection',
      requirements: [{ name: 'fever', type: 'string', unit: 'none' }],
      predClasses: pylon_classes,
      users: [user.insertedIds[0], user.insertedIds[1], user.insertedIds[2], user.insertedIds[3], user.insertedIds[4], user.insertedIds[5]],
      head: [user.insertedIds[2]],
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
    {
      name: 'Tuberculosis',
      task: 'classification_pylon_1024',
      description: '2D-classification for Tuberculosis',
      requirements: [{ name: 'cough', type: 'string', unit: 'none' }],
      predClasses: pylon_classes,
      users: [user.insertedIds[2], user.insertedIds[3], user.insertedIds[4]],
      head: [user.insertedIds[4]],
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
    {
      name: 'Abnormal Detection (256)',
      task: 'classification_pylon_256',
      description: '2D_image_classification(256) for abnormal detection',
      requirements: [{ name: 'fever', type: 'string', unit: 'none' }],
      predClasses: pylon_classes,
      users: [user.insertedIds[0]],
      head: [user.insertedIds[0]],
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
  ])

  projectIds = { 'COVID-19': project.insertedIds[0], 'Abnormal Detection': project.insertedIds[1], 'Tuberculosis': project.insertedIds[2] }

  await User.collection.updateOne({ _id: user.insertedIds[0] }, { $set: { projects: [project.insertedIds[0], project.insertedIds[1], project.insertedIds[3]] } })
  await User.collection.updateOne({ _id: user.insertedIds[1] }, { $set: { projects: [project.insertedIds[1]] } })
  await User.collection.updateOne({ _id: user.insertedIds[2] }, { $set: { projects: [project.insertedIds[2], project.insertedIds[1]] } })
  await User.collection.updateOne({ _id: user.insertedIds[3] }, { $set: { projects: [project.insertedIds[1], project.insertedIds[2]] } })
  await User.collection.updateOne({ _id: user.insertedIds[4] }, { $set: { projects: [project.insertedIds[0], project.insertedIds[1], project.insertedIds[2]] } })
  await User.collection.updateOne({ _id: user.insertedIds[5] }, { $set: { projects: [project.insertedIds[0], project.insertedIds[1]] } })

  const record = await MedRecord.collection.insertMany([
    {
      project_id: project.insertedIds[0],
      record: {
        entry_id: 1,
        hn: 4149,
        gender: "female",
        age: 42,
        pulse: 76,
        weight: 53,
        height: 162,
        measured_time: new Date("2021-10-10T17:00:00.000Z"),
        updated_time: new Date("2021-10-10T17:00:00.000Z")
      },
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
    {
      project_id: project.insertedIds[1],
      record: {
        entry_id: 2,
        hn: 5566,
        gender: "female",
        age: 37,
        pulse: 83,
        weight: 47,
        height: 159,
        fever: "None",
        measured_time: new Date("2021-10-11T17:00:00.000Z"),
        updated_time: new Date("2021-10-11T17:00:00.000Z")
      },
      createdAt: new Date('10/17/2021'),
      updatedAt: new Date('10/17/2021')
    },
    {
      project_id: project.insertedIds[1],
      record: {
        entry_id: 3,
        hn: 4149,
        gender: "female",
        age: 42,
        pulse: 74,
        weight: 53,
        height: 162,
        fever: "down",
        measured_time: new Date("2021-10-12T17:00:00.000Z"),
        updated_time: new Date("2021-10-12T17:00:00.000Z")
      },
      createdAt: new Date('10/18/2021'),
      updatedAt: new Date('10/18/2021')
    },
    {
      project_id: project.insertedIds[2],
      record: {
        entry_id: 4,
        hn: 5566,
        gender: "female",
        age: 37,
        cough: "down",
        measured_time: new Date("2021-10-11T17:00:00.000Z"),
        updated_time: new Date("2021-10-11T17:00:00.000Z")
      },
      createdAt: new Date('10/19/2021'),
      updatedAt: new Date('10/19/2021')
    },
  ])

  const image = await Image.collection.insertMany([
    {
      project_id: project.insertedIds[0],
      accession_no: "74",
      hn: 4149,
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
    {
      project_id: project.insertedIds[1],
      accession_no: "82",
      hn: 5566,
      createdAt: new Date('10/17/2021'),
      updatedAt: new Date('10/17/2021')
    },
    {
      project_id: project.insertedIds[1],
      accession_no: "74",
      hn: 4149,
      createdAt: new Date('10/18/2021'),
      updatedAt: new Date('10/18/2021')
    },
    {
      project_id: project.insertedIds[2],
      accession_no: "82",
      hn: 5566,
      createdAt: new Date('10/19/2021'),
      updatedAt: new Date('10/19/2021')
    }
  ])

  const predResult = await PredResult.collection.insertMany([
    {
      record_id: record.insertedIds[0],
      image_id: image.insertedIds[0],
      project_id: project.insertedIds[0],
      hn: 4149,
      status: modelStatus.AI_ANNOTATED,
      label: "",
      note: "",
      created_by: user.insertedIds[5],
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
    {
      record_id: record.insertedIds[1],
      image_id: image.insertedIds[1],
      project_id: project.insertedIds[1],
      hn: 5566,
      status: modelStatus.AI_ANNOTATED,
      label: "",
      note: "",
      created_by: user.insertedIds[3],
      createdAt: new Date('10/17/2021'),
      updatedAt: new Date('10/17/2021')
    },
    {
      record_id: record.insertedIds[2],
      image_id: image.insertedIds[2],
      project_id: project.insertedIds[1],
      hn: 4149,
      status: modelStatus.HUMAN_ANNOTATED,
      label: { "finding": ["Pneumothorax"] },
      note: "Pneumothorax -Gigi",
      created_by: user.insertedIds[1],
      finalized_by: user.insertedIds[3],
      createdAt: new Date('10/18/2021'),
      updatedAt: new Date('10/18/2021')
    },
    {
      record_id: record.insertedIds[3],
      image_id: image.insertedIds[3],
      project_id: project.insertedIds[2],
      hn: 5566,
      status: modelStatus.HUMAN_ANNOTATED,
      label: { "finding": "Mass" },
      note: "Mass -Edward",
      created_by: user.insertedIds[2],
      finalized_by: user.insertedIds[4],
      createdAt: new Date('10/18/2021'),
      updatedAt: new Date('10/18/2021')
    }
  ])

  let mask = []
  let predClass = []
  for (let i = 0; i < 4; i++) {
    const date = 16 + i
    predClass.push({
      "result_id": predResult.insertedIds[i],
      "prediction": prediction,
      "createdAt": new Date(`10/${date.toString()}/2021`),
      "updatedAt": new Date(`10/${date.toString()}/2021`)
    })

    mask.push({
      "result_id": predResult.insertedIds[i],
      "data": [],
      "createdAt": new Date(`10/${date.toString()}/2021`),
      "updatedAt": new Date(`10/${date.toString()}/2021`)
    })
  }

  await PredClass.collection.insertMany(predClass)
  await Mask.collection.insertMany(mask)

  let gradcam = []
  for (let i = 0; i < 4; i++) {
    const date = 16 + i
    focusingFinding.map(finding => {
      gradcam.push({
        "result_id": predResult.insertedIds[i],
        "finding": finding,
        "gradcam_path": `results/0041018/classification_pylon_1024/${finding}.png`,
        // "gradcam_path": `results/0041018/${finding}.png`,
        "createdAt": new Date(`10/${date.toString()}/2021`),
        "updatedAt": new Date(`10/${date.toString()}/2021`)
      })
    })
  }

  await Gradcam.collection.insertMany(gradcam)

  mongoose.close()
}

const main = async () => {
  await webappSeed()
  await vitalsSeed(projectIds, userIds)
}

main()