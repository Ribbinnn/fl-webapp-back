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

const webappSeed = async () => {
    mongoose.connect('mongodb://localhost/webapp');

    const schema = new mongoose.Schema()

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
                hn: 4149,
                gender: "female",
                age: 42,
                pulse: 76,
                weight: 53,
                height: 162,
                measured_time: "2021-10-10T17:00:00.000Z"
              },
            createdAt: new Date('10/16/2021'),
            updatedAt: new Date('10/16/2021')
        }
    ])

    const image = await Image.collection.insertMany([
        {
            project_id: project.insertedIds[0],
            accession_no: "74",
            createdAt: new Date('10/16/2021'),
            updatedAt: new Date('10/16/2021')
        }
    ])

    const predResult = await PredResult.collection.insertMany([
        {
            record_id: record.insertedIds[0],
            image_id: image.insertedIds[0],
            project_id: project.insertedIds[0],
            status: "annotated",
            label: "",
            note: "",
            created_by: user.insertedIds[0],
            createdAt: new Date('10/16/2021'),
            updatedAt: new Date('10/16/2021')
        }
    ])

    const predClass = await PredClass.collection.insertMany([
        {
            result_id: predResult.insertedIds[0],
            prediction: prediction,
            createdAt: new Date('10/16/2021'),
            updatedAt: new Date('10/16/2021')
        }
    ])

    const gradcam = await Gradcam.collection.insertMany([
        {
            "result_id": predResult.insertedIds[0],
            "finding": "Atelectasis",
            "gradcam_path": "results/0041018/Atelectasis.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Bronchiectasis",
            "gradcam_path": "results/0041018/Bronchiectasis.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Cardiomegaly",
            "gradcam_path": "results/0041018/Cardiomegaly.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Fracture",
            "gradcam_path": "results/0041018/Fracture.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Lung Opacity",
            "gradcam_path": "results/0041018/Lung Opacity.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Mass",
            "gradcam_path": "results/0041018/Mass.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Mediastinal Mass",
            "gradcam_path": "results/0041018/Mediastinal Mass.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Nodule",
            "gradcam_path": "results/0041018/Nodule.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Osteolytic Lesion",
            "gradcam_path": "results/0041018/Osteolytic Lesion.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Pleural Effusion",
            "gradcam_path": "results/0041018/Pleural Effusion.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Pneumothorax",
            "gradcam_path": "results/0041018/Pneumothorax.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Sclerotic Lesion",
            "gradcam_path": "results/0041018/Sclerotic Lesion.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Tracheal-Mediastinal Shift",
            "gradcam_path": "results/0041018/Tracheal-Mediastinal Shift.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        },{
            "result_id": predResult.insertedIds[0],
            "finding": "Volume Loss",
            "gradcam_path": "results/0041018/Volume Loss.png",
            "createdAt": new Date('10/16/2021'),
            "updatedAt": new Date('10/16/2021')
        }
    ])

    mongoose.disconnect();
}

webappSeed()