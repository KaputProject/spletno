var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var statsSchema = new Schema({
	'stat' : String
});

module.exports = mongoose.model('stats', statsSchema);
