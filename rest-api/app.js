var express = require('express');
var addRequestId = require('express-request-id')();
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var port = 8080

var patientsRouter = require('./routes/patients');

var app = express();

//
mongoose.connect('mongodb://localhost:27017/dialogue');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


app.use(logger('combined'));
app.use(addRequestId);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));


app.use("/patients", patientsRouter);

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;
