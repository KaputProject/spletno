const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerSchema = new Schema({
	'user': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		index: true
	},

	'name': {
		type: String,
	},
	'identifier': {
		type: String,
		index: true
	},
	'description': {
		type: String,
	},
	'total_spent': {
		type: Number,
		default: 0
	},
	'address': {
		type: String,
	},
	'lat': {
		type: Number,
	},
	'lng': {
		type: Number,
	},
	'icon': {
		type: String,
	},
	'types': [{
		type: String,
	}]
});

module.exports = mongoose.model('partner', partnerSchema);
