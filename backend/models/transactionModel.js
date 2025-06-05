const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
	'user': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		index: true
	},
	'account': {
		type: Schema.Types.ObjectId,
		ref: 'account',
		index: true
	},
	'location': {
		type: Schema.Types.ObjectId,
		ref: 'location',
		index: true
	},

	'datetime': {
		type: Date,
		default: Date.now()
	},
	'description': {
		type: String,
		default: null
	},
	'change': {
		type: Number,
		default: 0,
		min: [0, 'Change amount must be a positive number']
	},
	'outgoing': {
		type: Boolean,
		default: true
	},

	'reference': {
		type: Number,
		default: null
	},
	'original_location': {
		type: String,
		default: null
	}
});

module.exports = mongoose.model('transaction', transactionSchema);
