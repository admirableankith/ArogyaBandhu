const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'arogya_bandhu_secure_jwt_secret_key_2025',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, village, district, specialization, licenseNumber, abhaId } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or phone is already registered.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: role || 'patient',
      village: village || 'Rampur',
      district: district || 'Varanasi',
      specialization,
      licenseNumber,
      abhaId,
    });

    // If registered as patient, automatically create a patient profile if not exists
    if (user.role === 'patient') {
      await Patient.create({
        userId: user._id,
        name: user.name,
        phone: user.phone || '9876543210',
        age: 28,
        gender: 'Female',
        village: user.village,
        abhaId: user.abhaId || `ABHA-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        specialization: user.specialization,
        abhaId: user.abhaId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        specialization: user.specialization,
        abhaId: user.abhaId,
        assignedPhc: user.assignedPhc,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let patientProfile = null;
    if (user.role === 'patient') {
      patientProfile = await Patient.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user,
      patientProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick Demo Login Switcher (for hackathon review)
// @route   POST /api/auth/demo-login
// @access  Public
exports.demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body; // 'patient', 'asha', 'doctor', 'pharmacist', 'admin'
    const targetRole = role || 'asha';

    let user = await User.findOne({ role: targetRole });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No demo account found for role '${targetRole}'. Please seed database.`,
      });
    }

    const token = generateToken(user._id);

    let patientProfile = null;
    if (user.role === 'patient') {
      patientProfile = await Patient.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        specialization: user.specialization,
        abhaId: user.abhaId,
        assignedPhc: user.assignedPhc,
      },
      patientProfile,
    });
  } catch (error) {
    next(error);
  }
};
