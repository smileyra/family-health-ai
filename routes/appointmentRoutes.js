const express = require('express');
const router = express.Router();
const {
    getAppointmentsByPatient,
    getAllUserAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Get all appointments for all patients linked to the user
router.route('/')
    .get(protect, getAllUserAppointments);

// Endpoints specific to a patient profile
router.route('/patient/:patientId')
    .get(protect, getAppointmentsByPatient)
    .post(protect, createAppointment);

// Endpoints for modifying an existing appointment
router.route('/:id')
    .put(protect, updateAppointment)
    .delete(protect, deleteAppointment);

module.exports = router;
