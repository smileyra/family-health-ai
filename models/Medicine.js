const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
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
        name: {
            type: String,
            required: true, // e.g., 'Amoxicillin'
        },
        dosage: {
            type: String,
            required: true, // e.g., '500mg'
        },
        frequency: {
            type: String,
            required: true, // e.g., 'Twice a day', 'Every 8 hours'
        },
        timesOfDay: [
            {
                type: String, // e.g., '08:00', '20:00'
            },
        ],
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date, // Null/Empty if it's an ongoing chronic medication
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        instructions: {
            type: String, // e.g., 'Take after food'
        },
        prescribingDoctor: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Medicine', medicineSchema);
