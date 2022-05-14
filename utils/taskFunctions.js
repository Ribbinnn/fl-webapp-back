const fs = require('fs')
const path = require('path');

const getTaskReq = async (taskName) => {
    const taskPath = path.join(__dirname, "tasks", `${taskName}.json`);
    return JSON.parse(await fs.promises.readFile(taskPath));
}

const getTaskNames = async () => {
    const taskPath = path.join(__dirname, "tasks");
    const files = await fs.promises.readdir(taskPath);
    return files.map(file => file.split('.json')[0])
}

module.exports = {
    getTaskReq,
    getTaskNames
}