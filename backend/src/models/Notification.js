const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['MATERNAL_CARE', 'IMMUNIZATION_DUE', 'MEDICATION_REFILL', 'APPOINTMENT', 'EMERGENCY_ALERT', 'HEALTH_CAMP', 'STOCK_ALERT'],
      default: 'APPOINTMENT',
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionLink: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
