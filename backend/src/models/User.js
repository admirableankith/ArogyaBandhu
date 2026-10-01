const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email or Phone is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['patient', 'asha', 'doctor', 'pharmacist', 'admin'],
      default: 'patient',
    },
    village: {
      type: String,
      default: 'Rampur',
    },
    district: {
      type: String,
      default: 'Varanasi',
    },
    state: {
      type: String,
      default: 'Uttar Pradesh',
    },
    specialization: {
      type: String, // For doctors (e.g. General Physician, Gynaecologist, Paediatrician)
    },
    licenseNumber: {
      type: String, // For doctors/pharmacists
    },
    assignedPhc: {
      type: String,
      default: 'Rampur Primary Health Centre',
    },
    abhaId: {
      type: String, // Ayushman Bharat Health Account ID for patients
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
