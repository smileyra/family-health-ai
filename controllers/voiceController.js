const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const Medicine = require('../models/Medicine');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Process a voice command (transcribed to text) and execute the action
// @route   POST /api/voice/command
// @access  Private
const processVoiceCommand = async (req, res) => {
    try {
        const { text } = req.body; // The transcribed text from the frontend
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ message: 'No voice command provided' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.status(500).json({ message: 'Gemini API Key is missing.' });
        }

        // Fetch user's patients to give context to the AI (so it knows who "John" or "Mom" is)
        const patients = await Patient.find({ user: userId });
        const patientContext = patients.map(p => ({ id: p._id.toString(), name: p.name, relationship: p.relationship }));

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are "Healthy Home", an AI medical voice assistant. 
            The user just spoke the following command: "${text}"

            Here are the profiles of the family members in their account:
            ${JSON.stringify(patientContext)}

            Your job is to parse the user's command and determine the INTENT and the structured DATA.
            
            Possible Intents:
            1. "LOG_VITALS": If they are trying to log blood pressure, heart rate, weight, temperature, etc.
            2. "REMINDER_MEDICINE": If they want to know what medicines to take or log a medicine. (For now, just return this intent without acting).
            3. "UNKNOWN": If the command doesn't make sense or isn't related to health.

            If the intent is LOG_VITALS, extract the exact values. Look for numbers related to:
            - heartRate (bpm)
            - bloodPressureSys (the top number)
            - bloodPressureDia (the bottom number, e.g. "120 over 80" -> Sys 120, Dia 80)
            - weight (kg)
            - bodyTemperature (Celsius)
            - bloodSugar (mg/dL)

            Also, identify WHICH patient the command refers to based on the family members list. If not specified, and there is only one patient, default to that one. If there are multiple and they didn't specify, return patientId as null.

            You MUST respond ONLY with a raw JSON object and nothing else. Do not use Markdown formatting like \`\`\`json.
            Format:
            {
                "intent": "LOG_VITALS",
                "patientId": "...", 
                "data": {
                    "heartRate": 75,
                    "bloodPressureSys": 120,
                    "bloodPressureDia": 80
                },
                "feedbackMessage": "Logging blood pressure of 120 over 80 for John."
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = (await result.response.text()).replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Parse the JSON structure created by Gemini
        let aiDecision;
        try {
            aiDecision = JSON.parse(responseText);
        } catch(e) {
            console.error("Failed to parse Gemini response as JSON:", responseText);
            return res.status(400).json({ message: "Could not understand the command." });
        }

        if (aiDecision.intent === 'LOG_VITALS' && aiDecision.patientId) {
            // Validate the patient belongs to the user
            const patientExists = await Patient.findById(aiDecision.patientId);
            if (!patientExists || patientExists.user.toString() !== userId.toString()) {
                return res.status(400).json({ message: "Could not identify the correct family member." });
            }

            // Save the vitals
            const newVitals = new Vitals({
                patient: aiDecision.patientId,
                user: userId,
                ...aiDecision.data
            });

            await newVitals.save();
            return res.json({ 
                success: true, 
                action: 'Saved Vitals', 
                message: aiDecision.feedbackMessage,
                data: newVitals
            });

        } else if (aiDecision.intent === 'UNKNOWN') {
            return res.json({ success: false, message: "I'm sorry, I didn't understand that health command." });
        }

        // Catch-all for other unhandled intents or missing patient IDs
        res.json({ 
            success: true, 
            action: aiDecision.intent,
            message: aiDecision.feedbackMessage || 'Command processed but no action taken.',
            parsedData: aiDecision
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing voice command', error: error.message });
    }
};

module.exports = {
    processVoiceCommand
};
