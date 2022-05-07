// AI task
const tasks = {
    // "classification_pylon_256": [],
    "classification_pylon_1024": [],
    "covid19_admission": [
        {
            'name': 'body_temperature_day1_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_peripheral_o2_saturation_day1_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_peripheral_o2_saturation_day1_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_pulse_rate_day1_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_pulse_rate_day1_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_dyspnea_day1_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_dyspnea_day1_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        { 'name': 'fever_day1_0', 'required': false, 'type': 'string', 'unit': 'none' },
        { 'name': 'cough_day1_0', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'runny_nose_day1_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'sore_throat_day1_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        { 'name': 'smell_day1_0', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'diarrhea_day1_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'body_temperature_day1_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_peripheral_o2_saturation_day1_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_peripheral_o2_saturation_day1_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_pulse_rate_day1_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_pulse_rate_day1_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_dyspnea_day1_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_dyspnea_day1_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        { 'name': 'fever_day1_1', 'required': false, 'type': 'string', 'unit': 'none' },
        { 'name': 'cough_day1_1', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'runny_nose_day1_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'sore_throat_day1_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        { 'name': 'smell_day1_1', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'diarrhea_day1_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'body_temperature_day2_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_peripheral_o2_saturation_day2_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_peripheral_o2_saturation_day2_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_pulse_rate_day2_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_pulse_rate_day2_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_dyspnea_day2_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_dyspnea_day2_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        { 'name': 'fever_day2_0', 'required': false, 'type': 'string', 'unit': 'none' },
        { 'name': 'cough_day2_0', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'runny_nose_day2_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'sore_throat_day2_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        { 'name': 'smell_day2_0', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'diarrhea_day2_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'body_temperature_day2_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_peripheral_o2_saturation_day2_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_peripheral_o2_saturation_day2_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_pulse_rate_day2_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_pulse_rate_day2_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_dyspnea_day2_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_dyspnea_day2_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        { 'name': 'fever_day2_1', 'required': false, 'type': 'string', 'unit': 'none' },
        { 'name': 'cough_day2_1', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'runny_nose_day2_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'sore_throat_day2_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        { 'name': 'smell_day2_1', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'diarrhea_day2_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'body_temperature_day3_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_peripheral_o2_saturation_day3_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_peripheral_o2_saturation_day3_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_pulse_rate_day3_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_pulse_rate_day3_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_dyspnea_day3_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_dyspnea_day3_0',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        { 'name': 'fever_day3_0', 'required': false, 'type': 'string', 'unit': 'none' },
        { 'name': 'cough_day3_0', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'runny_nose_day3_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'sore_throat_day3_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        { 'name': 'smell_day3_0', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'diarrhea_day3_0',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'body_temperature_day3_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_peripheral_o2_saturation_day3_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_peripheral_o2_saturation_day3_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_pulse_rate_day3_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_pulse_rate_day3_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'pre_dyspnea_day3_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        {
            'name': 'post_dyspnea_day3_1',
            'required': false,
            'type': 'number',
            'unit': 'none'
        },
        { 'name': 'fever_day3_1', 'required': false, 'type': 'string', 'unit': 'none' },
        { 'name': 'cough_day3_1', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'runny_nose_day3_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        {
            'name': 'sore_throat_day3_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        { 'name': 'smell_day3_1', 'required': false, 'type': 'string', 'unit': 'none' },
        {
            'name': 'diarrhea_day3_1',
            'required': false,
            'type': 'string',
            'unit': 'none'
        },
        // { 'name': 'Image_file', 'required': false, 'type': 'string', 'unit': 'none' },
        // { 'name': 'age', 'required': false, 'type': 'number', 'unit': 'none' },
        // { 'name': 'gender', 'required': false, 'type': 'string', 'unit': 'none' },
        { 'name': 'bmi', 'required': false, 'type': 'number', 'unit': 'none' },
        { 'name': 'mask_day1_0', 'required': false, 'type': 'boolean', 'unit': 'none' },
        { 'name': 'mask_day1_1', 'required': false, 'type': 'boolean', 'unit': 'none' },
        { 'name': 'mask_day2_0', 'required': false, 'type': 'boolean', 'unit': 'none' },
        { 'name': 'mask_day2_1', 'required': false, 'type': 'boolean', 'unit': 'none' },
        { 'name': 'mask_day3_0', 'required': false, 'type': 'boolean', 'unit': 'none' },
        { 'name': 'mask_day3_1', 'required': false, 'type': 'boolean', 'unit': 'none' }
    ]
}

module.exports = {
    tasks
}