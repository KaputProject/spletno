var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var partySchema = new Schema({
	'name' : String
});

module.exports = mongoose.model('party', partySchema);
