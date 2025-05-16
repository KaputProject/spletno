var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var locationSchema = new Schema({
	'user' : {
		type: Schema.Types.ObjectId,
		ref: 'user',
		index: true
	},

	'name' : {
		type: String,
	},
	'identifier' : {
		type: String,
		index: true,
		unique: true,
	},
	'description' : {
		type: String,
	},
	'total_spent' : {
		type: Number,
		default: 0
	},
	'address' : {
		type: String,
	},
	'lat' : {
		type: Number,
	},
	'lng' : {
		type: Number,
	},
	'icon' : {
		type: String,
	},

	// TODO: This can be made with a separate model, to enable sorting and so on
	'types' : [{
		type: String,
	}]
});

module.exports = mongoose.model('location', locationSchema);
