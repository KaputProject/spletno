const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const familySchema = new Schema({
    'name': {
        type: String,
        default: 'Family'
    },
    'users': [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
});

module.exports = mongoose.model('family', familySchema);
