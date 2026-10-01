const express = require('express');
const router = express.Router();
const {
  getFacilities,
  findNearest,
  getFacilityById,
} = require('../controllers/facilityController');

router.get('/', getFacilities);
router.get('/nearest', findNearest);
router.get('/:id', getFacilityById);

module.exports = router;
