const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Patient',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        doctorName: {
            type: String,
            required: true,
        },
        specialty: {
            type: String, // e.g., 'Cardiologist', 'Pediatrician', 'General Physician'
        },
        hospitalOrClinic: {
            type: String,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true, // e.g., '14:30'
        },
        reason: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
            default: 'Scheduled',
        },
        notes: {
            type: String, // Post-appointment notes or instructions
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
