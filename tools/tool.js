const AWS = require('aws-sdk');
const constant = require('./constant');

const dynamoDbClient = () => {
    AWS.config.update({ region: 'localhost', endpoint: 'http://localhost:8000', accessKeyId: 'pshxna', secretAccessKey: '97ga9q' });
    return new AWS.DynamoDB();
};

const s3 = () => {
    AWS.config.update({ region: 'localhost', endpoint: 'http://s3-server:9000', accessKeyId: 'pshxna', secretAccessKey: '97ga9q' });
    return new AWS.S3();
};

const uploadImageToS3 = async (imageName, imageData, res) => {
    try {
        const params = {
            Bucket: constant.BUCKET_NAME,
            Key: imageName,
            Body: imageData,
            ContentType: "image/jpeg",
        };
        const uploadResult = await s3.upload(params).promise();
        res.body = JSON.stringify({ message: "Successfully uploaded file to S3", uploadResult });
    } catch (e) {
        console.error("Failed to upload file: ", e);
        res.body = JSON.stringify({ message: "File failed to upload.", errorMessage: e });
        res.statusCode = 400;
    }
}

const processDynamoDB = async (dbParams, operation) => {
    console.log(operation);
    switch (operation) {
        case constant.OPERATION.QUERY:
            return await dynamoDbClient().query(dbParams).promise();
        case constant.OPERATION.PUT:
            await dynamoDbClient().putItem(dbParams).promise();
            return { info: "put success" };
        case constant.OPERATION.UPDATE:
            await dynamoDbClient().updateItem(dbParams).promise();
            return { info: "update success" };
        case constant.OPERATION.DELETE:
            await dynamoDbClient().deleteItem(dbParams).promise();
            return { info: "delete success" };
        case constant.OPERATION.TRANSACTION:
            await dynamoDbClient().transactWriteItems(dbParams).promise();
            return { info: "transact write success" };
    }
}

const requestHandler = async (dbParam, operation) => {
    try {
        console.log(JSON.stringify(dbParam))
        return await processDynamoDB(dbParam, operation);
    } catch (err) {
        let errorMessage;
        switch (err.code) {
            case 'ConditionalCheckFailedException':
                errorMessage = `Condition Failed when trying to ${operation}. Error: ${err.message}`;
                break;
            case 'InternalServerError':
                errorMessage = `Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}`;
                break;
            case 'ProvisionedThroughputExceededException':
                errorMessage = `Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off.`
                    + `Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}`;
                break;
            case 'ResourceNotFoundException':
                errorMessage = `One of the tables was not found, verify table exists before retrying. Error: ${err.message}`;
                break;
            case 'ServiceUnavailable':
                errorMessage = `Had trouble reaching DynamoDB. generally safe to retry with exponential back-off. Error: ${err.message}`;
                break;
            case 'ThrottlingException':
                errorMessage = `Request denied due to throttling, generally safe to retry with exponential back-off. Error: ${err.message}`;
                break;
            case 'UnrecognizedClientException':
                errorMessage = `The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying.`
                    + `Error: ${err.message}`;
                break;
            case 'ValidationException':
                errorMessage = `The input fails to satisfy the constraints specified by DynamoDB, `
                    + `fix input before retrying. Error: ${err.message}`;
                break;
            case 'RequestLimitExceeded':
                errorMessage = `Throughput exceeds the current throughput limit for your account, `
                    + `increase account level throughput before retrying. Error: ${err.message}`;
                break;
            default:
                errorMessage = `An exception occurred, investigate and configure retry strategy. Error: ${err.message}`;
                break;
        }
        return { error: errorMessage }
    }
}

module.exports = {
    uploadImageToS3,
    requestHandler
}