const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

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
    'Suboptimal Inspiration']

const webappSeed = async () => {
    mongoose.connect('mongodb://localhost/webapp');

    const schema = new mongoose.Schema()

    const Project = mongoose.model('projects', schema)
    const User = mongoose.model('users', schema)
    const MedRecord = mongoose.model('medrecords', schema)
    const PredResults = mongoose.model('pred_results', schema)
    const PredClasses = mongoose.model('pred_classes', schema)
    const Mask = mongoose.model('masks', schema)
    const Image = mongoose.model('images', schema)
    const Gradcam = mongoose.model('gradcams', schema)

    await Project.collection.drop()
    await User.collection.drop()
    await MedRecord.collection.drop()
    await PredResults.collection.drop()
    await PredClasses.collection.drop()
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
            role: 'clinician',
            token: '',
            projects: [],
            createdAt: new Date('10/13/2021'),
            updatedAt: new Date('10/14/2021')
        },
        {
            username: 'jane',
            password: passwordHash,
            email: 'jane@gmail.com',
            first_name: 'Jane',
            last_name: 'Smith',
            role: 'radiologist',
            token: '',
            projects: [],
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
            createdAt: new Date('10/13/2021'),
            updatedAt: new Date('10/13/2021')
        }
    ])

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
            users: [user.insertedIds[0]],
            createdAt: new Date('10/14/2021'),
            updatedAt: new Date('10/14/2021')
        },
        {
            name: 'Pneumonia',
            task: 'classification_pylon_1024',
            description: '2D-classification for Pneumonia',
            requirements: [{ name: 'fever', type: 'string', unit: 'none' }],
            predClasses: pylon_classes,
            users: [user.insertedIds[1]],
            createdAt: new Date('10/16/2021'),
            updatedAt: new Date('10/16/2021')
        },
    ])

    await User.collection.updateOne({ _id: user.insertedIds[0] }, { $set: { projects: [project.insertedIds[0]] } })
    await User.collection.updateOne({ _id: user.insertedIds[1] }, { $set: { projects: [project.insertedIds[1]] } })

    const record = await MedRecord.collection.insertMany([
        {
            project_id: project.insertedIds[0],
            record: {
                entry_id: 1,
                hn: 1001,
                gender: 'female',
                age: 20,
                pulse: 82,
                weight: 41,
                height: 154
              },
            createdAt: new Date('10/16/2021'),
            updatedAt: new Date('10/16/2021')
        },
        {
            project_id: project.insertedIds[0],
            record: {
                entry_id: 2,
                hn: 1002,
                gender: 'male',
                age: 42,
                pulse: 75,
                weight: 65,
                height: 167
              },
            createdAt: new Date('10/16/2021'),
            updatedAt: new Date('10/16/2021')
        },
        {
            project_id: project.insertedIds[1],
            record: {
                entry_id: 10,
                hn: 1011,
                gender: 'male',
                age: 12,
                fever: 'none'
            },
            createdAt: new Date('10/18/2021'),
            updatedAt: new Date('10/18/2021')
        },
    ])

    mongoose.disconnect();
}

webappSeed()