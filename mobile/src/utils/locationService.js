import axios from 'axios';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Generate a grid of coordinates around a center point
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude
 * @param radiusKm - Radius in kilometers
 * @param gridSize - Number of points per side (e.g., 3 = 3x3 grid)
 */
export const generateCoordinateGrid = (centerLat, centerLng, radiusKm = 5, gridSize = 3) => {
  const locations = [];
  // Convert km to degrees (roughly 1 degree = 111 km)
  const degreeOffset = radiusKm / 111;
  const step = (degreeOffset * 2) / (gridSize - 1);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = centerLat - degreeOffset + i * step;
      const lng = centerLng - degreeOffset + j * step;
      locations.push({
        latitude: lat,
        longitude: lng,
      });
    }
  }

  return locations;
};

/**
 * Get location name from coordinates using Nominatim with retry logic
 */
export const getLocationName = async (latitude, longitude, retries = 2) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(NOMINATIM_API, {
        params: {
          format: 'json',
          lat: latitude,
          lon: longitude,
          zoom: 10,
        },
        headers: {
          'User-Agent': 'PiperSmart-App/1.0',
        },
        timeout: 8000, // 8 second timeout
      });

      if (response.data && response.data.address) {
        const address = response.data.address;
        return address.village || address.town || address.city || address.county || 'Unknown Location';
      }
      return 'Unknown Location';
    } catch (error) {
      if (attempt === retries - 1) {
        // Last attempt failed, return fallback
        console.warn(`Failed to fetch location after ${retries} attempts:`, error.message);
        return `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

/**
 * Get location names for multiple coordinates with sequential requests to avoid rate limiting
 */
export const getLocationNames = async (locations) => {
  try {
    const names = [];
    
    // Process sequentially with small delays to avoid Nominatim rate limiting
    for (const loc of locations) {
      const name = await getLocationName(loc.latitude, loc.longitude);
      names.push(name);
      // Add small delay between requests (Nominatim recommends 1 request per second)
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    return locations.map((loc, index) => ({
      ...loc,
      name: names[index],
    }));
  } catch (error) {
    console.error('Error fetching location names batch:', error);
    // Return locations with coordinate-based fallback names
    return locations.map((loc) => ({
      ...loc,
      name: `Location (${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)})`,
    }));
  }
};
