const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // The uploaded files will be stored in the 'uploads' folder
    },
    filename(req, file, cb) {
        // Prevent duplicate file names by adding the date timestamp
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpg|jpeg|png|pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'), false);
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5 MB ceiling limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
