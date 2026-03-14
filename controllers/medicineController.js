const Medicine = require('../models/Medicine');
const Patient = require('../models/Patient');

// @desc    Get all medicines for a specific patient
// @route   GET /api/medicines/patient/:patientId
// @access  Private
const getMedicinesByPatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        const medicines = await Medicine.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new medicine record
// @route   POST /api/medicines/patient/:patientId
// @access  Private
const createMedicine = async (req, res) => {
    try {
        const {
            name,
            dosage,
            frequency,
            timesOfDay,
            startDate,
            endDate,
            isActive,
            instructions,
            prescribingDoctor,
        } = req.body;

        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        const newMedicine = new Medicine({
            patient: patientId,
            user: req.user._id,
            name,
            dosage,
            frequency,
            timesOfDay,
            startDate,
            endDate,
            isActive,
            instructions,
            prescribingDoctor,
        });

        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a medicine record
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (medicine && medicine.user.toString() === req.user._id.toString()) {
            medicine.name = req.body.name || medicine.name;
            medicine.dosage = req.body.dosage || medicine.dosage;
            medicine.frequency = req.body.frequency || medicine.frequency;
            medicine.timesOfDay = req.body.timesOfDay || medicine.timesOfDay;
            medicine.startDate = req.body.startDate || medicine.startDate;
            if(req.body.endDate !== undefined) {
               medicine.endDate = req.body.endDate;
            }
            if(req.body.isActive !== undefined) {
               medicine.isActive = req.body.isActive;
            }
            medicine.instructions = req.body.instructions || medicine.instructions;
            medicine.prescribingDoctor = req.body.prescribingDoctor || medicine.prescribingDoctor;

            const updatedMedicine = await medicine.save();
            res.json(updatedMedicine);
        } else {
            res.status(404).json({ message: 'Medicine not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Delete a medicine record
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (medicine && medicine.user.toString() === req.user._id.toString()) {
            await medicine.deleteOne();
            res.json({ message: 'Medicine removed' });
        } else {
            res.status(404).json({ message: 'Medicine not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMedicinesByPatient,
    createMedicine,
    updateMedicine,
    deleteMedicine,
};
