const Patient = require('../models/Patient');

// @desc    Get all patients for the logged-in user
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({ user: req.user._id });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single patient profile
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient && patient.user.toString() === req.user._id.toString()) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new patient profile
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
    try {
        const {
            name,
            relationship,
            dateOfBirth,
            gender,
            bloodGroup,
            allergies,
            chronicConditions,
            emergencyContact,
        } = req.body;

        const patient = new Patient({
            user: req.user._id,
            name,
            relationship,
            dateOfBirth,
            gender,
            bloodGroup,
            allergies,
            chronicConditions,
            emergencyContact,
        });

        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a patient profile
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient && patient.user.toString() === req.user._id.toString()) {
            patient.name = req.body.name || patient.name;
            patient.relationship = req.body.relationship || patient.relationship;
            patient.dateOfBirth = req.body.dateOfBirth || patient.dateOfBirth;
            patient.gender = req.body.gender || patient.gender;
            patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
            patient.allergies = req.body.allergies || patient.allergies;
            patient.chronicConditions = req.body.chronicConditions || patient.chronicConditions;
            patient.emergencyContact = req.body.emergencyContact || patient.emergencyContact;

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a patient profile
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient && patient.user.toString() === req.user._id.toString()) {
            await patient.deleteOne();
            res.json({ message: 'Patient removed' });
        } else {
            res.status(404).json({ message: 'Patient not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
};
