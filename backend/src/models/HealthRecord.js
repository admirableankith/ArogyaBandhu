const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recordedByRole: {
      type: String,
      enum: ['asha', 'doctor', 'patient', 'pharmacist', 'admin'],
      required: true,
    },
    recordType: {
      type: String,
      enum: ['VITALS', 'DIAGNOSIS', 'PRESCRIPTION', 'IMMUNIZATION', 'LAB_REPORT', 'ANC_CHECKUP'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    vitals: {
      bpSystolic: Number, // e.g. 120
      bpDiastolic: Number, // e.g. 80
      bloodSugar: Number, // mg/dL (fasting or random)
      sugarType: { type: String, enum: ['Fasting', 'Post-Prandial', 'Random'] },
      pulseRate: Number, // bpm
      spO2: Number, // %
      temperature: Number, // °F
      hemoglobin: Number, // g/dL
      weightKg: Number,
      heightCm: Number,
      bmi: Number,
    },
    clinicalNotes: {
      symptoms: String,
      diagnosis: String,
      clinicalFindings: String,
      recommendations: String,
    },
    prescription: {
      medications: [
        {
          name: String,
          genericName: String,
          dosage: String,
          frequency: String,
          duration: String,
          instructions: String,
          dispensed: { type: Boolean, default: false },
        },
      ],
      doctorAdvice: String,
    },
    immunization: {
      vaccineName: String, // e.g. "BCG", "OPV-1", "Pentavalent-1", "Rotavirus", "Measles-Rubella"
      doseNumber: Number,
      beneficiaryType: { type: String, enum: ['INFANT', 'CHILD', 'PREGNANT_WOMAN', 'ADULT'] },
      nextDueDate: Date,
      administeredLocation: String,
    },
    labReport: {
      testName: String,
      resultSummary: String,
      isAbnormal: Boolean,
      fileUrl: String,
    },
    ancCheckup: {
      trimester: Number,
      fundalHeight: String,
      fetalHeartSound: String,
      edema: Boolean,
      urineAlbumin: String,
      ironFolicAcidGiven: Number, // number of tablets
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
