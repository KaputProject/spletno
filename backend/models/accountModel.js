const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
	'user': {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	'iban': {
		type: String,
		index: true,
		unique: true,
	},
	'currency': {
		type: String,
		enum: ['EUR', 'USD', 'GBP'],
		default: 'EUR'
	},
	'balance': {
		type: Number,
		default: 0
	},
	'statements': [{
		type: Schema.Types.ObjectId,
		ref: 'statement'
	}]
});

module.exports = mongoose.model('account', accountSchema);
