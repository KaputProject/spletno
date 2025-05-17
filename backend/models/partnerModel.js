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

	// TODO: This can be made with a separate model, to enable sorting and so on
	'types': [{
		type: String,
	}]
});

module.exports = mongoose.model('location', partnerSchema);

// TODO: Make sure the partner is automatically deleted from the users table
// TODO: Make sure the partner is deleted if its user is (to v user modelu nardis)
