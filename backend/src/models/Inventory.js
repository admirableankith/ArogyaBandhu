const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    facilityName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['ESSENTIAL', 'ANTIBIOTIC', 'MATERNAL_CHILD', 'EMERGENCY', 'CHRONIC_CARE', 'VACCINE', 'CONSUMABLE'],
      default: 'ESSENTIAL',
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Syrup', 'Injection', 'Capsule', 'Ointment', 'IV Fluid', 'Drops', 'Sachet'],
      default: 'Tablet',
    },
    strength: {
      type: String,
      default: '500mg',
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      default: 'strips',
    },
    minThreshold: {
      type: Number,
      default: 50,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      default: 0, // In government PHC / Jan Aushadhi subsidized price (₹)
    },
    isSubsidized: {
      type: Boolean,
      default: true,
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.pre('save', function (next) {
  this.isLowStock = this.quantity <= this.minThreshold;
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
