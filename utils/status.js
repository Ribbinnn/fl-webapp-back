const modelStatus = {
    IN_PROGRESS: "in progress",
    AI_ANNOTATED: "annotated",
    HUMAN_ANNOTATED: "reviewed",
    FINALIZED: "finalized",
    CANCELED: "canceled"
}

const userStatus = {
    ACTIVE: "active",
    INACTIVE: "inactive"
}

const userRole = {
    CLINICIAN: "clinician",
    RADIOLOGIST: "radiologist",
    ADMIN: "admin"
}

module.exports = {
    modelStatus,
    userStatus,
    userRole
}