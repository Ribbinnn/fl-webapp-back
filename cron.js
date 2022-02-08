const CronJob = require('cron').CronJob;
const webModel = require('./models/webapp')
const axios = require('axios')

const job = new CronJob('0 1 * * *', async () => {
  console.log((new Date()).toLocaleDateString(), 'Start clearing dicom process');
  try {
    const response = (await axios.delete(process.env.PY_SERVER + '/api/pacs/clear')).data

    // Accession Number list to be used to find report and delete hn
    const accList = response.data
    imageIds = await webModel.Image.find({ "accession_no": { "$in": accList } }, ["_id"])
    results = await webModel.PredResult.find({ "image_id": { "$in": imageIds } })

    // delete hn and patient name from all associated reports
    await Promise.all(results.map(async result => {
      await webModel.Image.findByIdAndUpdate(result.image_id, {
        hn: null
      })
      await webModel.MedRecord.findByIdAndUpdate(result.record_id, {
        'record.hn': null
      })
      await webModel.PredResult.findByIdAndUpdate(result._id, {
        hn: null,
        patient_name: null,
      })
    }))
    console.log((new Date()).toLocaleDateString(), 'Finish clearing dicom process');
  } catch (e) {
    console.log((new Date()).toLocaleDateString(), '[Error]', e)
  }
});

job.start();