const modelStatus = {
    IN_PROGRESS: "in progress",
    AI_ANNOTATED: "annotated",
    HUMAN_ANNOTATED: "reviewed",
    FINALIZED: "finalized",
    CANCELED: "canceled"
}

const userStatus = {
    ACTIVE: "acrive",
    INACTIVE: "inactive"
}

module.exports = {
    modelStatus,
    userStatus
}