const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
    getReportsByPatient,
    uploadReport,
    deleteReport,
} = require('../controllers/reportController');
const { generatePatientReportPDF } = require('../controllers/pdfGeneratorController');
const { protect } = require('../middleware/authMiddleware');

// Route to get all reports for a patient
router.route('/patient/:patientId')
    .get(protect, getReportsByPatient);

// Route to generate and download a master PDF summary for a patient
router.route('/generate-pdf/:patientId')
    .get(protect, generatePatientReportPDF);

// Route for uploading a report (Form-data with 'document' field)
router.route('/upload/:patientId')
    .post(protect, upload.single('document'), uploadReport);

// Route to delete a single report by its ID
router.route('/:id')
    .delete(protect, deleteReport);

module.exports = router;
