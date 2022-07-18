const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const app = express();
const timeout = require('connect-timeout');

const postRoute = require('../routes/postRoute')
const commentRoute = require('../routes/commentRoute')
const viewRoute = require('../routes/viewRoute')

// limiting json
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

/**
 * API Processing
 */
app.use(postRoute)
// // limiting timeout for non-image upload
app.use(timeout(process.env.CONFIG_API_TIMEOUT))
app.use(commentRoute)
app.use(viewRoute)


module.exports.handler = serverless(app);


