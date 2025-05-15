var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var entitySchema = new Schema({
	'name' : String,
	'type' : String,
	'address' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'address'
	},
	'company' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'company'
	}
});

module.exports = mongoose.model('entity', entitySchema);
