const SavedLocation = require('../models/SavedLocation');
const User = require('../models/User');

// ==================== LOCATION TIPS DATABASE ====================
// This can be moved to a separate database table later
const LOCATION_TIPS = {
  1: {
    farmName: "Buro Buro Springs Vermi Farm",
    roadConditions: "Well-maintained asphalt road, generally good condition. Slight uphill at final approach.",
    bestTimeToVisit: "Early morning 6-8 AM (cooler weather, easier parking)",
    parkingInfo: "Free parking available for 15+ vehicles, shaded area near entrance",
    contactInfo: "Open 8 AM - 5 PM daily, closed Sundays",
    specialNotes: "Ask for Mr. Ricardo at the gate. Bring ID for registration. Best to call ahead: +63-917-XXX-XXXX",
    soilType: "Rich vermic soil, high organic content",
    accessibility: "Easy - wheelchair accessible ramps available"
  },
  2: {
    farmName: "Spring Bloom Agri Farm Site 2",
    roadConditions: "Mix of asphalt and rough provincial roads. Drive slowly past barangay roads.",
    bestTimeToVisit: "Mid-morning 9-11 AM (wet roads dry up)",
    parkingInfo: "Limited parking (5 vehicles), prefer to park at main office 200m away",
    contactInfo: "Open 8 AM - 4 PM, Monday to Friday only",
    specialNotes: "Eco-tourism site - advance booking required. No walk-ins. Bring water, it's hot.",
    soilType: "Loamy volcanic soil, excellent drainage",
    accessibility: "Moderate - some unpaved sections, good for motorcycles/compact cars"
  },
  3: {
    farmName: "Valucrops Inc.",
    roadConditions: "Excellent highway access, all asphalt. Easy navigation from main road.",
    bestTimeToVisit: "Anytime 8 AM - 5 PM (consistent daily hours)",
    parkingInfo: "Large parking lot (50+ vehicles), free, air-conditioned waiting area",
    contactInfo: "Open daily including weekends. Professional farm visit arrangement.",
    specialNotes: "Largest facility in region. Reception office available. Guided tours every 2 hours.",
    soilType: "Mixed clay-loam, balanced nutrients",
    accessibility: "Excellent - fully accessible, clean facilities, restaurant on-site"
  },
  4: {
    farmName: "Mindanao Baptist Rural Life Center",
    roadConditions: "Challenging mountain roads, steep sections. 4WD recommended. Heavy rain can cause landslides.",
    bestTimeToVisit: "Dry season (Nov-April). Avoid October-November heavy rains.",
    parkingInfo: "Small parking (5-8 vehicles), uphill walk of 300m to main facility",
    contactInfo: "Open by appointment only. Call 1 day in advance. Saturday-Sunday only.",
    specialNotes: "Remote location, bring own snacks/water. Excellent views of surrounding mountains. Malaria risk - use insect repellent.",
    soilType: "Red laterite soil, acidic pH",
    accessibility: "Difficult - steep terrain, 45-minute drive from nearest highway"
  },
  5: {
    farmName: "Tavera Farms",
    roadConditions: "High altitude road, well-maintained asphalt. Temperature drops 3-4°C above 1000m elevation.",
    bestTimeToVisit: "Early morning 6-7 AM (coolest weather), avoid afternoon rains",
    parkingInfo: "Medium parking (20 vehicles), on-site, usually available",
    contactInfo: "Open 8 AM - 4 PM daily. Closed December 25-January 1",
    specialNotes: "High altitude (1200m), bring light jacket. Watch for cool wind changes. Famous for strawberry growing.",
    soilType: "Volcanic forest soil, rich humus, acidic",
    accessibility: "Moderate - good roads but high altitude may affect those with respiratory issues"
  }
};

// ==================== SAVE LOCATION ====================
exports.saveLocation = async (req, res) => {
  try {
    console.log('💾 Save location request - User:', req.user.id);
    
    const { farmId, farmName, latitude, longitude, address, location, specialty, userNotes, tags } = req.body;

    // Validation
    if (!farmId || !farmName || !latitude || !longitude || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'farmId, farmName, latitude, longitude, and location are required' 
      });
    }

    // Check if already saved
    const existingSave = await SavedLocation.findOne({ 
      userId: req.user.id, 
      'farm.id': farmId 
    });

    if (existingSave) {
      return res.status(400).json({ 
        success: false, 
        message: 'This location is already saved' 
      });
    }

    // Create saved location
    const savedLocation = await SavedLocation.create({
      userId: req.user.id,
      farm: {
        id: farmId,
        name: farmName,
        latitude,
        longitude,
        address: address || '',
        location,
        specialty: specialty || ''
      },
      userNotes: userNotes || '',
      tags: tags || [],
      isFavorite: false
    });

    console.log('✅ Location saved:', savedLocation._id);

    res.status(201).json({
      success: true,
      message: `${farmName} saved to your favorites`,
      savedLocation
    });

  } catch (error) {
    console.error('❌ Save location error:', error);
    res.status(500).json({ success: false, message: 'Error saving location' });
  }
};

// ==================== GET ALL SAVED LOCATIONS ====================
exports.getSavedLocations = async (req, res) => {
  try {
    console.log('📋 Get saved locations - User:', req.user.id);
    
    const { sortBy = 'recent', favorite = false } = req.query;

    let sortOption = { savedAt: -1 }; // Default: most recent first
    if (sortBy === 'name') {
      sortOption = { 'farm.name': 1 };
    } else if (sortBy === 'favorite') {
      sortOption = { isFavorite: -1, savedAt: -1 };
    } else if (sortBy === 'visited') {
      sortOption = { lastVisited: -1 };
    }

    const query = { userId: req.user.id };
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    const savedLocations = await SavedLocation.find(query).sort(sortOption);

    console.log(`✅ Found ${savedLocations.length} saved locations`);

    res.status(200).json({
      success: true,
      count: savedLocations.length,
      savedLocations
    });

  } catch (error) {
    console.error('❌ Get saved locations error:', error);
    res.status(500).json({ success: false, message: 'Error fetching saved locations' });
  }
};

