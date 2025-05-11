var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var addressSchema = new Schema({
	'addressLine1' : String,
	'addressLine2' : String,
	'city' : String,
	'code' : String,
	'state' : String,
	'country' : String
});

module.exports = mongoose.model('address', addressSchema);
