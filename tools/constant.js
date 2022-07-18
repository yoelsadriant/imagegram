const constant = {
    IMAGEGRAM_TABLE: process.env.IMAGEGRAM_TABLE,
    USER_POST_BY_TOTAL_COMMENT_INDEX: process.env.USER_POST_BY_TOTAL_COMMENT_INDEX,
    ALL_POST_BY_TOTAL_COMMENT_INDEX: process.env.ALL_POST_BY_TOTAL_COMMENT_INDEX,
    DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
    IS_OFFLINE: process.env.IS_OFFLINE,
    LIMIT_PAGE: process.env.LIMIT_PAGE,
    BUCKET_NAME: process.env.BUCKET_NAME,
    OPERATION: { QUERY: "query", PUT: "put", DELETE: "delete", UPDATE: "update", TRANSACTION: "transaction" },
    MAX_COMMENT: "MAX#COMMENT"
}

module.exports = constant