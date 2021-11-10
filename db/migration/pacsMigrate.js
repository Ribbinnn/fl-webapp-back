const mongoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config()

const pacsSeed = async () => {
    mongoose.connect(process.env.pacsDB);

    const schema = new mongoose.Schema()

    const PACS = mongoose.model('pacs', schema)

    await PACS.collection.drop()

    const pacs = await PACS.collection.insertMany([
        {
            "Accession No": "74",
            "Patient ID": "4149",
            "Proc Description": "Chest PA upright",
            "Modality": "DX",
            "Study Date Time": new Date("2/5/2021"),
            "Image Count": "1",
            "Procedure Code": "R1201",
            "Primary location": "KCMH",
            "Patient Name": "Linnet Campo",
            "Last Modified Timestamp": new Date("2/5/2021"),
            "Status": "Finalized",
            "filepath": "uploads/0041018.dcm"
        },
        {
            "Accession No": "81",
            "Patient ID": "9477",
            "Proc Description": "Chest PA upright",
            "Modality": "DX",
            "Study Date Time": new Date("3/5/2021"),
            "Image Count": "1",
            "Procedure Code": "R1201",
            "Primary location": "KCMH",
            "Patient Name": "Marika McNiven",
            "Last Modified Timestamp": new Date("3/5/2021"),
            "Status": "Finalized",
            "filepath": "uploads/0041054.dcm"
        },
        {
            "Accession No": "47",
            "Patient ID": "5542",
            "Proc Description": "Chest PA upright",
            "Modality": "DX",
            "Study Date Time": new Date("4/5/2021"),
            "Image Count": "1",
            "Procedure Code": "R1201",
            "Primary location": "KCMH",
            "Patient Name": "Thera Sharp",
            "Last Modified Timestamp": new Date("4/5/2021"),
            "Status": "Finalized",
            "filepath": "uploads/0041099.dcm"
        },
        {
            "Accession No": "82",
            "Patient ID": "5566",
            "Proc Description": "Chest PA upright",
            "Modality": "DX",
            "Study Date Time": new Date("5/5/2021"),
            "Image Count": "1",
            "Procedure Code": "R1201",
            "Primary location": "KCMH",
            "Patient Name": "Serina Harford",
            "Last Modified Timestamp": new Date("5/5/2021"),
            "Status": "Finalized",
            "filepath": "uploads/0041018.dcm"
          },{
            "Accession No": "14",
            "Patient ID": "6243",
            "Proc Description": "Chest PA upright",
            "Modality": "DX",
            "Study Date Time": new Date("6/5/2021"),
            "Image Count": "1",
            "Procedure Code": "R1201",
            "Primary location": "KCMH",
            "Patient Name": "Ardith Colton",
            "Last Modified Timestamp": new Date("6/5/2021"),
            "Status": "Finalized",
            "filepath": "uploads/0041054.dcm"
          },{
            "Accession No": "22",
            "Patient ID": "9284",
            "Proc Description": "Chest PA upright",
            "Modality": "DX",
            "Study Date Time": new Date("7/5/2021"),
            "Image Count": "1",
            "Procedure Code": "R1201",
            "Primary location": "KCMH",
            "Patient Name": "Doria Holland",
            "Last Modified Timestamp": new Date("7/5/2021"),
            "Status": "Finalized",
            "filepath": "uploads/0041099.dcm"
          },{
            "Accession No": "69",
            "Patient ID": "4149",
            "Proc Description": "Chest PA upright",
            "Modality": "DX",
            "Study Date Time": new Date("8/5/2021"),
            "Image Count": "1",
            "Procedure Code": "R1201",
            "Primary location": "KCMH",
            "Patient Name": "Linnet Campo",
            "Last Modified Timestamp": new Date("8/5/2021"),
            "Status": "Finalized",
            "filepath": "uploads/0041099.dcm"
          }
    ])

    mongoose.disconnect();
}


pacsSeed()
