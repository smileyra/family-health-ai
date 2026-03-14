const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
        title: {
            type: String,
            required: true, // e.g., 'Blood Test 2026', 'Chest X-Ray'
        },
        reportType: {
            type: String,
            required: true, // e.g., 'Lab Result', 'X-Ray', 'ECG', 'Prescription'
        },
        dateOfReport: {
            type: Date,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true, // Path or URL to the uploaded file
        },
        notes: {
            type: String,
        },
        aiSummary: {
            type: String, // We'll populate this later using the AI module
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Report', reportSchema);
