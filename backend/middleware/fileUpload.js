// middlewares/fileUpload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Poskrbi, da mapa 'uploads/' obstaja
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Nastavi kam se shranijo datoteke in kako jih poimenujemo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Filter za samo PDF datoteke
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Dovoljene so samo PDF datoteke'), false);
    }
};

// Konfiguracija multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    }
});


module.exports = upload;
