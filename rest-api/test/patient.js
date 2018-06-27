/*
  Test cases for patient api
  -- npm test
*/

var mongoose = require("mongoose");
var Patients = require('../models/patients');

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

//function for checking patient object, adding values checks here will add functionality everywhere
var checkPatientObject = function(patient) {
  patient.should.have.property('email');
  patient.should.have.property('first_name');
  patient.should.have.property('last_name');
  patient.should.have.property('birthdate');
  patient.should.have.property('sex');
}


var checkErrorObject = function(errorobject) {
  errorobject.should.be.a('object');
  errorobject.should.have.property('errors');
  var errors = errorobject.errors;
  errors.should.be.a('array');

  errors.forEach(function(error){
    error.should.have.property('id');
    error.should.have.property('status');
    error.should.have.property('title');
    error.should.have.property('detail');
    error.should.have.property('code');
    error.should.have.property('source');
  });

}

//posts multiple patients into the database and then checks GET functionality
var postNcheckMultipleEnteries = function(patient, emails, done){
  if(emails.length>0){
    chai.request(server)
        .post('/patients')
        .send(patient)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          checkPatientObject(res.body);
          patient.data.email = emails.pop();
          postNcheckMultipleEnteries(patient, emails, done);
        });
  }
  else{
    chai.request(server)
        .get('/patients')
        .end((err, res) => {

            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('data');
            res.body.should.have.property('links');
            res.body.links.should.have.property('self');
            res.body.links.should.have.property('next');
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(10);
            res.body.data.forEach(function(patient){
              checkPatientObject(patient);
            });
            done();
        });
  }
}


describe('Patients', () => {
    beforeEach((done) => {
        //empty the database after every done
        Patients.remove({}, (err) => {
           done();
        });
    });

    describe('/GET patients', () => {
      it('it should GET all the patients and the link', (done) => {
        chai.request(server)
            .get('/patients')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.should.have.property('links');
                res.body.links.should.have.property('self');
                res.body.links.should.have.property('next');
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(0);
              done();
            });
      });
  });


  describe('/POST patients', () => {
      it('it should POST a patient and return it', (done) => {
        var patient = {"data":
                        {"email": "krtinkumar@gmail.com",
                        "first_name": "Krtin",
                        "last_name": "Kumar",
                        "birthdate": "28-07-1992",
                        "sex": "m"}
                      }
        chai.request(server)
            .post('/patients')
            .send(patient)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                checkPatientObject(res.body);
              done();
            });
      });

  });

  describe('/POST patients', () => {
      it('it should not POST a patient with duplicate email', (done) => {
        var patient = {"data":
                        {"email": "krtinkumar@gmail.com",
                        "first_name": "Krtin",
                        "last_name": "Kumar",
                        "birthdate": "28-07-1992",
                        "sex": "m"}
                      }

        chai.request(server)
            .post('/patients')
            .send(patient)
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('object');
              checkPatientObject(res.body);

              chai.request(server)
                  .post('/patients')
                  .send(patient)
                  .end((err, res) => {
                      res.should.have.status(409);
                      res.body.should.be.a('object');
                      res.body.should.have.property('http-error');
                      checkErrorObject(res.body['http-error']);
                    done();
                  });
        });




      });

  });

  describe('/POST patients', () => {
      it('it should not POST a patient with incorrect email', (done) => {
        var patient = {"data":
                        {"email": "krtinkumargmail.com",
                        "first_name": "Krtin",
                        "last_name": "Kumar",
                        "birthdate": "28-07-1992",
                        "sex": "m"}
                      }

        chai.request(server)
            .post('/patients')
            .send(patient)
            .end((err, res) => {

                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('http-error');
                checkErrorObject(res.body['http-error']);

              done();
            });
      });

  });

  describe('/POST patients', () => {
      it('it should not POST a patient with incorrect birthdate', (done) => {
        var patient = {"data":
                        {"email": "krtinkumar@gmail.com",
                        "first_name": "Krtin",
                        "last_name": "Kumar",
                        "birthdate": "28-07-199",
                        "sex": "m"}
                      }

        chai.request(server)
            .post('/patients')
            .send(patient)
            .end((err, res) => {

                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('http-error');
                checkErrorObject(res.body['http-error']);

              done();
            });
      });

  });

  describe('/POST patients', () => {
      it('it should not POST a patient with incorrect Sex', (done) => {
        var patient = {"data":
                        {"email": "krtinkumar@gmail.com",
                        "first_name": "Krtin",
                        "last_name": "Kumar",
                        "birthdate": "28-07-1992",
                        "sex": "mj"}
                      }

        chai.request(server)
            .post('/patients')
            .send(patient)
            .end((err, res) => {

                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('http-error');
                checkErrorObject(res.body['http-error']);

              done();
            });
      });

  });

  describe('/POST patients', () => {
      it('it should not POST a patient with missing field', (done) => {
        var patient = {"data":
                        {"email": "krtinkumar@gmail.com",
                        "first_name": "",
                        "last_name": "Kumar",
                        "birthdate": "28-07-1992",
                        "sex": "m"}
                      }

        chai.request(server)
            .post('/patients')
            .send(patient)
            .end((err, res) => {

                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('http-error');
                checkErrorObject(res.body['http-error']);

              done();
            });
      });

  });

  describe('/GET patients', () => {
      it('it should GET 10 patients only along with pagination', (done) => {
        var patient = {"data":
                        {"email": "krtinkumar@gmail.com",
                        "first_name": "Krtin",
                        "last_name": "Kumar",
                        "birthdate": "28-07-1992",
                        "sex": "m"}
                      }
        email_array = ["kk@gmail.com", "kk@xyz.com", "kk@abc.com", "kk@dfg.com", "kk@yah.com",
                       "kk@tube.com", "kk@kill.com", "kk@glass.com", "kk@plain.com", "kk@redi.com",
                       "kk@you.com"];

        postNcheckMultipleEnteries(patient, email_array, done);
      });
  });

  describe('/GET patients', () => {
    it('it should GET patient with id 1 and patient with id 2 should not be found', (done) => {
      var patient = {"data":
                      {"email": "krtinkumar@gmail.com",
                      "first_name": "Krtin",
                      "last_name": "Kumar",
                      "birthdate": "28-07-1992",
                      "sex": "m"}
                    }
      chai.request(server)
          .post('/patients')
          .send(patient)
          .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('object');
              checkPatientObject(res.body);
              chai.request(server)
                  .get('/patients/1')
                  .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.be.a('object');
                      checkPatientObject(res.body);
                      chai.request(server)
                          .get('/patients/2')
                          .end((err, res) => {
                              res.should.have.status(404);
                              res.body.should.be.a('object');
                              res.body.should.have.property('http-error');
                              checkErrorObject(res.body['http-error']);
                            done();
                          });
                  });
          });
    });
  });
});
