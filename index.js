const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = require('./config/db');
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// Make the uploads folder publicly accessible statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/vitals', require('./routes/vitalsRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes'));

// Serve Frontend
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
