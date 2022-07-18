const express = require('express');
const tools = require('../tools/tool');
const constant = require('../tools/constant');
const ulid = require('ulid');
const sharp = require('sharp')
const router = express.Router();

const Comment = require('../model/comment');
const Post = require('../model/post');

/**
 * ● As a user, I should be able to create posts with images (1 post - 1 image)
 */
router.post('/imagegram/posting/create', async (req, res) => {
    /**
     * Image Processing
     */
    const postId = ulid.ulid().toString()
    const comment = (req.body.Comment == null | req.body.Comment == undefined) ? null : new Comment(postId, null, req.body.Comment, true, req.body.Username)
    const post = new Post(req.body.Username, postId, req.body.ImageName, req.body.ImageData, comment)

    if (post.imageData.error != null | post.imageData.error != undefined) {
        console.log('error image')
        return { statusCode: 400, body: res.json(post.imageData.error) }
    }
    if (req.body.PostId != undefined || req.body.PostId != null) {
        return await tools.requestHandler(updateParam, constant.OPERATION.UPDATE);
    }

    await tools.uploadImageToS3(post.imageName, post.imageData, res);
    if (res.statusCode === 400) {
        return res
    }

    const resizeImage = sharp(post.imageData).resize(600, 600).toFormat('jpg').toBuffer();
    const imageName = post.imageName.split('.')[0] + "-converted.jpg"
    await tools.uploadImageToS3(imageName, resizeImage, res);
    if (res.statusCode === 400) {
        return res
    }

    /**
     * DB Processing
     */
    post.imageUrl = res.body.uploadResult.Location;
    const postParam = {
        TableName: constant.IMAGEGRAM_TABLE,
        Item: post.toItem(),
    }
    const postResult = await tools.requestHandler(postParam, constant.OPERATION.PUT)
    const commentResult = (comment) ? await tools.requestHandler(commentParam, constant.OPERATION.PUT) : ""

    return {
        statusCode: 200,
        body: res.json({
            PostResult: postResult,
            CommentResult: commentResult
        })
    }
})

module.exports = router