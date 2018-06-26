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


mongoose.connect('mongodb://localhost:27017/dialogue');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


app.use(logger('combined'));
app.use(addRequestId);

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));


app.use("/patients", patientsRouter);
//    .get(patientsRouter.getPatients)

//app.route("/patients/:id")
//    .get(patientsRouter.getPatient)
//    .delete(patientsRouter.deletePatient)
//    .put(patientsRouter.updatePatient);


app.listen(port);
console.log("Listening on port " + port);

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/

module.exports = app;
