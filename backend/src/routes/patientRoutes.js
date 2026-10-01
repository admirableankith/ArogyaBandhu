const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getHighRiskCohort,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPatients);
router.get('/cohorts/high-risk', getHighRiskCohort);
router.get('/:id', getPatientById);
router.post('/', authorize('asha', 'doctor', 'admin'), createPatient);
router.put('/:id', authorize('asha', 'doctor', 'admin'), updatePatient);

module.exports = router;
