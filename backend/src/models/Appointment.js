const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ashaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      default: '10:00 AM - 10:30 AM',
    },
    type: {
      type: String,
      enum: ['IN_PERSON', 'TELECONSULT', 'ASHA_VISIT'],
      default: 'TELECONSULT',
    },
    symptoms: {
      type: String,
      required: true,
    },
    triageLevel: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'EMERGENCY'],
      default: 'ROUTINE',
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
    },
    doctorNotes: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    prescribedMedicines: [
      {
        name: String,
        dosage: String, // e.g. "500mg"
        frequency: String, // e.g. "1-0-1 (After Meals)"
        duration: String, // e.g. "5 days"
        instructions: String,
      },
    ],
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
