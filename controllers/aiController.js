const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const Medicine = require('../models/Medicine');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert a local file to the Google Generative AI "GenerativePart" object format
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

// @desc    Analyze an uploaded medical report and generate a plain English summary
// @route   POST /api/ai/analyze-report/:reportId
// @access  Private
const analyzeReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId).populate('patient', 'name dateOfBirth gender');

        if (!report || report.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Report not found or unauthorized' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.status(500).json({ message: 'Gemini API Key is missing or invalid in server configuration.' });
        }

        const filePath = path.join(__dirname, '..', report.fileUrl);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Physical file not found.' });
        }

        // Determine mimeType
        let mimeType = 'image/jpeg';
        if (filePath.endsWith('.png')) mimeType = 'image/png';
        if (filePath.endsWith('.pdf')) mimeType = 'application/pdf'; // Note: Gemini 1.5 Pro supports PDF natively

        const filePart = fileToGenerativePart(filePath, mimeType);

        // We use gemini-2.5-flash as the best general vision/multimodal model for fast analyses
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expert AI medical assistant reviewing a patient's medical document.
            Patient Details:
            Name: ${report.patient.name}
            Date of Birth: ${report.patient.dateOfBirth}
            Gender: ${report.patient.gender}
            Document Type Provided by user: ${report.reportType}
            
            Please carefully analyze this document (it could be an X-Ray, ECG, Lab blood test, etc.).
            Provide a clear, patient-friendly summary of the findings in the following format:
            1. What type of document this appears to be.
            2. The key findings or normal/abnormal values.
            3. A simple, easy-to-understand explanation of what these findings mean for the patient's health.
            4. Important Question to ask their doctor based on this report.

            Disclaimer: Include a final sentence reminding the user that this is an AI analysis and they MUST consult a real doctor for a final diagnosis.
        `;

        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        const textSummary = response.text();

        // Save summary back to the report document
        report.aiSummary = textSummary;
        await report.save();

        res.json({ aiSummary: textSummary, updatedReport: report });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error analyzing report with AI', error: error.message });
    }
};

// @desc    Generate a holistic health insight based on Vitals & Medicines
// @route   GET /api/ai/insights/:patientId
// @access  Private
const getHealthInsights = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);
        
        if (!patient || patient.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Patient not found or unauthorized' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.status(500).json({ message: 'Gemini API Key is missing.' });
        }

        const vitals = await Vitals.find({ patient: patient._id }).sort({ recordedAt: -1 }).limit(5);
        const medicines = await Medicine.find({ patient: patient._id, isActive: true });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a caring, intelligent AI health assistant providing insights for a patient.
            
            Patient Profile:
            Name: ${patient.name}
            Age: Calculated from DOB ${patient.dateOfBirth}
            Gender: ${patient.gender}
            Conditions: ${patient.chronicConditions.join(', ')}
            Allergies: ${patient.allergies.join(', ')}

            Recent Vitals (Last 5 readings):
            ${vitals.map(v => JSON.stringify(v)).join('\n')}

            Current Active Medications:
            ${medicines.map(m => m.name + ' - ' + m.dosage).join('\n')}

            Please provide a holistic health overview. 
            Highlight any potential warning signs in their recent vitals.
            Suggest lifestyle, diet, or routine considerations based on their conditions and medications.
            Keep the tone supportive, informative, and simple.

            Disclaimer: Remind them you are an AI assistant and they should verify any major concerns with their physician.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textSummary = response.text();

        res.json({ insights: textSummary });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating health insights with AI', error: error.message });
    }
};

// @desc    Chat with a medical document
// @route   POST /api/ai/chat-scanner
// @access  Public (for demo purposes)
const chatScanner = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.status(500).json({ message: 'Gemini API Key is missing.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const { message, chatHistory } = req.body;
        
        let promptArgs = [];
        
        // Add chat history context if any
        if (chatHistory) {
             try {
                const historyArr = JSON.parse(chatHistory);
                const stringifiedHistory = historyArr.map(h => `${h.role === 'user' ? 'User' : 'AI'}: ${h.text}`).join('\n');
                promptArgs.push(`Here is the previous chat context:\n${stringifiedHistory}\n\n`);
             } catch(e) { }
        }

        // Add user's new message
        promptArgs.push(`User asks: ${message || 'Please analyze this medical document in detail and tell me what it means.'}\nPlease answer as a helpful, caring, and professional medical AI bot. Remember to add a disclaimer at the end that you are an AI and the user should consult a real doctor.`);

        if (req.file) {
             const filePath = req.file.path;
             let mimeType = req.file.mimetype;
             if (filePath.endsWith('.pdf')) mimeType = 'application/pdf';
             const filePart = fileToGenerativePart(filePath, mimeType);
             promptArgs.push(filePart);
        }

        const result = await model.generateContent(promptArgs);
        const response = await result.response;
        const textSummary = response.text();
        
        res.json({ reply: textSummary });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in chat scanner', error: error.message });
    }
};

module.exports = {
    analyzeReport,
    getHealthInsights,
    chatScanner
};
