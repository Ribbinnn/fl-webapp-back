const Joi = require("joi");
const webModel = require("../models/webapp");
const PACS = require("../db/pacs").PACS;
const { modelStatus } = require('../utils/status')

const schema = {
  report_id: Joi.string().required(),
};

const updateSchema = {
  report_id: Joi.string().required(),
  note: Joi.string().allow(''),
  label: Joi.object({
    finding: Joi.array().items(Joi.string()),
  }).required(),
  user_id: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5)
};

const validator = Joi.object(schema);
const updateValidator = Joi.object(updateSchema);

const getById = async (req, res) => {
  const validatedResult = validator.validate({
    report_id: req.params.rid,
  });
  if (validatedResult.error) {
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid Report ID: ${validatedResult.error.message}`,
      });
  }
  try {
    const result = await webModel.PredResult.findById(req.params.rid);
    const classes = await webModel.PredClass.findOne({ result_id: result._id });
    const gradCam = await webModel.Gradcam.find({ result_id: result._id });
    const createdBy = await webModel.User.findById(result.created_by);
    const finalizedBy =
      (result.status === modelStatus.FINALIZED || result.status === modelStatus.HUMAN_ANNOTATED)
        ? await webModel.User.findById(result.finalized_by)
        : undefined;
    const project = await webModel.Project.findById(result.project_id);
    const record = await webModel.MedRecord.findById(result.record_id);
    const image = await webModel.Image.findById(result.image_id);

    return res.status(200).json({
      success: true,
      message: `Get report ${req.params.rid} successfully`,
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
      .json({ success: false, message: 'Internal server error', error: e.message });
  }
};

// delete report by id
const deleteById = async (req, res) => {
  const validatedResult = validator.validate({
    report_id: req.params.rid,
  });
  if (validatedResult.error) {
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid Report ID: ${validatedResult.error.message}`,
      });
  }
  try {
    const result = await webModel.PredResult.findOneAndDelete({ _id: req.params.rid });
    return res.status(200).json({
      success: true,
      message: `Delete report ${result._id} successfully`
    })
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: e.message });
  }
};

// update report when label is defined (finalized only when label is defined)
const update = async (req, res) => {
  const validatedResult = updateValidator.validate(req.body);
  if (validatedResult.error) {
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid input: ${validatedResult.error.message}`,
      });
  }
  try {
    // update fields that are finalized in pred class
    const predClass = await webModel.PredClass.findOne({
      result_id: req.body.report_id,
    });

    let selectedClass = predClass.prediction.map((item) => {
      item["selected"] = false;
      return item;
    });
    selectedClass = selectedClass.map((item) => {
      if (req.body.label["finding"].includes(item["finding"]))
        item["selected"] = true;
      return item;
    });
    await webModel.PredClass.findOneAndUpdate(
      { result_id: req.body.report_id },
      { prediction: selectedClass }
    );

    // calculate AI rating
    const report = await webModel.PredResult.findById(req.body.report_id).populate('project_id')

    const ratingCount = report.project_id.rating_count
    const projectRating = report.project_id.rating
    if (report.rating == 0) {
      await webModel.Project.findByIdAndUpdate(report.project_id._id, {
        rating: (req.body.rating + (ratingCount * projectRating)) / (ratingCount + 1),
        rating_count: ratingCount + 1
      })
    } else {
      await webModel.Project.findByIdAndUpdate(report.project_id._id, {
        rating: (req.body.rating + (ratingCount * projectRating) - report.rating) / ratingCount
      })
    }

    const data = await webModel.PredResult.findByIdAndUpdate(
      req.body.report_id,
      {
        note: req.body.note,
        label: req.body.label,
        status: modelStatus.HUMAN_ANNOTATED,
        finalized_by: req.body.user_id,
        rating: req.body.rating
      }
    );
    return res
      .status(200)
      .json({
        success: true,
        message: `Update report ${req.body.report_id} successfully`,
        data,
      });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: e.message });
  }
};

// view predicted reults log by project id
const viewHistory = async (req, res) => {
  if (!req.params.project_id) {
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid input: "project_id" is required`,
      });
  }
  try {
    // get predicted result
    const results = await webModel.PredResult.find({
      project_id: req.params.project_id,
    })
      .populate("record_id")
      .populate("created_by")
      .populate("image_id");

    let data = [];

    if (results) {
      await Promise.all(
        results.map(async (item) => {
          let finding = "";

          // get finding with the most confidence
          if (
            item.status === modelStatus.AI_ANNOTATED ||
            item.status === modelStatus.HUMAN_ANNOTATED ||
            item.status === modelStatus.FINALIZED
          ) {
            const predClass = await webModel.PredClass.findOne({
              result_id: item._id,
            });
            let mx = -1;
            let mk = -1;
            predClass.prediction.forEach((v, k) => {
              if (v.confidence > mx) {
                mx = v.confidence;
                mk = k;
              }
            });
            finding = predClass.prediction[mk].finding;
          }

          // if (item.status==="finalized") {
          //     finding = item.label.finding
          // }

          const hn = item.record_id.record.hn;
          const patientName = await PACS.findOne({ "Patient ID": String(hn) }, [
            "Patient Name",
          ]);

          data.push({
            pred_result_id: item.id,
            status: item.status,
            hn: hn,
            patient_name: patientName["Patient Name"],
            clinician_name: item.created_by.first_name,
            finding: finding,
            accession_no: item.image_id.accession_no,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          });
        })
      );
    }
    return res
      .status(200)
      .json({
        success: true,
        message: `Get all results by project ${req.params.project_id} successfully`,
        data,
      });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: e.message });
  }
};

// save report back to PACS
const saveToPACS = async (req, res) => {
  // request: params = report_id
  try {
    const report = await webModel.PredResult.findById(req.params.report_id).populate('project_id');

    // check if report's status is human-annoated and user is project's head
    if (!report || report.status !== modelStatus.HUMAN_ANNOTATED || !report.project_id.head.includes(req.user._id))
      return res
        .status(400)
        .json({
          success: false,
          message: !report.project_id.head.includes(req.user._id) ?
            `User must be project's head to save report ${req.params.report_id} back to PACS` :
            `Report's status must be 'Human-Annotated' to be saved to PACS`
        });

    /* SAVE TO PACS */

  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: e.message });
  }
}

module.exports = {
  getById,
  update,
  viewHistory,
  deleteById,
  saveToPACS
};
