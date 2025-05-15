var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var categorySchema = new Schema({
	'name' : String,
	'description' : String,
	'color' : String
});

module.exports = mongoose.model('category', categorySchema);
