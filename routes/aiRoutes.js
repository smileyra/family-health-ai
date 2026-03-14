const express = require('express');
const router = express.Router();
const {
    analyzeReport,
    getHealthInsights
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');


// Route to trigger AI analysis of an existing specific report
router.route('/analyze-report/:reportId')
    .post(protect, analyzeReport);

// Route to get a holistic AI health insight for a family member based on their latest vitals and meds
router.route('/insights/:patientId')
    .get(protect, getHealthInsights);

module.exports = router;
