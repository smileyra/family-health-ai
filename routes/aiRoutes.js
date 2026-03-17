const express = require('express');
const router = express.Router();
const {
    analyzeReport,
    getHealthInsights,
    chatScanner
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route to trigger AI analysis of an existing specific report
router.route('/analyze-report/:reportId')
    .post(protect, analyzeReport);

// Route to get a holistic AI health insight for a family member based on their latest vitals and meds
router.route('/insights/:patientId')
    .get(protect, getHealthInsights);

// Route for chat bot document scanner (open without auth for demo purposes if needed, or we can use protect)
// We will not use protect for now so the UI can easily test it without a login wrapper
router.route('/chat-scanner')
    .post(upload.single('document'), chatScanner);

module.exports = router;
