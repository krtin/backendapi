/*
 Contains Utility functions for patient

*/


var getErrorObject = function(id, status, title, detail, code, source) {
  error_object = {'id': id, 'status': status, 'title': title, 'detail': detail, 'code': code, 'source': source}
  return error_object
}

module.exports = {getErrorObject};
