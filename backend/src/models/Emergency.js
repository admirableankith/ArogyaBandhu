const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    callerName: {
      type: String,
      required: true,
    },
    callerPhone: {
      type: String,
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    patientName: {
      type: String,
    },
    village: {
      type: String,
      required: true,
      default: 'Rampur',
    },
    landmark: {
      type: String,
    },
    location: {
      lat: {
        type: Number,
        default: 25.3176,
      },
      lng: {
        type: Number,
        default: 82.9739,
      },
    },
    emergencyType: {
      type: String,
      enum: ['SNAKE_BITE', 'MATERNAL_COMPLICATION', 'CARDIAC_CHEST_PAIN', 'SEVERE_TRAUMA_ACCIDENT', 'RESPIRATORY_DISTRESS', 'HIGH_FEVER_CONVULSION', 'OTHER'],
      default: 'OTHER',
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM'],
      default: 'CRITICAL',
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['REPORTED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'RESOLVED', 'CANCELLED'],
      default: 'REPORTED',
    },
    assignedAmbulance: {
      vehicleNumber: String,
      driverName: String,
      driverPhone: String,
      etaMinutes: Number,
    },
    assignedFacility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
    },
    assignedAsha: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actionNotes: [
      {
        note: String,
        updatedBy: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Emergency', emergencySchema);
