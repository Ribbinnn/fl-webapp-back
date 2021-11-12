const Joi = require("joi");
const webModel = require("../models/webapp");

const schema = {
  report_id: Joi.string().required(),
  user_id: Joi.string().required(),
};

const validator = Joi.object(schema);

const getById = async (req, res) => {
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
              json[item.charAt(0).toUpperCase() + item.slice(1)] = record.record[item];
            }
            return json;
          }, {}),
        record: Object.keys(record.record).reduce((json, item) => {
          if (!["hn", "gender", "age", "height", "weight"].includes(item) && item !== "entry_id" && item !== "measured_time") {
            json[item.charAt(0).toUpperCase() + item.slice(1)] = record.record[item];
          }
          return json;
        }, {}),
        image: image.accession_no,
        classes: classes.prediction,
        gradCam: gradCam.map((item) => {return item.finding}),
        note: result.note,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getById,
};
