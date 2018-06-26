//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//patient schema definition
var PatientsSchema = new Schema(
  {
    uid: {type: Number, unique: true},
    email: { type: String, required: true, unique: true},
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    birthdate: { type: String, required: true },
    sex: { type: String, required: true },
  },
  {
    timestamps: true
  }
);

//to maintain an autoincrement integer uid, since it is required by the api
PatientsSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;

    if (!this.created_at)
        this.created_at = currentDate;

    var uid = 1;
    var patient = this;
    Patients = mongoose.model('Patients', PatientsSchema);
    Patients.find({}, function(err, patients) {
    if (err) throw err;
        uid = patients.length + 1;
        patient.uid = uid;
        next();
    });
});

//function for validating date to mm-dd-yy or mm/dd/yyyy
//since it wasn't mentioned I assumed this
date_format_checker = function(v) {
  var dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
  return dateRegex.test(v);
}

//I assumed sex format to be either m or f
sex_format_checker = function(v) {
  if(v.toLowerCase()=='m' || v.toLowerCase()=='f') {
    return true
  }
  else {
    return false
  }
}

//function for checking email
var email_format_checker = function(v) {
  var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(v.toLowerCase());
};

//adding the vaidation using function definitions above
PatientsSchema.path('email').validate(email_format_checker, 'Email `{VALUE}` is incorrectly formatted', 'format');
PatientsSchema.path('birthdate').validate(date_format_checker, 'Birth Date `{VALUE}` is incorrectly formatted', 'format');
PatientsSchema.path('sex').validate(sex_format_checker, 'Sex `{VALUE}` is incorrectly formatted', 'format');

//Exports the PatientSchema
module.exports = mongoose.model('Patients', PatientsSchema);
