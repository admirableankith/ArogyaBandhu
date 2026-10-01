const express = require('express');
const router = express.Router();
const {
  getInventory,
  addMedicine,
  updateStock,
  getLowStockAlerts,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getInventory);
router.get('/alerts/low-stock', getLowStockAlerts);
router.post('/', protect, authorize('pharmacist', 'admin'), addMedicine);
router.put('/:id/stock', protect, authorize('pharmacist', 'admin', 'doctor'), updateStock);

module.exports = router;
