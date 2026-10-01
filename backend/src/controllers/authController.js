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
    const {
      name,
      email,
      phone,
      password,
      role,
      village,
      district,
      specialization,
      licenseNumber,
      abhaId,
      age,
      gender,
      bloodGroup,
      isPregnant,
      expectedDeliveryDate,
      chronicConditions,
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Check if user already exists with email or phone
    const userExists = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        ...(phone ? [{ phone: phone.trim() }] : []),
      ],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or phone number is already registered.',
      });
    }

    const assignedRole = role || 'patient';
    const userVillage = village?.trim() || 'Rampur';
    const userDistrict = district?.trim() || 'Varanasi';
    const generatedAbha = abhaId?.trim() || `ABHA-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      password,
      role: assignedRole,
      village: userVillage,
      district: userDistrict,
      specialization: specialization?.trim(),
      licenseNumber: licenseNumber?.trim(),
      abhaId: assignedRole === 'patient' ? generatedAbha : undefined,
      assignedPhc: `${userVillage} Primary Health Centre`,
    });

    let patientProfile = null;

    // If registered as patient, automatically create a patient profile in database
    if (user.role === 'patient') {
      patientProfile = await Patient.create({
        userId: user._id,
        name: user.name,
        phone: user.phone || '9876543210',
        age: age ? Number(age) : 28,
        gender: gender || 'Female',
        village: user.village,
        district: user.district,
        bloodGroup: bloodGroup || 'B+',
        isPregnant: isPregnant === true || isPregnant === 'true',
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
        chronicConditions: Array.isArray(chronicConditions)
          ? chronicConditions
          : chronicConditions
          ? [chronicConditions]
          : [],
        abhaId: user.abhaId || generatedAbha,
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
        assignedPhc: user.assignedPhc,
      },
      patientProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token (supports email or phone)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password.',
      });
    }

    const cleanInput = email.trim().toLowerCase();

    // Check user by email or phone
    const user = await User.findOne({
      $or: [{ email: cleanInput }, { phone: cleanInput }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User account not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.',
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

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
