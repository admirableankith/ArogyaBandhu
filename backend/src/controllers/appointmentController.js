const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const HealthRecord = require('../models/HealthRecord');
const Notification = require('../models/Notification');

// @desc    Get all appointments (role-aware)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        filter.patientId = patient._id;
      }
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    } else if (req.user.role === 'asha') {
      filter.ashaId = req.user._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender village phone abhaId isPregnant isHighRisk')
      .populate('doctorId', 'name specialization assignedPhc phone')
      .populate('ashaId', 'name phone')
      .populate('facilityId', 'name facilityType village')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId', 'name specialization assignedPhc phone email')
      .populate('ashaId', 'name phone')
      .populate('facilityId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Book a new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    let {
      patientId,
      doctorId,
      facilityId,
      appointmentDate,
      timeSlot,
      type,
      symptoms,
      triageLevel,
    } = req.body;

    // If patient is booking, use their patient profile
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        patientId = patient._id;
      }
    }

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient profile is required to book appointment.',
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      ashaId: req.user.role === 'asha' ? req.user._id : undefined,
      facilityId,
      appointmentDate: appointmentDate || new Date(),
      timeSlot: timeSlot || '10:00 AM - 10:30 AM',
      type: type || 'TELECONSULT',
      symptoms,
      triageLevel: triageLevel || 'ROUTINE',
      status: 'CONFIRMED',
    });

    // Create a real follow-up Notification for patient & doctor
    const patientDoc = await Patient.findById(patientId);
    if (patientDoc && patientDoc.userId) {
      await Notification.create({
        userId: patientDoc.userId,
        patientId: patientDoc._id,
        title: 'Appointment Confirmed',
        message: `Your ${type} appointment is confirmed for ${new Date(appointmentDate || Date.now()).toLocaleDateString()} at ${timeSlot || '10:00 AM'}.`,
        category: 'APPOINTMENT',
        priority: triageLevel === 'EMERGENCY' ? 'HIGH' : 'MEDIUM',
        dueDate: appointmentDate,
      });
    }

    if (doctorId) {
      await Notification.create({
        userId: doctorId,
        patientId: patientId,
        title: 'New Patient Consultation Scheduled',
        message: `Patient ${patientDoc ? patientDoc.name : 'Citizen'} booked a ${type} consultation for ${timeSlot || '10:00 AM'}.`,
        category: 'APPOINTMENT',
        priority: triageLevel === 'EMERGENCY' ? 'HIGH' : 'MEDIUM',
      });
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId')
      .populate('doctorId', 'name specialization assignedPhc')
      .populate('facilityId');

    res.status(201).json({
      success: true,
      message: 'Appointment successfully scheduled and stored in database.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status / Add doctor consultation notes & prescription
// @route   PUT /api/appointments/:id
// @access  Private (doctor, asha, admin)
exports.updateAppointment = async (req, res, next) => {
  try {
    const { status, doctorNotes, diagnosis, prescribedMedicines, followUpDate } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (status) appointment.status = status;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (prescribedMedicines) appointment.prescribedMedicines = prescribedMedicines;
    if (followUpDate) appointment.followUpDate = followUpDate;

    await appointment.save();

    // If completed and has medicines, automatically create a HealthRecord of type PRESCRIPTION / DIAGNOSIS
    if (status === 'COMPLETED' && (prescribedMedicines?.length > 0 || diagnosis)) {
      await HealthRecord.create({
        patientId: appointment.patientId,
        recordedBy: req.user._id,
        recordedByRole: req.user.role,
        recordType: 'PRESCRIPTION',
        clinicalNotes: {
          symptoms: appointment.symptoms,
          diagnosis: diagnosis || 'Clinical Examination',
          recommendations: doctorNotes,
        },
        prescription: {
          medications: prescribedMedicines || [],
          doctorAdvice: doctorNotes,
        },
      });

      // Also create follow up notification if followUpDate is set
      if (followUpDate) {
        const patientDoc = await Patient.findById(appointment.patientId);
        if (patientDoc?.userId) {
          await Notification.create({
            userId: patientDoc.userId,
            patientId: patientDoc._id,
            title: 'Doctor Follow-up Due',
            message: `Follow-up visit recommended with Dr. on ${new Date(followUpDate).toLocaleDateString()}.`,
            category: 'APPOINTMENT',
            priority: 'MEDIUM',
            dueDate: followUpDate,
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Appointment consultation record updated successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
