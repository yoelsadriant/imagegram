const moment = require('moment');

class User{
    constructor(username, name) {
        this.pk = "USER#" + username
        this.sk = "USER#" + username
        this.username = username
        this.name = name
        this.creationDate = moment.utc().format()
    }
    toItem() {
        return {
            PK: { "S": this.pk },
            SK: { "S": this.sk },
            CreationDate: { "S": this.creationDate },
            Type: { "S": "USER" },
            Name: { "S": this.name }
        };
    }
}

module.exports = User