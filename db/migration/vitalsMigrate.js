const mongoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config()

const vitalsSeed = async () => {
  mongoose.connect(process.env.vitalsDB);
  
  const schema = new mongoose.Schema()

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
      createdAt: new Date('10/15/2021'),
      updatedAt: new Date('10/15/2021')
    },
    {
      name: 'Pneumonia',
      clinician_first_name: 'Jane',
      clinician_last_name: 'Smith',
      record_name: 'pneumonia_record',
      createdAt: new Date('10/17/2021'),
      updatedAt: new Date('10/17/2021')
    }
  ])

  let records = [];
  for (let i=0;i<10;i++) {
    records.push({
      entry_id: 10 + i,
      hn: 1011 + i,
      gender: i%2==0? 'male': 'female',
      age: 12 + i,
      fever: i%4==0? 'none': i%4==1? 'stay': i%4==2? 'up': 'down'
    })
  }

  const record = await Record.collection.insertMany([
    {
      project_id: project.insertedIds[0],
      records: [
        {
          entry_id: 1,
          hn: 1001,
          gender: 'female',
          age: 20,
          pulse: 82,
          weight: 41,
          height: 154,
          measured_time: new Date('10/14/2021'),
          updated_time: new Date('10/14/2021'),
        },
        {
          entry_id: 2,
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
          entry_id: 3,
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
    }
  ])

  mongoose.disconnect();
}


vitalsSeed()
