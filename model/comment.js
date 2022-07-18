const ulid = require('ulid');
const moment = require('moment');

class Comment {
    constructor(postId, commentId, comment, isCaption, username) {
        this.commentId = (commentId === null | commentId === undefined)? ulid.ulid().toString() : commentId;
        this.creationDate = moment.utc().format();

        this.pk = "PC#" + postId;
        this.sk = "COMMENT#" + this.commentId;
        this.postId = postId;
        this.comment = comment || "";
        this.isCaption = isCaption || false;
        this.username = username;
    }

    toItem() {
        return {
            PK: { "S": this.pk },
            SK: { "S": this.sk },
            CreationDate: { "S": this.creationDate },
            Type: { "S": "COMMENT" },
            PostId: { "S": this.postId },
            CommentId: { "S": this.commentId },
            Comment: { "S": this.comment },
            IsCaption: { "S": this.isCaption.toString() },
            Username: { "S": this.username }
        };
    }
}

module.exports = Comment;