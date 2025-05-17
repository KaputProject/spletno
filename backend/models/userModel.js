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

    // Partners specific to the user
    'partners': [{
        type: Schema.Types.ObjectId,
        ref: 'partner'
    }],
});

module.exports = mongoose.model('user', userSchema);
