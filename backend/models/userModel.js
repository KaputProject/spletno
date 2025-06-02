const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    'dateOfBirth': {
        type: Date,
        default: Date.now()
    },

    'avatarUrl': {
        type: String,
        default: ''
    },

    'accounts': [{
        type: Schema.Types.ObjectId,
        ref: 'account'
    }],

    'isAdmin': {
        type: Boolean,
        default: false
    },

    // Partners specific to the user
    'locations': [{
        type: Schema.Types.ObjectId,
        ref: 'location'
    }],
});

module.exports = mongoose.model('user', userSchema);
