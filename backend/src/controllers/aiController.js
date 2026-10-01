const {
  callGeminiTriage,
  processHealthChat,
  explainMedications,
} = require('../services/aiService');

// @desc    Symptom Triage and Clinical Decision Support
// @route   POST /api/ai/triage
// @access  Public / Private
exports.triage = async (req, res, next) => {
  try {
    const { symptoms, age, gender, isPregnant, vitals, language } = req.body;

    if (!symptoms || symptoms.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please describe the symptoms.',
      });
    }

    const result = await callGeminiTriage(
      symptoms,
      age || 30,
      gender || 'Female',
      Boolean(isPregnant),
      vitals || {},
      language || 'en'
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive Rural Health Assistant Chat
// @route   POST /api/ai/chat
// @access  Public / Private
exports.chat = async (req, res, next) => {
  try {
    const { message, query, history, language } = req.body;
    const userQuery = message || query;

    if (!userQuery || userQuery.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message query cannot be empty.',
      });
    }

    const result = await processHealthChat({
      query: userQuery,
      history: history || [],
      language: language || 'en',
      userRole: req.user ? req.user.role : 'patient',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain Prescription & Drug Safety
// @route   POST /api/ai/explain-prescription
// @access  Public / Private
exports.explainPrescription = async (req, res, next) => {
  try {
    const { medications, diagnosis, language } = req.body;

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of medications to explain.',
      });
    }

    const result = explainMedications(medications, diagnosis);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
