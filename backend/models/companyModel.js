var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var companySchema = new Schema({
	'name' : String,
	'type' : String
});

module.exports = mongoose.model('company', companySchema);
