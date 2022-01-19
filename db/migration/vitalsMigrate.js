const mongoose = require('../vitals')
const dotenv = require('dotenv');
const mg = require("mongoose");
const schema = new mg.Schema();

dotenv.config()

const vitalsSeed = async (projectIds, userIds) => {

  const Project = mongoose.model('projects', schema)
  const Record = mongoose.model('records', schema)

  await Project.collection.drop()
  await Record.collection.drop()


  const project = await Project.collection.insertMany([
    {
      name: 'COVID-19',
      clinician_first_name: 'John',
      clinician_last_name: 'Doe',
      record_name: 'covid_record',
      webproject_id: projectIds['COVID-19'],
      user_id: userIds['John'],
      createdAt: new Date('10/15/2021'),
      updatedAt: new Date('10/15/2021')
    },
    {
      name: 'Tuberculosis',
      clinician_first_name: 'Ian',
      clinician_last_name: 'Boston',
      record_name: 'tuberculosis_record',
      webproject_id: projectIds['Tuberculosis'],
      user_id: userIds['Ian'],
      createdAt: new Date('10/17/2021'),
      updatedAt: new Date('10/17/2021')
    },
    {
      name: 'Abnormal Detection',
      clinician_first_name: 'Lavy',
      clinician_last_name: 'Smith',
      record_name: 'abnormal_record',
      webproject_id: projectIds['Abnormal Detection'],
      user_id: userIds['Lavy'],
      createdAt: new Date('10/17/2021'),
      updatedAt: new Date('10/17/2021')
    },
    {
      name: 'COVID-19',
      clinician_first_name: 'Jane',
      clinician_last_name: 'Smith',
      record_name: 'covid_record2',
      webproject_id: projectIds['COVID-19'],
      user_id: userIds['Jane'],
      createdAt: new Date('10/16/2021'),
      updatedAt: new Date('10/16/2021')
    },
    {
      name: 'Tuberculosis',
      clinician_first_name: 'Gigi',
      clinician_last_name: 'Hadid',
      record_name: 'tuberculosis_record2',
      webproject_id: projectIds['Tuberculosis'],
      user_id: userIds['Gigi'],
      createdAt: new Date('10/18/2021'),
      updatedAt: new Date('10/18/2021')
    },
    {
      name: 'Abnormal Detection',
      clinician_first_name: 'Edward',
      clinician_last_name: 'Cullen',
      record_name: 'abnormal_record2',
      webproject_id: projectIds['Abnormal Detection'],
      user_id: userIds['Edward'],
      createdAt: new Date('10/18/2021'),
      updatedAt: new Date('10/18/2021')
    },
    {
      name: 'Abnormal Detection',
      clinician_first_name: 'Lavy',
      clinician_last_name: 'Smith',
      record_name: 'abnormal_record3',
      webproject_id: projectIds['Abnormal Detection'],
      user_id: userIds['Lavy'],
      createdAt: new Date('10/18/2021'),
      updatedAt: new Date('10/18/2021')
    },
  ])

  let records = [];

  for (let i = 0; i < 10; i++) {
    records.push({
      entry_id: 100 + i,
      hn: 1234567 + i,
      gender: i % 2 == 0 ? 'male' : 'female',
      age: 28 + i,
      pulse: 75 + i,
      weight: i % 2 == 0 ? 48 + i : 58 + i,
      height: i % 2 == 0 ? 156 + i : 165 + i,
      fever: i % 4 == 0 ? 'none' : i % 4 == 1 ? 'stay' : i % 4 == 2 ? 'up' : 'down',
      cough: i % 4 == 1 ? 'none' : i % 4 == 2 ? 'stay' : i % 4 == 3 ? 'up' : 'down',
      measured_time: new Date('10/14/2021'),
      updated_time: new Date('10/14/2021'),
    })
  }

  const record = await Record.collection.insertMany([
    {
      project_id: project.insertedIds[0],
      records: [
        {
          entry_id: 1,
          hn: 1234567,
          gender: "female",
          age: 42,
          pulse: 76,
          weight: 53,
          height: 162,
          measured_time: new Date("2021-10-10T17:00:00.000Z"),
          updated_time: new Date("2021-10-10T17:00:00.000Z")
        },
        {
          entry_id: 11,
          hn: 5566,
          gender: 'female',
          age: 20,
          pulse: 82,
          weight: 41,
          height: 154,
          measured_time: new Date('10/14/2021'),
          updated_time: new Date('10/14/2021'),
        },
        {
          entry_id: 12,
          hn: 1002,
          gender: 'male',
          age: 42,
          pulse: 75,
          weight: 65,
          height: 167,
          measured_time: new Date('10/14/2021'),
          updated_time: new Date('10/14/2021'),
        },
        {
          entry_id: 13,
          hn: 1003,
          gender: 'female',
          age: 67,
          pulse: 73,
          weight: 49,
          height: 158,
          measured_time: new Date('10/14/2021'),
          updated_time: new Date('10/14/2021'),
        },
      ],
      createdAt: new Date('10/15/2021'),
      updatedAt: new Date('10/15/2021')
    },
    {
      project_id: project.insertedIds[1],
      records: records,
      createdAt: new Date('10/17/2021'),
      updatedAt: new Date('10/17/2021')
    },
    {
      project_id: project.insertedIds[2],
      records: records,
      createdAt: new Date('10/19/2021'),
      updatedAt: new Date('10/19/2021')
    },
    {
      project_id: project.insertedIds[3],
      records: records,
      createdAt: new Date('10/20/2021'),
      updatedAt: new Date('10/20/2021')
    },
    {
      project_id: project.insertedIds[4],
      records: records,
      createdAt: new Date('10/21/2021'),
      updatedAt: new Date('10/21/2021')
    },
    {
      project_id: project.insertedIds[5],
      records: records,
      createdAt: new Date('10/22/2021'),
      updatedAt: new Date('10/22/2021')
    },
    {
      project_id: project.insertedIds[6],
      records: [
        {
          entry_id: 51,
          hn: 4149,
          gender: "female",
          age: 42,
          fever: "none",
          measured_time: new Date('10/22/2021'),
          updated_time: new Date('10/22/2021'),
        },
      ],
      createdAt: new Date('10/23/2021'),
      updatedAt: new Date('10/23/2021')
    },
  ])
  mongoose.close()
}

module.exports = vitalsSeed
