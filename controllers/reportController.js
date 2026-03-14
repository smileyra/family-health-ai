const Report = require('../models/Report');
const Patient = require('../models/Patient');
const fs = require('fs');
const path = require('path');

// @desc    Get all reports for a specific patient
// @route   GET /api/reports/patient/:patientId
// @access  Private
const getReportsByPatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        const reports = await Report.find({ patient: req.params.patientId }).sort({ dateOfReport: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a new medical report
// @route   POST /api/reports/patient/:patientId
// @access  Private
const uploadReport = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file (PDF or Image)' });
        }

        const { title, reportType, dateOfReport, notes } = req.body;

        const newReport = new Report({
            patient: patientId,
            user: req.user._id,
            title,
            reportType,
            dateOfReport,
            fileUrl: `/uploads/${req.file.filename}`, // the frontend can use this to render/download
            notes,
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a medical report
// @route   DELETE /api/reports/:id
// @access  Private
// Notice: We also need to delete the physical file from the server when deleting the database record
const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (report && report.user.toString() === req.user._id.toString()) {
            // Delete actual file from uploads folder
            const filePath = path.join(__dirname, '..', report.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            await report.deleteOne();
            res.json({ message: 'Report removed' });
        } else {
            res.status(404).json({ message: 'Report not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReportsByPatient,
    uploadReport,
    deleteReport,
};
