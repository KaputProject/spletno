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

    'identifier': {
        type: String,
        index: true,
    },

    'email': {
        type: String,
        index: true,
        unique: true
    },
    'dateOfBirth' : {
        type: Date,
        default: Date.now()
    },

    'accounts': [{
        type: Schema.Types.ObjectId,
        ref: 'account'
    }],

    // Locations specific to the user
    'locations': [{
        type: Schema.Types.ObjectId,
        ref: 'location'
    }],
});

module.exports = mongoose.model('user', userSchema);
