const express = require('express');
const router = express.Router();
const { triage, chat, explainPrescription } = require('../controllers/aiController');

// All AI requests route through the backend
router.post('/triage', triage);
router.post('/chat', chat);
router.post('/explain-prescription', explainPrescription);

module.exports = router;
