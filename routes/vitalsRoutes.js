const express = require('express');
const router = express.Router();
const {
    getVitalsByPatient,
    createVitals,
    deleteVitals,
} = require('../controllers/vitalsController');
const { protect } = require('../middleware/authMiddleware');

// Get and create vitals specifically belonging to a given patient profile
router.route('/patient/:patientId')
    .get(protect, getVitalsByPatient)
    .post(protect, createVitals);

// Delete a specific vitals entry
router.route('/:id')
    .delete(protect, deleteVitals);

module.exports = router;
