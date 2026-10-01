const express = require('express');
const router = express.Router();
const {
  getEmergencies,
  triggerEmergency,
  updateEmergencyStatus,
} = require('../controllers/emergencyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getEmergencies);
router.post('/trigger', triggerEmergency); // Public SOS trigger for fast distress calls
router.put('/:id/status', protect, authorize('asha', 'doctor', 'admin'), updateEmergencyStatus);

module.exports = router;
