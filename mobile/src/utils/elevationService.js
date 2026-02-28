import axios from 'axios';

const ELEVATION_API = 'https://api.open-elevation.com/api/v1/lookup';

/**
 * Get elevation data for multiple coordinates
 */
export const getElevation = async (locations) => {
  try {
    const response = await axios.post(ELEVATION_API, {
      locations: locations,
    });

    return response.data.results.map((result) => ({
      latitude: result.latitude,
      longitude: result.longitude,
      elevation: result.elevation,
    }));
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    // Return default elevation
    return locations.map((loc) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      elevation: 100, // Default elevation
    }));
  }
};

/**
 * Get elevation for single location
 */
export const getElevationForLocation = async (latitude, longitude) => {
  try {
    const result = await getElevation([{ latitude, longitude }]);
    return result[0]?.elevation || 100;
  } catch (error) {
    console.error('Error fetching elevation:', error);
    return 100;
  }
};
