const express = require('express');
const router = express.Router();
const {
    getMedicinesByPatient,
    createMedicine,
    updateMedicine,
    deleteMedicine,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

router.route('/patient/:patientId')
    .get(protect, getMedicinesByPatient)
    .post(protect, createMedicine);

router.route('/:id')
    .put(protect, updateMedicine)
    .delete(protect, deleteMedicine);

module.exports = router;
