const Facility = require('../models/Facility');
const Inventory = require('../models/Inventory');

// Calculate Haversine distance in Kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// @desc    Get all facilities with optional filters
// @route   GET /api/facilities
// @access  Public
exports.getFacilities = async (req, res, next) => {
  try {
    const { type, village, district, hasAmbulance, search } = req.query;
    let query = {};

    if (type) query.facilityType = type;
    if (village) query.village = { $regex: village, $options: 'i' };
    if (district) query.district = { $regex: district, $options: 'i' };
    if (hasAmbulance === 'true') query.hasAmbulance = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { services: { $regex: search, $options: 'i' } },
      ];
    }

    const facilities = await Facility.find(query).sort({ facilityType: 1, name: 1 });

    res.json({
      success: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Find nearest healthcare facilities by GPS coordinates / radius
// @route   GET /api/facilities/nearest
// @access  Public
exports.findNearest = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm = 50, type } = req.query;

    const userLat = parseFloat(lat) || 25.3176; // Default to Varanasi regional center
    const userLng = parseFloat(lng) || 82.9739;

    let query = {};
    if (type) {
      query.facilityType = type;
    }

    const facilities = await Facility.find(query);

    // Compute distance for each facility
    const facilitiesWithDistance = facilities.map((fac) => {
      const distance = calculateHaversineDistance(
        userLat,
        userLng,
        fac.location.lat,
        fac.location.lng
      );
      
      // Estimated travel time: ~30km/h rural road speed
      const estimatedMinutes = Math.round((distance / 30) * 60) + 5;

      return {
        ...fac.toObject(),
        distanceKm: distance,
        estimatedTravelTimeMinutes: Math.max(5, estimatedMinutes),
      };
    });

    // Filter by radius and sort by distance
    const filtered = facilitiesWithDistance
      .filter((fac) => fac.distanceKm <= Number(radiusKm))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      userCoordinates: { lat: userLat, lng: userLng },
      radiusKm: Number(radiusKm),
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get facility details with medicine inventory and doctor list
// @route   GET /api/facilities/:id
// @access  Public
exports.getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    const availableMedicines = await Inventory.find({
      facilityId: facility._id,
      quantity: { $gt: 0 },
    }).limit(20);

    res.json({
      success: true,
      data: facility,
      availableMedicines,
    });
  } catch (error) {
    next(error);
  }
};
