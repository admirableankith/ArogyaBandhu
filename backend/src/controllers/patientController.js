const Patient = require('../models/Patient');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');

// @desc    Get all patients (with search, filter by high risk / pregnant / village)
// @route   GET /api/patients
// @access  Private (asha, doctor, admin; patients only see their own record)
exports.getPatients = async (req, res, next) => {
  try {
    const { search, highRisk, isPregnant, village } = req.query;
    let query = {};

    // Patient users must ONLY see their own patient document
    if (req.user.role === 'patient') {
      query.userId = req.user._id;
    } else {
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { abhaId: { $regex: search, $options: 'i' } },
          { village: { $regex: search, $options: 'i' } },
        ];
      }

      if (highRisk === 'true') {
        query.isHighRisk = true;
      }

      if (isPregnant === 'true') {
        query.isPregnant = true;
      }

      if (village) {
        query.village = { $regex: village, $options: 'i' };
      }
    }

    const patients = await Patient.find(query)
      .populate('assignedAshaWorker', 'name phone')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('assignedAshaWorker', 'name phone email');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    // Patient role can only view their own patient profile
    if (req.user.role === 'patient' && (!patient.userId || patient.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view another patient’s profile.',
      });
    }

    const healthRecords = await HealthRecord.find({ patientId: patient._id })
      .populate('recordedBy', 'name role specialization')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: patient,
      healthRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new patient (e.g. by ASHA worker during home visit)
// @route   POST /api/patients
// @access  Private (asha, doctor, admin)
exports.createPatient = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      village,
      block,
      district,
      bloodGroup,
      isPregnant,
      expectedDeliveryDate,
      isHighRisk,
      highRiskReason,
      chronicConditions,
      allergies,
      emergencyContact,
      abhaId,
    } = req.body;

    const generatedAbha = abhaId || `ABHA-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      village: village || 'Rampur',
      block: block || 'Kashi Vidyapeeth',
      district: district || 'Varanasi',
      bloodGroup: bloodGroup || 'Unknown',
      isPregnant: isPregnant || false,
      expectedDeliveryDate,
      isHighRisk: isHighRisk || false,
      highRiskReason,
      chronicConditions: chronicConditions || [],
      allergies: allergies || [],
      emergencyContact,
      abhaId: generatedAbha,
      assignedAshaWorker: req.user.role === 'asha' ? req.user._id : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully with ABHA ID ' + patient.abhaId,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient record (e.g. update high risk flag or delivery date)
// @route   PUT /api/patients/:id
// @access  Private (asha, doctor, admin)
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.json({
      success: true,
      message: 'Patient record updated successfully',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get High Risk Pregnancy & Malnutrition Cohort
// @route   GET /api/patients/cohorts/high-risk
// @access  Private (asha, doctor, admin)
exports.getHighRiskCohort = async (req, res, next) => {
  try {
    const highRiskMothers = await Patient.find({ isPregnant: true, isHighRisk: true })
      .populate('assignedAshaWorker', 'name phone')
      .sort({ expectedDeliveryDate: 1 });

    const chronicPatients = await Patient.find({
      $or: [
        { isHighRisk: true, isPregnant: false },
        { 'chronicConditions.0': { $exists: true } },
      ],
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: {
        highRiskMothers,
        chronicPatients,
        totalHighRiskCount: highRiskMothers.length + chronicPatients.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
