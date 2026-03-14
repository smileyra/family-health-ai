const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        relationship: {
            type: String, // e.g., 'Self', 'Child', 'Spouse', 'Parent'
            required: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true,
        },
        bloodGroup: {
            type: String,
        },
        allergies: [
            {
                type: String,
            },
        ],
        chronicConditions: [
            {
                type: String,
            },
        ],
        emergencyContact: {
            name: String,
            phone: String,
            relation: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Patient', patientSchema);
