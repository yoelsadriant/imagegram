const express = require('express');
const tools = require('../tools/tool');
const constant = require('../tools/constant');
const router = express.Router();

const Comment = require('../model/comment');

/**
 * ● As a user, I should be able to set a text caption when I create a post
 * ● As a user, I should be able to comment on a post
 */
router.post('/imagegram/posting/comment', async (req, res) => {
    const comment = new Comment(
        req.body.PostId,
        req.body.CommentId,
        req.body.Comment,
        req.body.IsCaption,
        req.body.Username
    );

    if (req.body.CommentId != undefined || req.body.CommentId != null) {
        const updateParam = {
            TableName: constant.IMAGEGRAM_TABLE,
            Key: {
                PK: { S: "PC#" + comment.postId },
                SK: { S: "COMMENT#" + comment.commentId }
            },
            ConditionExpression: "attribute_exists(PK)",
            UpdateExpression: "SET #Comment = :comment",
            ExpressionAttributeNames: {
                "#Comment": "Comment"
            },
            ExpressionAttributeValues: {
                ":comment": { S: comment.comment }
            }
        }
        return { statusCode: 200, body: res.json(await tools.requestHandler(updateParam, constant.OPERATION.UPDATE)) };
    }

    const newCommentResult = await createNewComment(comment);
    const currentPostTotalComment = await getPostTotalComment(comment);
    const maxComment = currentPostTotalComment.Items[0].TotalComment.N.toString();
    const updateResult = await updateMaxComment(maxComment);

    return {
        statusCode: 200,
        body: res.json({
            CommentResult: newCommentResult,
            TotalComment: maxComment,
            UpdateResult: updateResult
        })
    }
})

/**
 * ● As a user, I should be able to delete a comment (created by me) from a post
 */
router.delete('/imagegram/delete/comment', async (req, res) => {
    console.log(req.query)
    const comment = new Comment(
        req.query.postId,
        req.query.commentId,
        "",
        false,
        req.query.username
    );
    console.log(comment)
    return {
        statusCode: 200,
        body: res.json({
            DeleteResult: "delete " + JSON.stringify(await deleteComment(comment))
        })
    };
})

/**
 *  CRUD Functions
 */

const createNewComment = async (comment) => {
    const transactParam = {
        TransactItems: [
            {
                Put: {
                    TableName: constant.IMAGEGRAM_TABLE,
                    Item: comment.toItem(),
                    ConditionExpression: "attribute_not_exists(PK)"
                }
            },
            {
                Update: {
                    TableName: constant.IMAGEGRAM_TABLE,
                    Key: {
                        PK: { S: "UP#" + comment.username },
                        SK: { S: "POST#" + comment.postId }
                    },
                    ConditionExpression: "attribute_exists(PK)",
                    UpdateExpression: "SET #TotalComment = #TotalComment + :inc",
                    ExpressionAttributeNames: {
                        "#TotalComment": "TotalComment"
                    },
                    ExpressionAttributeValues: {
                        ":inc": { N: "1" }
                    }
                }
            }
        ]
    };
    return await tools.requestHandler(transactParam, constant.OPERATION.TRANSACTION);
}

const deleteComment = async (comment) => {
    const transactParam = {
        TransactItems: [
            {
                Delete: {
                    TableName: constant.IMAGEGRAM_TABLE,
                    Key: {
                        PK: { S: "PC#" + comment.postId },
                        SK: { S: "COMMENT#" + comment.commentId }
                    },
                    ConditionExpression: "#Username = :username",
                    ExpressionAttributeNames: {
                        "#Username": "Username"
                    },
                    ExpressionAttributeValues: {
                        ":username": { S: comment.username }
                    }
                }
            },
            {
                Update: {
                    TableName: constant.IMAGEGRAM_TABLE,
                    Key: {
                        PK: { S: "UP#" + comment.username },
                        SK: { S: "POST#" + comment.postId }
                    },
                    ConditionExpression: "attribute_exists(PK)",
                    UpdateExpression: "SET #TotalComment = #TotalComment - :dec",
                    ExpressionAttributeNames: {
                        "#TotalComment": "TotalComment"
                    },
                    ExpressionAttributeValues: {
                        ":dec": { N: "1" }
                    }
                }
            }
        ]
    };
    return await tools.requestHandler(transactParam, constant.OPERATION.TRANSACTION);
}

const getPostTotalComment = async (comment) => {
    const dbGetCurrentPostTotalComment = {
        TableName: constant.IMAGEGRAM_TABLE,
        ScanIndexForward: false,
        KeyConditionExpression: "PK = :username and SK= :postId",
        ExpressionAttributeValues: {
            ":username": { S: "UP#" + comment.username },
            ":postId": { S: "POST#" + comment.postId }
        }
    };
    return await tools.requestHandler(dbGetCurrentPostTotalComment, constant.OPERATION.QUERY);
}

const updateMaxComment = async (maxComment) => {
    const dbUpdateMaxComment = {
        TableName: constant.IMAGEGRAM_TABLE,
        Key: {
            PK: { S: constant.MAX_COMMENT },
            SK: { S: constant.MAX_COMMENT }
        },
        UpdateExpression: "SET #TotalComment = :maxComment",
        ConditionExpression: "#TotalComment < :maxComment",
        ExpressionAttributeNames: {
            "#TotalComment": "TotalComment"
        },
        ExpressionAttributeValues: {
            ":maxComment": { N: maxComment }
        }
    };
    return await tools.requestHandler(dbUpdateMaxComment, constant.OPERATION.UPDATE);
}

module.exports = router