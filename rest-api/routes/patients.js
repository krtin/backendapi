/*
  Contains routes for /patients
*/

var mongoose = require('mongoose');
var Patients = require('../models/patients');
var express = require('express');
var util = require('../utils/patient');
var router = express.Router();



router.route('/')
.post(function(req, res, next) {
  if(req.body.data != undefined) {
    var newPatient = new Patients(req.body.data);
  }
  else{
    var errors_list = {"errors": []};
    msg = 'Incorrect function input'
    errors_list.errors.push(util.getErrorObject(req.id, '400', 'Bad Request', msg, '', msg));
    return res.status(400).json({'http-error': errors_list});
  }


  //Save patient to DB if everything is correct
  newPatient.save((err, patient) => {

      if (err) {
        var errors_list = {"errors": []}
        var error_code = 409;

        for(var attr_name in err.errors){
          var field = err.errors[attr_name].path;
          var kind = err.errors[attr_name].kind;
          var msg = err.errors[attr_name].message;

          // we check missing and formatting issues only, formatting issues are specified using custom functions in model/patient.js
          if(kind=='required'){
            errors_list.errors.push(util.getErrorObject(req.id, '400', 'Bad Request', msg, kind, msg));
          }
          else if (kind=='format') {
            errors_list.errors.push(util.getErrorObject(req.id, '400', 'Bad Request', msg, kind, msg));
          }
          error_code = 400;
        }

        //we care about duplicate issues only if there are no missing values or formatting issues
        if(errors_list.errors.length==0 && err.name=='MongoError') {

          if(err.code==11000) {
            msg = 'Email ' + req.body.data.email + ' already exists';
            errors_list.errors.push(util.getErrorObject(req.id, '409', 'Conflict', msg, err.code, msg));
            error_code = 409;

          }
        }

        return res.status(error_code).json({'http-error': errors_list});
      }
      else {
        data = {'email': patient.email, 'first_name': patient.first_name, 'last_name': patient.last_name, 'birthdate': patient.birthdate, 'sex': patient.sex}
        return res.status(201).json(data);
      }
  });
})
.get(function(req, res){
  //number of patients per page
  var perPage = 10
  var page = 1
  Patients
        .find({}, { '_id': 0})
        .select('email first_name last_name birthdate sex')
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, patients) {
            Patients.count().exec(function(err, count) {
                if (err) {
                  console.log('Error while fetching patients at /patients');
                  //didn't send any response because swagger didn't specified any
                }
                else {
                  var totalpages = Math.ceil(count / perPage)
                  var nextpage = 'null'
                  if(totalpages>page) {
                    nextpage = page + 1
                  }
                  data = {
                      'data': patients,
                      'links': {'self': page.toString(), 'next': nextpage}
                  }
                  return res.status(200).json(data);
                }

            })
        })
});

/*
  The pagination code above shows the first page by default but it can easily be extended to show other pages
*/

router.route('/:id')
.get(function(req, res) {
  var patientid = req.params.id;
  var errors_list = {"errors": []};


  if (isNaN(patientid)) {
    msg = 'patientid ' +patientid+ ' can only be a number'
    errors_list.errors.push(util.getErrorObject(req.id, '404', 'Not Found', msg, '', msg));
    return res.status(404).json({'http-error': errors_list});
  }
  else{
    //uid is our custom field which auto increments as the default _id in mongodb is ObjectID and number was required as per API specification 
    Patients.findOne({'uid': patientid}, { '_id': 0})
            .select('email first_name last_name birthdate sex')
            .exec(function(err, patient) {

              if(err) {
                //this was not specified in the api, but I added it anyways
                //I am using not found status code for now
                msg = 'patientid ' +patientid+ ' an error occurred'
                errors_list.errors.push(util.getErrorObject(req.id, '404', 'Not Found', msg, '', msg));
                return res.status(404).json({'http-error': errors_list});
              }
              else {

                  if(patient==null){
                    msg = 'patientid ' +patientid+ ' was not found'
                    errors_list.errors.push(util.getErrorObject(req.id, '404', 'Not Found', msg, '', msg));
                    return res.status(404).json({'http-error': errors_list});
                  }
                  else{
                    return res.status(200).json(patient);
                  }

              }
          });
  }

});



module.exports = router;
