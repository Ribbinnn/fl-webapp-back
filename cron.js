const CronJob = require('cron').CronJob;
const webModel = require('./models/webapp')
const axios = require('axios')

const job = new CronJob('0 1 14,28 * *', () => {
  console.log('You will see this message every dayyy!!');
  axios.delete(process.env.PY_SERVER + '/api/pacs/clear').then(res => {
    console.log(res.data.message)
  }).catch(e => {
    console.log(e.response.data.message)
  })
});

job.start();