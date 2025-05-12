var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    'username': String,
    'name': String,
    'surname': String,
    'email': String,
});

module.exports = mongoose.model('user', userSchema);
