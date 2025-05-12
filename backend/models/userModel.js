var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    'username': {
        type: String,
        index: true,
        unique: true
    },
    'password': String,
    'name': String,
    'surname': String,
    'email': {
        type: String,
        index: true,
        unique: true
    },
    'dateOfBirth' : {
        type: Date,
        default: Date.now()
    },
});

module.exports = mongoose.model('user', userSchema);
