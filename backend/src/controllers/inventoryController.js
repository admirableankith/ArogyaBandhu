const Inventory = require('../models/Inventory');
const Facility = require('../models/Facility');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all inventory medicines (with filter for category, search, low stock, facility)
// @route   GET /api/inventory
// @access  Private / Public
exports.getInventory = async (req, res, next) => {
  try {
    const { search, category, lowStock, facilityId } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.isLowStock = true;
    }

    if (facilityId) {
      query.facilityId = facilityId;
    }

    const inventory = await Inventory.find(query)
      .populate('facilityId', 'name facilityType village')
      .sort({ isLowStock: -1, name: 1 });

    res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new medicine / stock batch to inventory
// @route   POST /api/inventory
// @access  Private (pharmacist, admin)
exports.addMedicine = async (req, res, next) => {
  try {
    const {
      facilityId,
      name,
      genericName,
      category,
      dosageForm,
      strength,
      quantity,
      unit,
      minThreshold,
      batchNumber,
      expiryDate,
      pricePerUnit,
    } = req.body;

    let facilityName = 'PHC Main Pharmacy';
    if (facilityId) {
      const fac = await Facility.findById(facilityId);
      if (fac) facilityName = fac.name;
    } else {
      // Default to first facility
      const firstFac = await Facility.findOne();
      if (firstFac) {
        facilityName = firstFac.name;
      }
    }

    const item = await Inventory.create({
      facilityId: facilityId || (await Facility.findOne())?._id,
      facilityName,
      name,
      genericName,
      category: category || 'ESSENTIAL',
      dosageForm: dosageForm || 'Tablet',
      strength: strength || '500mg',
      quantity: Number(quantity) || 0,
      unit: unit || 'strips',
      minThreshold: Number(minThreshold) || 50,
      batchNumber: batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      pricePerUnit: Number(pricePerUnit) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Medicine batch registered in PHC inventory',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock quantity (dispense or restock)
// @route   PUT /api/inventory/:id/stock
// @access  Private (pharmacist, admin, doctor)
exports.updateStock = async (req, res, next) => {
  try {
    const { adjustment, operation, newQuantity } = req.body; // operation: 'ADD', 'DISPENSE', 'SET'

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found in inventory',
      });
    }

    if (operation === 'ADD') {
      item.quantity += Number(adjustment || 0);
    } else if (operation === 'DISPENSE') {
      const qtyToDispense = Number(adjustment || 0);
      if (item.quantity < qtyToDispense) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Current stock is ${item.quantity} ${item.unit}.`,
        });
      }
      item.quantity -= qtyToDispense;
    } else if (operation === 'SET') {
      item.quantity = Number(newQuantity >= 0 ? newQuantity : 0);
    }

    item.isLowStock = item.quantity <= item.minThreshold;
    await item.save();

    // If item reached low stock, trigger alert to pharmacist and admin
    if (item.isLowStock) {
      const pharmacists = await User.find({ role: { $in: ['pharmacist', 'admin'] } });
      for (const p of pharmacists) {
        await Notification.create({
          userId: p._id,
          title: `Low Stock Alert: ${item.name}`,
          message: `${item.name} (${item.genericName}) is at critical level (${item.quantity} ${item.unit} remaining). Reorder required.`,
          category: 'STOCK_ALERT',
          priority: 'HIGH',
        });
      }
    }

    res.json({
      success: true,
      message: `Stock updated for ${item.name}. Current balance: ${item.quantity} ${item.unit}`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Critical / Low-stock alerts
// @route   GET /api/inventory/alerts/low-stock
// @access  Private
exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const lowStockItems = await Inventory.find({ isLowStock: true })
      .populate('facilityId', 'name village phone')
      .sort({ quantity: 1 });

    res.json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error) {
    next(error);
  }
};
