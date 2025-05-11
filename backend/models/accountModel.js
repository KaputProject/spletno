var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var accountSchema = new Schema({
	'iban' : String,
	'balance' : String,
	'statements' : Array[{
		type: Schema.Types.ObjectId, ref: 'statement'
	}],
	'stats' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'stats'
	}
});

module.exports = mongoose.model('account', accountSchema);
