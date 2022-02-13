const Joi = require("joi");
const webModel = require("../models/webapp");
const { modelStatus } = require("../utils/status");
const { convertIdToShorthand } = require('../utils/reusuableFunctions')

const schema = {
  report_id: Joi.string().required(),
};

const updateSchema = {
  report_id: Joi.string().required(),
  note: Joi.string().allow(""),
  label: Joi.object({
    finding: Joi.array().items(Joi.string()),
  }).required(),
  user_id: Joi.string().required(),
  rating: Joi.number().integer().min(0).max(5),
};

const validator = Joi.object(schema);
const updateValidator = Joi.object(updateSchema);

const getById = async (req, res) => {
  const validatedResult = validator.validate({
    report_id: req.params.rid,
  });
  if (validatedResult.error) {
    return res.status(400).json({
      success: false,
      message: `Invalid Report ID: ${validatedResult.error.message}`,
    });
  }
  try {
    const result = await webModel.PredResult.findById(req.params.rid).populate([
      { path: "record_id", select: "record" },
      { path: "image_id", select: "accession_no" },
      { path: "project_id", select: ["name", "head"] },
      { path: "created_by", select: ["first_name", "last_name"] },
      { path: "updated_by", select: ["first_name", "last_name"] },
    ]);
    const classes = await webModel.PredClass.findOne({ result_id: result._id }, ['prediction']);
    const gradCam = await webModel.Gradcam.find({ result_id: result._id }, ['finding']);

    return res.status(200).json({
      success: true,
      message: `Get report ${req.params.rid} successfully`,
      data: {
        result,
        no: convertIdToShorthand(result.id),
        patient: Object.keys(result.record_id.record).reduce((json, item) => {
          if (["gender", "age", "height", "weight"].includes(item)) {
            json[item.charAt(0).toUpperCase() + item.slice(1)] =
              result.record_id.record[item];
          }
          return json;
        }, {}),
        record: Object.keys(result.record_id.record).reduce((json, item) => {
          if (
            !["hn", "gender", "age", "height", "weight"].includes(item) &&
            item !== "entry_id" &&
            item !== "measured_time" &&
            item !== "updated_time"
          ) {
            json[item.charAt(0).toUpperCase() + item.slice(1)] =
              result.record_id.record[item];
          }
          return json;
        }, {}),
        classes: classes.prediction,
        gradCam: gradCam.map((item) => {
          return item.finding;
        }),
      },
    });
  } catch (e) {
    console.log(e.message)
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: e.message,
      });
  }
};

// delete report by id
const deleteById = async (req, res) => {
  const validatedResult = validator.validate({
    report_id: req.params.rid,
  });
  if (validatedResult.error) {
    return res.status(400).json({
      success: false,
      message: `Invalid Report ID: ${validatedResult.error.message}`,
    });
  }
  try {
    const result = await webModel.PredResult.findOneAndDelete({
      _id: req.params.rid,
    });
    return res.status(200).json({
      success: true,
      message: `Delete report ${result._id} successfully`,
    });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: e.message,
      });
  }
};

// update report
const update = async (req, res) => {
  const validatedResult = updateValidator.validate(req.body);
  if (validatedResult.error) {
    return res.status(400).json({
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
    if (req.body.rating && req.body.rating > 0) {
      const report = await webModel.PredResult.findById(
        req.body.report_id
      ).populate("project_id");

      const ratingCount = report.project_id.rating_count;
      const projectRating = report.project_id.rating;
      if (report.rating == 0) {
        await webModel.Project.findByIdAndUpdate(report.project_id._id, {
          rating:
            (req.body.rating + ratingCount * projectRating) / (ratingCount + 1),
          rating_count: ratingCount + 1,
        });
      } else {
        await webModel.Project.findByIdAndUpdate(report.project_id._id, {
          rating:
            (req.body.rating + ratingCount * projectRating - report.rating) /
            ratingCount,
        });
      }
    }

    const data = await webModel.PredResult.findByIdAndUpdate(
      req.body.report_id,
      {
        note: req.body.note,
        label: req.body.label,
        status: modelStatus.HUMAN_ANNOTATED,
        updated_by: req.body.user_id,
        rating: req.body.rating,
      }, { new: true }
    ).populate('updated_by', ["first_name", "last_name"]);
    return res.status(200).json({
      success: true,
      message: `Update report ${req.body.report_id} successfully`,
      data,
    });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: e.message,
      });
  }
};

// view predicted reults log by project id
const viewHistory = async (req, res) => {
  if (!req.params.project_id) {
    return res.status(400).json({
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
            let mxNeg = -1;
            let mkNeg = -1;
            predClass.prediction.forEach((v, k) => {
              if (v.isPositive && v.confidence > mx) {
                mx = v.confidence;
                mk = k;
              }
              if (!v.isPositive && v.confidence > mxNeg) {
                mxNeg = v.confidence;
                mkNeg = k;
              }
            });
            finding = mk != -1 ? predClass.prediction[mk].finding : predClass.prediction[mkNeg].finding;
          }

          // if (item.status==="finalized") {
          //     finding = item.label.finding
          // }

          data.push({
            pred_result_id: item.id,
            status: item.status,
            hn: item.hn,
            patient_name: item.patient_name,
            clinician_name: item.created_by.first_name,
            clinician_lastname: item.created_by.last_name,
            finding: finding,
            accession_no: item.image_id.accession_no,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            no: convertIdToShorthand(item.id)
          });
        })
      );
    }
    return res.status(200).json({
      success: true,
      message: `Get all results by project ${req.params.project_id} successfully`,
      data,
    });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: e.message,
      });
  }
};

module.exports = {
  getById,
  update,
  viewHistory,
  deleteById,
};
