const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Patient',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId, // The master account that recorded this
            required: true,
            ref: 'User',
        },
        heartRate: {
            type: Number, // bpm
        },
        bloodPressureSys: {
            type: Number, // mmHg
        },
        bloodPressureDia: {
            type: Number, // mmHg
        },
        oxygenLevel: {
            type: Number, // SpO2 %
        },
        bodyTemperature: {
            type: Number, // Celsius or F (let's stick to C for backend standard)
        },
        weight: {
            type: Number, // kg
        },
        bloodSugar: {
            type: Number, // mg/dL
        },
        notes: {
            type: String,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Vitals', vitalsSchema);
