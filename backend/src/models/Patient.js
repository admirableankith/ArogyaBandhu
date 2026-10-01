const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    abhaId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    village: {
      type: String,
      required: true,
      default: 'Rampur',
    },
    block: {
      type: String,
      default: 'Kashi Vidyapeeth',
    },
    district: {
      type: String,
      default: 'Varanasi',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    isPregnant: {
      type: Boolean,
      default: false,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    isHighRisk: {
      type: Boolean,
      default: false,
    },
    highRiskReason: {
      type: String,
    },
    chronicConditions: [
      {
        type: String, // e.g. "Hypertension", "Type 2 Diabetes", "Asthma", "Tuberculosis"
      },
    ],
    allergies: [
      {
        type: String,
      },
    ],
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    assignedAshaWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);
