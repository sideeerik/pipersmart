const express = require('express');
const router = express.Router();

// Import controller functions
const { 
    saveAnalysis, 
    getAnalyses, 
    deleteAnalysis
} = require('../controllers/Macromapping');

// Import auth middleware
const { isAuthenticatedUser } = require('../middlewares/auth');

/**
 * POST /api/v1/macromap/save
 * Save a macromapping analysis to database
 * Requires authentication
 */
router.post('/save', isAuthenticatedUser, saveAnalysis);

/**
 * GET /api/v1/macromap/analyses
 * Get all macromapping analyses for the authenticated user
 * Requires authentication
 */
router.get('/analyses', isAuthenticatedUser, getAnalyses);

/**
 * DELETE /api/v1/macromap/analyses/:id
apping analysis by ID * Delete a macrom
 * Requires authentication
 */
router.delete('/analyses/:id', isAuthenticatedUser, deleteAnalysis);

/**
 * POST /api/v1/macromap/weather
 * Get current weather data from WeatherAPI (via backend proxy to avoid CORS)
 */
router.post('/weather', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const weatherApiKey = 'f2e310925a9e4777883160350260102';
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}&aqi=no`;

    console.log(`🌤️  Fetching weather data for (${latitude}, ${longitude})`);

    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();

    if (!weatherData.current) {
      return res.status(200).json({
        success: true,
        weather: {
          temp: 26,
          humidity: 72,
          rainProbability: 65,
          windSpeed: 12,
          condition: 'Partly Cloudy'
        },
        source: 'default',
        message: 'Using default weather values'
      });
    }

    const weather = {
      temp: Math.round(weatherData.current.temp_c),
      humidity: weatherData.current.humidity,
      rainProbability: weatherData.current.chance_of_rain || 65,
      windSpeed: Math.round(weatherData.current.wind_kph),
      condition: weatherData.current.condition.text
    };

    console.log(`✅ Weather data retrieved: ${weather.temp}°C, ${weather.humidity}% humidity`);

    res.status(200).json({
      success: true,
      weather,
      source: 'WeatherAPI',
      location: weatherData.location
    });
  } catch (error) {
    console.error('❌ Weather API error:', error.message);
    res.status(200).json({
      success: true,
      weather: {
        temp: 26,
        humidity: 72,
        rainProbability: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy'
      },
      source: 'default',
      error: error.message,
      message: 'Using default weather values due to API error'
    });
  }
});

/**
 * POST /api/v1/macromap/rainfall
 * Get annual rainfall from NASA POWER API
 */
router.post('/rainfall', async (req, res) => {
  try {
    const { longitude, latitude, start = 2020, end = 2022 } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        error: 'Longitude and latitude are required'
      });
    }

    const nasaUrl = `https://power.larc.nasa.gov/api/v1/climate?parameters=PRECTOT&community=ag&longitude=${longitude}&latitude=${latitude}&start=${start}&end=${end}&format=json`;

    console.log(`🌧️  Fetching rainfall data for (${latitude}, ${longitude})`);

    const nasaResponse = await fetch(nasaUrl);
    const nasaData = await nasaResponse.json();

    if (!nasaData.properties || !nasaData.properties.PRECTOT) {
      return res.status(200).json({
        success: true,
        annualRainfall: 2000,
        source: 'default',
        message: 'Using default rainfall value'
      });
    }

    const yearlyData = nasaData.properties.PRECTOT;
    const avgRainfall = Object.values(yearlyData).reduce((a, b) => a + b, 0) / Object.keys(yearlyData).length;
    const annualRainfall = Math.round(avgRainfall * 365 / 100);

    console.log(`✅ Rainfall data retrieved: ${annualRainfall} mm/year`);

    res.status(200).json({
      success: true,
      annualRainfall,
      source: 'NASA POWER API',
      rawData: nasaData.properties.PRECTOT
    });
  } catch (error) {
    console.error('❌ NASA POWER API error:', error.message);
    res.status(200).json({
      success: true,
      annualRainfall: 2000,
      source: 'default',
      error: error.message,
      message: 'Using default rainfall value due to API error'
    });
  }
});

/**
 * POST /api/v1/macromap/soil-ph
 * Get soil pH from SoilGrids API
 */
router.post('/soil-ph', async (req, res) => {
  try {
    const { longitude, latitude, depth = '0-5cm' } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        error: 'Longitude and latitude are required'
      });
    }

    const soilUrl = `https://rest.soilgrids.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&depth=${depth}&property=phH2o`;

    console.log(`🌱 Fetching soil pH data for (${latitude}, ${longitude})`);

    const soilResponse = await fetch(soilUrl);
    const soilData = await soilResponse.json();

    if (!soilData.properties || !soilData.properties.phH2o || !soilData.properties.phH2o.values || !soilData.properties.phH2o.values.mean) {
      return res.status(200).json({
        success: true,
        soilPH: 6.0,
        source: 'default',
        message: 'Using default soil pH value'
      });
    }

    const soilPH = (soilData.properties.phH2o.values.mean[0] / 10).toFixed(2);

    console.log(`✅ Soil pH data retrieved: ${soilPH}`);

    res.status(200).json({
      success: true,
      soilPH: parseFloat(soilPH),
      source: 'SoilGrids API',
      rawData: soilData.properties.phH2o
    });
  } catch (error) {
    console.error('❌ SoilGrids API error:', error.message);
    res.status(200).json({
      success: true,
      soilPH: 6.0,
      source: 'default',
      error: error.message,
      message: 'Using default soil pH value due to API error'
    });
  }
});

/**
 * POST /api/v1/macromap/route
 * Get routing data from OSRM (Open Source Routing Machine)
 */
router.post('/route', async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.body;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        error: 'Start and end coordinates are required'
      });
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    console.log(`🗺️  Fetching route from (${startLat}, ${startLng}) to (${endLat}, ${endLng})`);

    const osrmResponse = await fetch(osrmUrl);
    const osrmData = await osrmResponse.json();

    if (osrmData.code !== 'Ok' || !osrmData.routes || osrmData.routes.length === 0) {
      return res.status(200).json({
        success: false,
        error: 'No route found between these locations',
        code: osrmData.code
      });
    }

    const route = osrmData.routes[0];

    console.log(`✅ Route retrieved: ${(route.distance / 1000).toFixed(2)} km, ${Math.round(route.duration / 60)} minutes`);

    res.status(200).json({
      success: true,
      route: {
        geometry: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
        distanceKm: (route.distance / 1000).toFixed(2),
        durationMinutes: Math.round(route.duration / 60),
        legs: route.legs
      },
      source: 'OSRM API'
    });
  } catch (error) {
    console.error('❌ OSRM routing error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate route',
      message: error.message
    });
  }
});

module.exports = router;

