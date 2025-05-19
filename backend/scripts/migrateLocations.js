const mongoose = require('mongoose');
require('dotenv').config();

// Povezava z MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Shema partnerja
const locationSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number,
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number]
    }
});

const Location = mongoose.model('location', locationSchema);

async function migrate() {
    try {
        const locations = await Location.find({ lat: { $ne: null }, lng: { $ne: null } });

        for (const loc of locations) {
            if (!loc.location) {
                loc.location = {
                    type: 'Point',
                    coordinates: [loc.lng, loc.lat] // lng first, lat second!
                };
                await loc.save();
                console.log(`Migrated: ${loc.name}`);
            }
        }

        // Dodaj 2dsphere indeks
        await Location.collection.createIndex({ location: '2dsphere' });
        console.log('✅ 2dsphere index added on `location` field.');

        console.log('✅ Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
