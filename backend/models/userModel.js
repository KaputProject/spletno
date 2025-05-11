var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    'username': String,
    'name': String,
    'surname': String,
    'email': String,
    'accounts': Array[{
        type: Schema.Types.ObjectId, ref: 'account'
    }], 'address': {
        type: Schema.Types.ObjectId, ref: 'address'
    }, 'dateOfBirth': Date
});

module.exports = mongoose.model('user', userSchema);
