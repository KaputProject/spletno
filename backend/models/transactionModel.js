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
	'partner': {
		type: Schema.Types.ObjectId,
		ref: 'partner',
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
		default: 0
	},
	'outgoing': {
		type: Boolean,
		default: true
	},
	'balanceAfter': {
		type: Number,
		default: 0
	},

	'partner_original': {
		type: String,
		default: null
	},
	'reference': {
		type: Number,
		default: null
	},
});

module.exports = mongoose.model('transaction', transactionSchema);