// ==================== GET SINGLE LOCATION DETAILS ====================
exports.getLocationDetails = async (req, res) => {
  try {
    console.log('📍 Get location details - ID:', req.params.locationId);
    
    const savedLocation = await SavedLocation.findOne({
      _id: req.params.locationId,
      userId: req.user.id
    });

    if (!savedLocation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saved location not found' 
      });
    }

    // Get tips for this location
    const tips = LOCATION_TIPS[savedLocation.farm.id] || null;

    console.log('✅ Location details retrieved');

    res.status(200).json({
      success: true,
      savedLocation,
      tips
    });

  } catch (error) {
    console.error('❌ Get location details error:', error);
    res.status(500).json({ success: false, message: 'Error fetching location details' });
  }
};

// ==================== UNSAVE LOCATION ====================
exports.unsaveLocation = async (req, res) => {
  try {
    console.log('🗑️ Unsave location - ID:', req.params.locationId);
    
    const savedLocation = await SavedLocation.findOneAndDelete({
      _id: req.params.locationId,
      userId: req.user.id
    });

    if (!savedLocation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saved location not found' 
      });
    }

    console.log('✅ Location unsaved:', savedLocation.farm.name);

    res.status(200).json({
      success: true,
      message: `${savedLocation.farm.name} removed from favorites`
    });

  } catch (error) {
    console.error('❌ Unsave location error:', error);
    res.status(500).json({ success: false, message: 'Error removing saved location' });
  }
};

// ==================== UPDATE LOCATION ====================
exports.updateLocation = async (req, res) => {
  try {
    console.log('✏️ Update location - ID:', req.params.locationId);
    
    const { userNotes, tags, isFavorite, rating, accessibilityRating } = req.body;

    let savedLocation = await SavedLocation.findOne({
      _id: req.params.locationId,
      userId: req.user.id
    });

    if (!savedLocation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saved location not found' 
      });
    }

    // Update fields
    if (userNotes !== undefined) savedLocation.userNotes = userNotes;
    if (tags !== undefined) savedLocation.tags = tags;
    if (isFavorite !== undefined) savedLocation.isFavorite = isFavorite;
    if (rating !== undefined) savedLocation.rating = rating;
    if (accessibilityRating !== undefined) savedLocation.accessibilityRating = accessibilityRating;

    savedLocation.updatedAt = Date.now();
    await savedLocation.save();

    console.log('✅ Location updated');

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      savedLocation
    });

  } catch (error) {
    console.error('❌ Update location error:', error);
    res.status(500).json({ success: false, message: 'Error updating location' });
  }
};

// ==================== RECORD VISIT ====================
exports.recordVisit = async (req, res) => {
  try {
    console.log('🚗 Record visit - ID:', req.params.locationId);
    
    const savedLocation = await SavedLocation.findOne({
      _id: req.params.locationId,
      userId: req.user.id
    });

    if (!savedLocation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saved location not found' 
      });
    }

    savedLocation.visitCount += 1;
    savedLocation.lastVisited = Date.now();
    await savedLocation.save();

    console.log('✅ Visit recorded for:', savedLocation.farm.name);

    res.status(200).json({
      success: true,
      message: 'Visit recorded',
      savedLocation
    });

  } catch (error) {
    console.error('❌ Record visit error:', error);
    res.status(500).json({ success: false, message: 'Error recording visit' });
  }
};

// ==================== GET LOCATION TIPS (Without saving) ====================
exports.getLocationTips = async (req, res) => {
  try {
    console.log('💡 Get location tips - Farm ID:', req.query.farmId);
    
    const { farmId } = req.query;

    if (!farmId) {
      return res.status(400).json({ 
        success: false, 
        message: 'farmId is required' 
      });
    }

    const tips = LOCATION_TIPS[farmId];

    if (!tips) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tips not available for this location' 
      });
    }

    console.log('✅ Tips retrieved');

    res.status(200).json({
      success: true,
      tips
    });

  } catch (error) {
    console.error('❌ Get tips error:', error);
    res.status(500).json({ success: false, message: 'Error fetching tips' });
  }
};

// ==================== TOGGLE FAVORITE ====================
exports.toggleFavorite = async (req, res) => {
  try {
    console.log('❤️ Toggle favorite - ID:', req.params.locationId);
    
    const savedLocation = await SavedLocation.findOne({
      _id: req.params.locationId,
      userId: req.user.id
    });

    if (!savedLocation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saved location not found' 
      });
    }

    savedLocation.isFavorite = !savedLocation.isFavorite;
    await savedLocation.save();

    console.log('✅ Favorite toggled:', savedLocation.isFavorite);

    res.status(200).json({
      success: true,
      message: `Location ${savedLocation.isFavorite ? 'added to' : 'removed from'} favorites`,
      isFavorite: savedLocation.isFavorite,
      savedLocation
    });

  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    res.status(500).json({ success: false, message: 'Error toggling favorite' });
  }
};

// ==================== DELETE ALL SAVED LOCATIONS ====================
exports.deleteAllSavedLocations = async (req, res) => {
  try {
    console.log('🗑️🗑️ Delete all saved locations - User:', req.user.id);
    
    const result = await SavedLocation.deleteMany({ userId: req.user.id });

    console.log('✅ Deleted:', result.deletedCount, 'locations');

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} locations deleted`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Delete all error:', error);
    res.status(500).json({ success: false, message: 'Error deleting locations' });
  }
};
