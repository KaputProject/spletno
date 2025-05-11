var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var transactionSchema = new Schema({
	'dateTime' : Date,
	'reference' : String,
	'otherPartyString' : String,
	'otherParty' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'party'
	},
	'description' : String,
	'category' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'category'
	},
	'outgoing' : Boolean,
	'amount' : Number,
	'balance' : Number
});

module.exports = mongoose.model('transaction', transactionSchema);
