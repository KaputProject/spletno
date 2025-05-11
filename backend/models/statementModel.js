var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statementSchema = new Schema({
    'transactions': Array[{
        type: Schema.Types.ObjectId, ref: 'transaction'
    }],
    'user': {
        type: Schema.Types.ObjectId, ref: 'user'
    },
    'account': {
        type: Schema.Types.ObjectId, ref: 'account'
    },
    'description': String,
    'totalIn': Number,
    'totalOut': Number,
    'balanceBefore': String,
    'balanceAfter': String,
    'stats': {
        type: Schema.Types.ObjectId, ref: 'stats'
    },
    'dateTime': Date
});

module.exports = mongoose.model('statement', statementSchema);
