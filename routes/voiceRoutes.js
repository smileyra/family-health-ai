const express = require('express');
const router = express.Router();
const { processVoiceCommand } = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

// Route to process a transcribed voice command
router.route('/command')
    .post(protect, processVoiceCommand);

module.exports = router;
