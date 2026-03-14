const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// @desc    Get all appointments for a specific patient
// @route   GET /api/appointments/patient/:patientId
// @access  Private
const getAppointmentsByPatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        const appointments = await Appointment.find({ patient: req.params.patientId }).sort({ appointmentDate: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all appointments for all patients under a user (Dashboard view)
// @route   GET /api/appointments
// @access  Private
const getAllUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id })
            .populate('patient', 'name relationship')
            .sort({ appointmentDate: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new appointment record
// @route   POST /api/appointments/patient/:patientId
// @access  Private
const createAppointment = async (req, res) => {
    try {
        const {
            doctorName,
            specialty,
            hospitalOrClinic,
            appointmentDate,
            time,
            reason,
            notes,
        } = req.body;

        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        const newAppointment = new Appointment({
            patient: patientId,
            user: req.user._id,
            doctorName,
            specialty,
            hospitalOrClinic,
            appointmentDate,
            time,
            reason,
            notes,
        });

        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an appointment record (e.g., changing status to 'Completed')
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment && appointment.user.toString() === req.user._id.toString()) {
            appointment.doctorName = req.body.doctorName || appointment.doctorName;
            appointment.specialty = req.body.specialty || appointment.specialty;
            appointment.hospitalOrClinic = req.body.hospitalOrClinic || appointment.hospitalOrClinic;
            appointment.appointmentDate = req.body.appointmentDate || appointment.appointmentDate;
            appointment.time = req.body.time || appointment.time;
            appointment.reason = req.body.reason || appointment.reason;
            appointment.status = req.body.status || appointment.status;
            appointment.notes = req.body.notes || appointment.notes;

            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404).json({ message: 'Appointment not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an appointment record
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment && appointment.user.toString() === req.user._id.toString()) {
            await appointment.deleteOne();
            res.json({ message: 'Appointment removed' });
        } else {
            res.status(404).json({ message: 'Appointment not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAppointmentsByPatient,
    getAllUserAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
};
