var mongoose = require('mongoose');
var Patients = require('../models/patients');
var express = require('express');
var router = express.Router();



router.route('/')
//post request at /patients
.post(function(req, res, next) {

  //Creates a new patient
  var newPatient = new Patients(req.body.data);



  //Save patient to DB if everything is correct
  newPatient.save((err, patient) => {

      // mongodb will return error and we will send response as specified in swagger
      if (err) {
        console.log(err);
        //error_list stores all the errors in case more than one error of the same type is present
        var errors_list = {
            "errors": []
        }

        var error_code = 409;

        for(var attr_name in err.errors){
          var field = err.errors[attr_name].path; //field or path
          var kind = err.errors[attr_name].kind;//the kind of error format (our custom kind) or required
          var msg = err.errors[attr_name].message;//the detailed message

          // we check required and formatting issues only, formatting issues are specified using custom functions in model/patient.js
          if(kind=='required'){
            errors_list.errors.push({'id': req.id, 'status': '400', 'title': 'Bad Request', 'detail': msg, 'code': kind, 'source': ''});
          }
          else if (kind=='format') {
            errors_list.errors.push({'id': req.id, 'status': '400', 'title': 'Bad Request', 'detail': msg, 'code': kind, 'source': ''});
          }
          error_code = 400;
        }

        //we care about duplicate issues only if there are no missing values or formatting issues
        if(errors_list.errors.length==0 && err.name=='MongoError') {
          console.log(err.code);
          if(err.code==11000) {
            errors_list.errors.push({'id': req.id, 'status': '409', 'title': 'Conflict', 'detail': 'Email ' + req.body.data.email + ' already exists', 'code': err.code, 'source': ''});
            error_code = 409;
          }
        }

        data = {'http-error': errors_list};
        return res.status(error_code).json(data);
      }
      //everything is correct
      else {
        data = {'email': patient.email, 'first_name': patient.first_name, 'last_name': patient.last_name, 'birthdate': patient.birthdate, 'sex': patient.sex}

        return res.status(201).json(data);
      }

  });
})
//get request at /patients
.get(function(req, res){
  //number of patients per page
  var perPage = 10
  var page = 1
  Patients
        .find({})
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
                  //calculate total number of pages
                  var totalpages = Math.ceil(count / perPage)
                  //set default value of nextpage to null
                  var nextpage = 'null'
                  //set nextpage value if required
                  if(totalpages>page) {
                    nextpage = page + 1
                  }
                  //there is no check for no patents found in database as it was not specified in swagger
                  data = {
                      'data': patients,
                      'links': {'self': page, 'next': nextpage}
                  }

                  return res.status(200).json(data);
                }

            })
        })
});

router.route('/:id')
.get(function(req, res) {
  var patientid = req.params.id;
  //to store errors if any
  var errors_list = {
      "errors": []
  }

  //check if patientid is number or not
  if (isNaN(patientid)) {
    errors_list.errors.push({'id': req.id, 'status': '404', 'title': 'Not Found', 'detail': 'patientid ' +patientid+ ' can only be a number', 'code': '', 'source': ''});
    data = {'http-error': errors_list};
    return res.status(404).json(data);
  }
  else{
    Patients.findOne({'uid': patientid})
            .select('email first_name last_name birthdate sex')
            .exec(function(err, patient) {

              if(err) {
                //this was not specified in the api, but I added it anyways
                //I am using not found status code for now
                errors_list.errors.push({'id': req.id, 'status': '404', 'title': 'Not Found', 'detail': 'patientid ' +patientid+ ' an error occurred', 'code': '', 'source': ''});
                data = {'http-error': errors_list};
                return res.status(404).json(data);
              }
              else {
                  console.log(patient);
                  if(patient==null){
                    errors_list.errors.push({'id': req.id, 'status': '404', 'title': 'Not Found', 'detail': 'patientid ' +patientid+ ' was not found', 'code': '', 'source': ''});
                    data = {'http-error': errors_list};
                    return res.status(404).json(data);
                  }
                  else{
                    return res.status(200).json(patient);
                  }

              }
          });
  }

});



module.exports = router;
