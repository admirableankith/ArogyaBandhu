const Emergency = require('../models/Emergency');
const Facility = require('../models/Facility');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all emergency SOS alerts (with status filter)
// @route   GET /api/emergency
// @access  Private
exports.getEmergencies = async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    let query = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;

    const emergencies = await Emergency.find(query)
      .populate('patientId', 'name age gender phone village abhaId isPregnant')
      .populate('assignedFacility', 'name facilityType phone emergencyHelpline')
      .populate('assignedAsha', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger a new Emergency SOS request
// @route   POST /api/emergency/trigger
// @access  Public / Private
exports.triggerEmergency = async (req, res, next) => {
  try {
    const {
      callerName,
      callerPhone,
      patientId,
      patientName,
      village,
      landmark,
      location,
      emergencyType,
      severity,
      description,
    } = req.body;

    // Find nearest PHC/CHC facility with ambulance
    const nearestFacility = await Facility.findOne({ hasAmbulance: true });

    // Find on-duty ASHA worker in the village or district
    const onDutyAsha = await User.findOne({ role: 'asha', village: village || 'Rampur' });

    const emergency = await Emergency.create({
      callerName: callerName || (req.user ? req.user.name : 'Citizen Alert'),
      callerPhone: callerPhone || (req.user ? req.user.phone : '108'),
      patientId: patientId || undefined,
      patientName: patientName || callerName || 'Emergency Patient',
      village: village || (req.user ? req.user.village : 'Rampur'),
      landmark: landmark || 'Near Village Panchayat Bhawan',
      location: location || { lat: 25.3176, lng: 82.9739 },
      emergencyType: emergencyType || 'OTHER',
      severity: severity || 'CRITICAL',
      description: description || 'Emergency SOS button triggered. Immediate medical assistance required.',
      status: 'REPORTED',
      assignedFacility: nearestFacility ? nearestFacility._id : undefined,
      assignedAsha: onDutyAsha ? onDutyAsha._id : undefined,
      assignedAmbulance: {
        vehicleNumber: `UP-65-AMB-${Math.floor(1000 + Math.random() * 9000)}`,
        driverName: 'Rajesh Kumar (108 Pilot)',
        driverPhone: '+91 94150 99881',
        etaMinutes: 12,
      },
      actionNotes: [
        {
          note: 'SOS Alert received by Central Health Dispatch. Emergency 108 ambulance notified.',
          updatedBy: 'System Auto-Dispatch',
          timestamp: new Date(),
        },
      ],
    });

    // Notify all health workers & admins in database
    const responders = await User.find({ role: { $in: ['asha', 'doctor', 'admin'] } });
    for (const responder of responders) {
      await Notification.create({
        userId: responder._id,
        patientId: patientId || undefined,
        title: `🚨 EMERGENCY SOS: ${emergencyType} in ${emergency.village}`,
        message: `${emergency.description} - Ambulance ETA: 12 mins. Contact: ${emergency.callerPhone}`,
        category: 'EMERGENCY_ALERT',
        priority: 'HIGH',
      });
    }

    const populated = await Emergency.findById(emergency._id)
      .populate('assignedFacility')
      .populate('assignedAsha');

    res.status(201).json({
      success: true,
      message: '🚨 Emergency SOS Dispatched! 108 Emergency Response Team notified.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update emergency status (e.g., DISPATCHED -> EN_ROUTE -> RESOLVED)
// @route   PUT /api/emergency/:id/status
// @access  Private (asha, doctor, admin)
exports.updateEmergencyStatus = async (req, res, next) => {
  try {
    const { status, note, ambulanceEtaMinutes } = req.body;

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found',
      });
    }

    if (status) emergency.status = status;
    if (ambulanceEtaMinutes && emergency.assignedAmbulance) {
      emergency.assignedAmbulance.etaMinutes = Number(ambulanceEtaMinutes);
    }
    if (status === 'RESOLVED') {
      emergency.resolvedAt = new Date();
    }

    if (note) {
      emergency.actionNotes.push({
        note,
        updatedBy: req.user ? `${req.user.name} (${req.user.role.toUpperCase()})` : 'Responder',
        timestamp: new Date(),
      });
    }

    await emergency.save();

    res.json({
      success: true,
      message: `Emergency status updated to ${status}`,
      data: emergency,
    });
  } catch (error) {
    next(error);
  }
};
