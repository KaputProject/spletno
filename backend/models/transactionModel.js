const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
	'user': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		index: true
	},
	'statement': {
		type: Schema.Types.ObjectId,
		ref: 'statement',
		index: true
	},

	'datetime': {
		type: Date,
		default: Date.now()
	},
	'reference': {
		type: Number,
	},

	'partner_original': {
		type: String,
	},
	'description': {
		type: String,
	},

	'change': {
		type: Number,
		default: 0
	},
	'balanceAfter': {
		type: Number,
		default: 0
	},
	'outgoing': {
		type: Boolean,
		default: true
	},

	'known_partner': {
		type: Boolean,
		default: false
	},
	'partner_parsed': {
		type: Schema.Types.ObjectId,
		ref: 'partner',
		index: true
	}
});

module.exports = mongoose.model('transaction', transactionSchema);
