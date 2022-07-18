const ulid = require('ulid');
const moment = require('moment');

const ALLOWED_IMAGE = ['data:image/jpeg;base64', 'data:image/jpg;base64', 'data:image/png;base64', 'data:image/bmp;base64']

class Post {
    constructor(username, postId, imageName, imageData, comment) {
        this.username = username
        this.postId = (postId === null | postId === undefined) ? ulid.ulid().toString() : postId;
        this.creationDate = moment.utc().format()
        this.imageName = imageName
        this.imageData = imageHandler(imageData)

        this.pk = "UP#" + username
        this.sk = "POST#" + postId
        this.imageUrl = ""
        this.totalComment = 0
        this.comment = comment
    }
    toItem() {
        return {
            PK: { "S": this.pk },
            SK: { "S": this.sk },
            CreationDate: { "S": this.creationDate },
            Type: { "S": "POST" },
            PostId: { "S": this.postId },
            Username: { "S": this.username },
            ImageUrl: { "S": this.imageUrl }
        };
    }
}

const imageHandler = (imageData) =>{
    console.log(imageData.split(',')[0])
    if (!ALLOWED_IMAGE.includes(imageData.split(',')[0])) {
        return { error: "image format not compatible" }
    }
    return Buffer.from(imageData.split(',')[1], 'base64');
}

module.exports = Post