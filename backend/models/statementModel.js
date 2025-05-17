const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statementSchema = new Schema({
    'user': {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'account': {
        type: Schema.Types.ObjectId,
        ref: 'account'
    },

    'transactions': [{
        type: Schema.Types.ObjectId,
        ref: 'transaction'
    }],

    'startDate': {
        type: Date,
        default: Date.now()
    },
    'endDate': {
        type: Date,
        default: Date.now()
    },

    'inflow': {
        type: Number,
        default: 0
    },
    'outflow': {
        type: Number,
        default: 0
    },
    'startBalance': {
        type: Number,
        default: 0
    },
    'endBalance': {
        type: Number,
        default: 0
    },

    'month': {
        type: Number,
        default: new Date().getMonth()
    },
    'year': {
        type: Number,
        default: new Date().getFullYear()
    }
});

module.exports = mongoose.model('statement', statementSchema);

//TODO: Make sure the statement is deleted from an account on delete
//TODO: Make sure all the statements transactions are deleted on delete
