const Joi = require("joi");
const webModel = require("../models/webapp");
const PACS = require("../db/pacs").PACS

const schema = {
  report_id: Joi.string().required(),
};

const updatedSchema = {
  report_id: Joi.string().required(),
  note: Joi.string(),
  label: Joi.object(),
  user_id: Joi.object().required()
}

const validator = Joi.object(schema);
const updatedValidator = Joi.object(updatedSchema);

const getById = async (req, res) => {
    const validatedResult = validator.validate({
        report_id: req.params.rid,
    })
    if (validatedResult.error) {
        return res.status(400).json({ success: false, message: `Invalid Report ID: ${(validatedResult.error.message)}` })
    }
  try {
    const result = await webModel.PredResult.findById(req.params.rid);
    const classes = await webModel.PredClass.findOne({ result_id: result._id });
    const gradCam = await webModel.Gradcam.find({ result_id: result._id });
    const createdBy = await webModel.User.findById(result.created_by);
    const finalizedBy =
      result.status === "finalized"
        ? await webModel.User.findById(result.finalized_by)
        : undefined;
    const project = await webModel.Project.findById(result.project_id);
    const record = await webModel.MedRecord.findById(result.record_id);
    const image = await webModel.Image.findById(result.image_id);

    return res.status(200).json({
      success: true,
      message: "Get report successfully",
      data: {
        status: result.status,
        created_by: `${createdBy.first_name} ${createdBy.last_name}`,
        created_at: result.createdAt,
        finalized_by: finalizedBy
          ? `${finalizedBy.first_name} ${finalizedBy.last_name}`
          : "",
        updated_at: result.updatedAt,
        project: {
          Name: project.name,
          Task: project.task,
          Description: project.description,
          Classes: project.predClasses,
          Requirement: project.requirements,
        },
        HN: record.record.hn,
        patient: Object.keys(record.record).reduce((json, item) => {
          if (["gender", "age", "height", "weight"].includes(item)) {
            json[item.charAt(0).toUpperCase() + item.slice(1)] =
              record.record[item];
          }
          return json;
        }, {}),
        record: Object.keys(record.record).reduce((json, item) => {
          if (
            !["hn", "gender", "age", "height", "weight"].includes(item) &&
            item !== "entry_id" &&
            item !== "measured_time" &&
            item !== "updated_time"
          ) {
            json[item.charAt(0).toUpperCase() + item.slice(1)] =
              record.record[item];
          }
          return json;
        }, {}),
        image: image.accession_no,
        classes: classes.prediction,
        gradCam: gradCam.map((item) => {
          return item.finding;
        }),
        note: result.note,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// update report when label is defined (finalized only when label is defined)
const update = async (req, res) => {
  const validatedResult = updatedValidator.validate(req.body)
  if (validatedResult.error) {
    return res.status(400).json({ success: false, message: `Invalid report input: ${(validatedResult.error.message)}` })
  }
  try {
    const data = await webModel.PredResult.findByIdAndUpdate(req.body.report_id, {
      note: req.body.note,
      label: req.body.label,
      status: req.body.label? "finalized": undefined,
      finalized_by: req.body.label? req.body.user_id: undefined // should get user_id from requestBody
    })
    return res.status(200).json({success: true, message: `Update report ${req.body.report_id} successfully`, data})
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// view predicted reults log by project id
const viewHistory = async (req, res) => {
  if (!req.params.project_id) {
      return res.status(400).json({ success: false, message: `Invalid query: "project_id" is required` })
  }
  try {
      // get predicted result
      const results = await webModel.PredResult.find({ project_id: req.params.project_id })
          .populate("record_id")
          .populate("created_by")
          .populate("image_id")

      let data = []

      if (results) {
          await Promise.all(results.map(async (item) => {
              let finding = ""

              // get finding with the most confidence
              if (item.status === "annotated" || item.status === "finalized") {
                  const predClass = await webModel.PredClass.findOne({ result_id: item._id })
                  let mx = -1
                  let mk = -1
                  predClass.prediction.forEach((v, k) => {
                      if (v.confidence > mx) {
                          mx = v.confidence
                          mk = k
                      }
                  })
                  finding = predClass.prediction[mk].finding
              }

              // if (item.status==="finalized") {
              //     finding = item.label.finding
              // }

              const hn = item.record_id.record.hn
              const patientName = await PACS.findOne({ 'Patient ID': String(hn) }, ['Patient Name'])

              data.push({
                  pred_result_id: item.id,
                  status: item.status,
                  hn: hn,
                  patient_name: patientName['Patient Name'],
                  clinician_name: item.created_by.first_name,
                  finding: finding,
                  accession_no: item.image_id.accession_no,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
              })
          }))
      }
      return res.status(200).json({ success: true, message: `Get all results by project ${req.params.project_id} successfully`, data });
  } catch (e) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getById,
  update,
  viewHistory
};
