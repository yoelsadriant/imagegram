const express = require('express');
const tools = require('../tools/tool');
const constant = require('../tools/constant');
const router = express.Router();

/**
 * ● As a user, I should be able to get the list of all posts along with the last 2 comments to each post
 * all post by user
 */
router.get('/imagegram/view/allpostuser', async (req, res) => {
    const maxCommentParam = {
        TableName: constant.IMAGEGRAM_TABLE,
        KeyConditionExpression: "PK = :pk And SK = :sk",
        ExpressionAttributeValues: {
            ":pk": { S: constant.MAX_COMMENT },
            ":sk": { S: constant.MAX_COMMENT }
        }
    }
    const maxComment = await tools.requestHandler(maxCommentParam, constant.OPERATION.QUERY)

    const dbParams = {
        TableName: constant.IMAGEGRAM_TABLE,
        ScanIndexForward: false,
        IndexName: constant.USER_POST_BY_TOTAL_COMMENT_INDEX,
        Limit: constant.LIMIT_PAGE,
        KeyConditionExpression: "#PK = :pk And #TotalComment <= :totalComment",
        ExpressionAttributeValues: {
            ":pk": { S: "UP#" + req.query.username },
            ":totalComment": { N: maxComment.Items[0].TotalComment.N.toString() }
        },
        ExpressionAttributeNames: {
            "#PK": "PK",
            "#TotalComment": "TotalComment"
        }
    }
    if (req.query.startKey != undefined || req.query.startKey != null) {
        dbParams.ExclusiveStartKey = JSON.parse(req.query.startKey);
    }
    resultPost = await tools.requestHandler(dbParams, constant.OPERATION.QUERY)

    const arrayResult = [];
    for (const element of resultPost.Items) {
        const postCommentParam = {
            TableName: constant.IMAGEGRAM_TABLE,
            ScanIndexForward: false,
            Limit: 2,
            KeyConditionExpression: "PK = :postId",
            ExpressionAttributeValues: {
                ":postId": { S: "PC#" + element.PostId.S }
            }
        }
        const postCommentResult = await tools.requestHandler(postCommentParam, constant.OPERATION.QUERY)
        for (const elem of postCommentResult.Items) {
            arrayResult.push(elem)
        }
    }

    const response = {
        Data: arrayResult,
        LastEvaluatedKey: resultPost.LastEvaluatedKey
    }

    return {
        statusCode: 200,
        body: res.json(response)
    }
})

/**
 * ● As a user, I should be able to get the list of all posts along with the last 2 comments to each post
 * all post 
 */
router.get('/imagegram/view/allpost', async (req, res) => {
    const maxCommentParam = {
        TableName: constant.IMAGEGRAM_TABLE,
        KeyConditionExpression: "PK = :pk And SK = :sk",
        ExpressionAttributeValues: {
            ":pk": { S: constant.MAX_COMMENT },
            ":sk": { S: constant.MAX_COMMENT }
        }
    }
    const maxComment = await tools.requestHandler(maxCommentParam, constant.OPERATION.QUERY)

    const dbParams = {
        TableName: constant.IMAGEGRAM_TABLE,
        ScanIndexForward: false,
        IndexName: constant.ALL_POST_BY_TOTAL_COMMENT_INDEX,
        Limit: constant.LIMIT_PAGE,
        KeyConditionExpression: "#Type = :type And #TotalComment <= :totalComment",
        ExpressionAttributeValues: {
            ":type": { S: "POST" },
            ":totalComment": { N: maxComment.Items[0].TotalComment.N.toString() }
        },
        ExpressionAttributeNames: {
            "#Type": "Type",
            "#TotalComment": "TotalComment"
        }
    }
    if (req.query.startKey != undefined || req.query.startKey != null) {
        dbParams.ExclusiveStartKey = JSON.parse(req.query.startKey);
    }
    resultPost = await tools.requestHandler(dbParams, constant.OPERATION.QUERY)

    const arrayResult = [];
    for (const element of resultPost.Items) {
        const postCommentParam = {
            TableName: constant.IMAGEGRAM_TABLE,
            ScanIndexForward: false,
            Limit: 2,
            KeyConditionExpression: "PK = :postId",
            ExpressionAttributeValues: {
                ":postId": { S: "PC#" + element.PostId.S }
            }
        }
        const postCommentResult = await tools.requestHandler(postCommentParam, constant.OPERATION.QUERY)
        for (const elem of postCommentResult.Items) {
            arrayResult.push(elem)
        }
    }

    const response = {
        Data: arrayResult,
        LastEvaluatedKey: resultPost.LastEvaluatedKey
    }

    return {
        statusCode: 200,
        body: res.json(response)
    }
})

/**
 * Reading one post
 */
router.get('/imagegram/view/postcomment', async (req, res) => {
    const dbParams = {
        TableName: constant.IMAGEGRAM_TABLE,
        ScanIndexForward: false,
        Limit: constant.LIMIT_PAGE,
        KeyConditionExpression: "PK = :postId",
        ExpressionAttributeValues: {
            ":postId": { S: "PC#" + req.query.postId }
        }
    }
    if (req.query.startKey != undefined || req.query.startKey != null) {
        dbParams.ExclusiveStartKey = JSON.parse(req.query.startKey);
    }
    return {
        statusCode: 200,
        body: res.json(
            await tools.requestHandler(dbParams, constant.OPERATION.QUERY))
    }
})

module.exports = router;