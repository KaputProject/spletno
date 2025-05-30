const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
	'user': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		index: true
	},
	'transactions': [{
		type: Schema.Types.ObjectId,
		ref: 'transaction'
	}],

	'name': {
		type: String,
	},
	'identifier': {
		type: String,
		index: true
	},
	'description': {
		type: String,
	},

	'total_spent': {
		type: Number,
		default: 0
	},
	'total_received': {
		type: Number,
		default: 0
	},

	'address': {
		type: String,
	},
	'lat': {
		type: Number,
	},
	'lng': {
		type: Number,
	},
	'location': {
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point'
		},
		coordinates: {
			type: [Number], // [lng, lat]
			index: '2dsphere'
		}
	},
	'icon': {
		type: String,
	},
	'tags': [{
		type: Schema.Types.ObjectId,
		ref: 'tag'
	}]
});

module.exports = mongoose.model('location', locationSchema);
