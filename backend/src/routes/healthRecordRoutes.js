const express = require('express');
const router = express.Router();
const {
  getPatientRecords,
  createHealthRecord,
  getVitalsHistory,
} = require('../controllers/healthRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/patient/:patientId', getPatientRecords);
router.get('/vitals/:patientId', getVitalsHistory);
router.post('/', authorize('asha', 'doctor', 'admin', 'pharmacist'), createHealthRecord);

module.exports = router;
