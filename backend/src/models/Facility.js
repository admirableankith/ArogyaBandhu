const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    facilityType: {
      type: String,
      enum: ['SUB_CENTRE', 'PHC', 'CHC', 'JAN_AUSHADHI', 'DISTRICT_HOSPITAL', 'WELLNESS_CENTRE'],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      default: 'Varanasi',
    },
    state: {
      type: String,
      required: true,
      default: 'Uttar Pradesh',
    },
    pincode: {
      type: String,
      default: '221001',
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    phone: {
      type: String,
      required: true,
    },
    emergencyHelpline: {
      type: String,
      default: '108',
    },
    operatingHours: {
      type: String,
      default: '24x7 Emergency / 9 AM - 5 PM OPD',
    },
    availableBeds: {
      type: Number,
      default: 10,
    },
    totalBeds: {
      type: Number,
      default: 20,
    },
    doctorCount: {
      type: Number,
      default: 2,
    },
    hasAmbulance: {
      type: Boolean,
      default: true,
    },
    hasPharmacy: {
      type: Boolean,
      default: true,
    },
    services: [
      {
        type: String, // e.g. "General OPD", "Maternal Care (ANC/PNC)", "Immunization", "Emergency Snakebite Treatment", "Jan Aushadhi Drugs", "Telemedicine"
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Facility', facilitySchema);
