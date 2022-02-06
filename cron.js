const CronJob = require('cron').CronJob;
const webModel = require('./models/webapp')

const job = new CronJob('0 1 14,28 * *', async () => {
  console.log('You will see this message every dayyy!!');
});

job.start();