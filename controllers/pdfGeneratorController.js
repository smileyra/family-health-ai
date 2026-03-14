const PDFDocument = require('pdfkit');
const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const Medicine = require('../models/Medicine');
const Report = require('../models/Report');

// @desc    Generate a comprehensive PDF health report for a patient
// @route   GET /api/reports/generate-pdf/:patientId
// @access  Private
const generatePatientReportPDF = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);

        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        // Fetch user data for the PDF
        const vitals = await Vitals.find({ patient: patientId }).sort({ recordedAt: -1 }).limit(10);
        const medicines = await Medicine.find({ patient: patientId, isActive: true });
        // Fetch only documents that have an AI summary to show to the doctor
        const aiReports = await Report.find({ patient: patientId, aiSummary: { $exists: true, $ne: '' } }).sort({ dateOfReport: -1 }).limit(3);

        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers to force download
        res.setHeader('Content-disposition', `attachment; filename=Health_Report_${patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF directly to the response object
        doc.pipe(res);

        // ---- HEADER ----
        doc.fontSize(24).text('Healthy Home AI', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(16).text('Comprehensive Health Summary', { align: 'center' });
        doc.moveDown(2);

        // ---- PATIENT PROFILE ----
        doc.fontSize(14).text('Patient Profile', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Name: ${patient.name}`);
        doc.text(`Date of Birth: ${new Date(patient.dateOfBirth).toLocaleDateString()}`);
        doc.text(`Gender: ${patient.gender}`);
        if(patient.bloodGroup) doc.text(`Blood Group: ${patient.bloodGroup}`);
        doc.text(`Conditions: ${patient.chronicConditions.join(', ') || 'None'}`);
        doc.text(`Allergies: ${patient.allergies.join(', ') || 'None'}`);
        doc.moveDown(2);

        // ---- ACTIVE MEDICATIONS ----
        doc.fontSize(14).text('Active Medications', { underline: true });
        doc.moveDown(0.5);
        if (medicines.length === 0) {
            doc.fontSize(12).text('No active medications on record.');
        } else {
            medicines.forEach(med => {
                doc.fontSize(12).text(`• ${med.name} (${med.dosage}) - ${med.frequency} [Started: ${new Date(med.startDate).toLocaleDateString()}]`);
                if(med.instructions) doc.fontSize(10).fillColor('gray').text(`   Instructions: ${med.instructions}`).fillColor('black');
            });
        }
        doc.moveDown(2);

        // ---- RECENT VITALS ----
        doc.fontSize(14).text('Recent Vitals (Last 10 Readings)', { underline: true });
        doc.moveDown(0.5);
        if (vitals.length === 0) {
            doc.fontSize(12).text('No recorded vitals.');
        } else {
            vitals.forEach((v, index) => {
                const dateHeader = new Date(v.recordedAt).toLocaleString();
                let vitalString = `[${dateHeader}] `;
                if(v.bloodPressureSys && v.bloodPressureDia) vitalString += `BP: ${v.bloodPressureSys}/${v.bloodPressureDia} mmHg | `;
                if(v.heartRate) vitalString += `HR: ${v.heartRate} bpm | `;
                if(v.oxygenLevel) vitalString += `SpO2: ${v.oxygenLevel}% | `;
                if(v.bloodSugar) vitalString += `BS: ${v.bloodSugar} mg/dL | `;
                if(v.weight) vitalString += `Weight: ${v.weight} kg`;
                
                doc.fontSize(10).text(vitalString);
                
                if (v.notes) {
                    doc.fontSize(9).fillColor('gray').text(`   Notes: ${v.notes}`).fillColor('black');
                }
                doc.moveDown(0.5);
            });
        }
        doc.moveDown(2);

        // ---- AI LAB INSIGHTS ----
        if (aiReports.length > 0) {
            doc.addPage();
            doc.fontSize(14).text('AI Summarized Medical Reports', { underline: true });
            doc.moveDown(1);
            
            aiReports.forEach(report => {
                doc.fontSize(12).text(`Report: ${report.title} (${report.reportType})`, { continued: true }).text(` - Date: ${new Date(report.dateOfReport).toLocaleDateString()}`, {align: 'right'});
                doc.moveDown(0.5);
                
                doc.fontSize(10).text(report.aiSummary, {
                    align: 'justify',
                    indent: 20
                });
                doc.moveDown(1.5);
            });
        }

        // ---- FOOTER ----
        doc.fontSize(10).fillColor('gray').text('Generated by Healthy Home AI System. Note: AI Summaries should be verified by a medical professional.', 50, doc.page.height - 50, { align: 'center' });

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating PDF report', error: error.message });
    }
};

module.exports = {
    generatePatientReportPDF
};
