const Vitals = require('../models/Vitals');
const Patient = require('../models/Patient');

// @desc    Get all vitals for a specific patient
// @route   GET /api/vitals/patient/:patientId
// @access  Private
const getVitalsByPatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);
        
        // Ensure patient exists and belongs to the user
        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        const vitals = await Vitals.find({ patient: req.params.patientId }).sort({ recordedAt: -1 });
        res.json(vitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new vitals record
// @route   POST /api/vitals/patient/:patientId
// @access  Private
const createVitals = async (req, res) => {
    try {
        const {
            heartRate,
            bloodPressureSys,
            bloodPressureDia,
            oxygenLevel,
            bodyTemperature,
            weight,
            bloodSugar,
            notes,
        } = req.body;

        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        const newVitals = new Vitals({
            patient: patientId,
            user: req.user._id,
            heartRate,
            bloodPressureSys,
            bloodPressureDia,
            oxygenLevel,
            bodyTemperature,
            weight,
            bloodSugar,
            notes,
        });

        const savedVitals = await newVitals.save();
        res.status(201).json(savedVitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a vitals record
// @route   DELETE /api/vitals/:id
// @access  Private
const deleteVitals = async (req, res) => {
    try {
        const vitals = await Vitals.findById(req.params.id);

        if (vitals && vitals.user.toString() === req.user._id.toString()) {
            await vitals.deleteOne();
            res.json({ message: 'Vitals record removed' });
        } else {
            res.status(404).json({ message: 'Vitals record not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVitalsByPatient,
    createVitals,
    deleteVitals,
};
