const HealthRecord = require('../models/HealthRecord');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// @desc    Get health records for a patient
// @route   GET /api/health-records/patient/:patientId
// @access  Private
exports.getPatientRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { type } = req.query;

    let query = { patientId };
    if (type) {
      query.recordType = type;
    }

    const records = await HealthRecord.find(query)
      .populate('recordedBy', 'name role specialization assignedPhc')
      .sort({ date: -1 });

    const patient = await Patient.findById(patientId);

    res.json({
      success: true,
      patient,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new health record (Vitals, ANC Checkup, Immunization, Diagnosis, Prescription)
// @route   POST /api/health-records
// @access  Private
exports.createHealthRecord = async (req, res, next) => {
  try {
    const {
      patientId,
      recordType,
      vitals,
      clinicalNotes,
      prescription,
      immunization,
      ancCheckup,
      labReport,
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const record = await HealthRecord.create({
      patientId,
      recordedBy: req.user._id,
      recordedByRole: req.user.role,
      recordType,
      vitals,
      clinicalNotes,
      prescription,
      immunization,
      ancCheckup,
      labReport,
    });

    // Check if vitals flag high risk
    if (vitals) {
      let isHighRisk = false;
      let reason = '';

      if (vitals.bpSystolic >= 140 || vitals.bpDiastolic >= 90) {
        isHighRisk = true;
        reason = `Hypertension detected: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`;
      }
      if (vitals.spO2 && vitals.spO2 < 93) {
        isHighRisk = true;
        reason = `Low Oxygen Saturation: ${vitals.spO2}%`;
      }
      if (vitals.hemoglobin && vitals.hemoglobin < 9) {
        isHighRisk = true;
        reason = `Severe Anemia: Hb ${vitals.hemoglobin} g/dL`;
      }

      if (isHighRisk) {
        patient.isHighRisk = true;
        patient.highRiskReason = reason;
        await patient.save();

        // Create alert notification for ASHA and Doctor
        if (patient.assignedAshaWorker) {
          await Notification.create({
            userId: patient.assignedAshaWorker,
            patientId: patient._id,
            title: 'High Risk Alert: Abnormal Vitals',
            message: `Patient ${patient.name} (${patient.village}) flagged high risk: ${reason}.`,
            category: 'EMERGENCY_ALERT',
            priority: 'HIGH',
          });
        }
      }
    }

    // If Immunization given, auto create next due date notification
    if (immunization && immunization.nextDueDate && patient.userId) {
      await Notification.create({
        userId: patient.userId,
        patientId: patient._id,
        title: `Next Vaccine Due: ${immunization.vaccineName}`,
        message: `Vaccination due on ${new Date(immunization.nextDueDate).toLocaleDateString()}. Please visit your Anganwadi centre.`,
        category: 'IMMUNIZATION_DUE',
        priority: 'HIGH',
        dueDate: immunization.nextDueDate,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Health record stored successfully in Ayushman EMR.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vitals history and timeline metrics for charting
// @route   GET /api/health-records/vitals/:patientId
// @access  Private
exports.getVitalsHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const vitalsRecords = await HealthRecord.find({
      patientId,
      vitals: { $exists: true, $ne: null },
    })
      .sort({ date: 1 })
      .select('date vitals recordedByRole');

    res.json({
      success: true,
      data: vitalsRecords,
    });
  } catch (error) {
    next(error);
  }
};
