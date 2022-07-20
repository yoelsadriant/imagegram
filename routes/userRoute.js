const express = require('express');
const tools = require('../tools/tool');
const constant = require('../tools/constant');
const router = express.Router();

const User = require('../model/user');

router.post('/imagegram/user/create', async (req, res) => {
    const user = new User(
        req.body.Username,
        req.body.Name
    )

    const createParam = {
        TableName: constant.IMAGEGRAM_TABLE,
        Item: user.toItem()
    }

    const createResult = await tools.requestHandler(createParam, constant.OPERATION.PUT)
    return {
        statusCode: 200,
        body: res.json({
            CreateResult: createResult
        })
    }
})

router.get('/imagegram/user/find/:username', async (req, res) => {
    const username = req.params.username
    const dbParam = {
        TableName: constant.IMAGEGRAM_TABLE,
        KeyConditionExpression: "PK = :pk And SK = :sk",
        ExpressionAttributeValues: {
            ":pk": { S: "USER#" + username },
            ":sk": { S: "USER#" + username }
        }
    }
    return {
        statusCode: 200,
        body: res.json(await tools.requestHandler(dbParam, constant.OPERATION.QUERY))
    }
})

module.exports = router