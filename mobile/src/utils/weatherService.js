import axios from 'axios';
import * as Location from 'expo-location';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

/**
 * Get weather data for black pepper farming
 * Includes temperature, humidity, rainfall, and agricultural data
 */
export const getWeatherData = async (latitude = null, longitude = null) => {
  try {
    // If coordinates provided, use them directly
    if (latitude && longitude) {
        return getWeatherByCoordinates(latitude, longitude);
    }

    // Get user's location if no coordinates provided
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      // Use default location (India - major pepper growing region)
      return getWeatherByCoordinates(12.9716, 77.5946);
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude: userLat, longitude: userLon } = location.coords;

    return getWeatherByCoordinates(userLat, userLon);
  } catch (error) {
    console.error('Error getting location:', error);
    // Fallback to default location
    return getWeatherByCoordinates(12.9716, 77.5946);
  }
};

/**
 * Fetch weather data from Open-Meteo API by coordinates
 */
const getWeatherByCoordinates = async (latitude, longitude) => {
  try {
    const response = await axios.get(OPEN_METEO_API, {
      params: {
        latitude: latitude,
        longitude: longitude,
        current:
          'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
        hourly: 'temperature_2m,precipitation_probability,weather_code,soil_moisture_0_to_10cm',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
        forecast_days: 7,
        timezone: 'auto',
      },
    });

    const current = response.data.current;
    const daily = response.data.daily;
    const hourly = response.data.hourly;

    // Process hourly data (next 24 hours)
    const hourlyData = hourly.time.slice(0, 24).map((time, index) => ({
      time: new Date(time).getHours() + ':00',
      temp: Math.round(hourly.temperature_2m[index]),
      rainProbability: hourly.precipitation_probability[index],
      weatherCode: hourly.weather_code[index],
    }));

    // Process daily data (next 7 days)
    const dailyData = daily.time.map((time, index) => ({
      date: new Date(time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: Math.round(daily.temperature_2m_max[index]),
      minTemp: Math.round(daily.temperature_2m_min[index]),
      rainProbability: daily.precipitation_probability_max[index],
      rainAmount: daily.precipitation_sum[index],
      weatherCode: daily.weather_code[index],
    }));

    return {
      temp: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      condition: getWeatherCondition(current.weather_code),
      windSpeed: current.wind_speed_10m,
      precipitation: current.precipitation || 0,
      soilMoisture: hourly.soil_moisture_0_to_10cm?.[0] || 0,
      maxTemp: Math.round(daily.temperature_2m_max[0]),
      minTemp: Math.round(daily.temperature_2m_min[0]),
      precipitation: current.precipitation || 0,
      maxTemp: Math.round(daily.temperature_2m_max[0]),
      minTemp: Math.round(daily.temperature_2m_min[0]),
      rainProbability: daily.precipitation_probability_max[0],
      rainForecast: daily.precipitation_sum[0] || 0,
      weatherCode: current.weather_code,
      hourly: hourlyData,
      daily: dailyData,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return default weather on error
    return {
      temp: 28,
      humidity: 75,
      condition: 'Partly Cloudy',
      windSpeed: 10,
      precipitation: 0,
      soilMoisture: 50,
      maxTemp: 32,
      minTemp: 24,
      rainProbability: 40,
      rainForecast: 0,
      weatherCode: 2,
      hourly: [],
      daily: [],
    };
  }
};

/**
 * Convert WMO weather codes to human-readable conditions
 * Optimized for black pepper farming
 */
const getWeatherCondition = (code) => {
  // WMO Weather interpretation codes
  const weatherCodes = {
    0: 'Clear Sky',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Slight Hail',
    99: 'Thunderstorm with Heavy Hail',
  };

  return weatherCodes[code] || 'Unknown';
};

/**
 * Get farming recommendations based on weather
 * Specifically for black pepper cultivation
 */
export const getFarmingRecommendations = (weather) => {
  const recommendations = [];

  // Temperature recommendations
  if (weather.temp < 20) {
    recommendations.push({
      type: 'warning',
      title: 'Low Temperature',
      message: 'Temperature is below optimal for black pepper (20-30°C). Reduce irrigation.',
    });
  }

  if (weather.temp > 35) {
    recommendations.push({
      type: 'warning',
      title: 'High Temperature',
      message: 'Temperature exceeds optimal range. Ensure adequate irrigation and shade.',
    });
  }

  // Humidity recommendations
  if (weather.humidity > 85) {
    recommendations.push({
      type: 'info',
      title: 'High Humidity',
      message: 'High humidity detected. Monitor for fungal diseases.',
    });
  }

  if (weather.humidity < 50) {
    recommendations.push({
      type: 'warning',
      title: 'Low Humidity',
      message: 'Low humidity detected. Increase irrigation frequency.',
    });
  }

  // Rain recommendations
  if (weather.rainProbability > 70) {
    recommendations.push({
      type: 'info',
      title: 'Rain Expected',
      message: 'High rain probability. Delay fertilizer application.',
    });
  }

  // Soil moisture
  if (weather.soilMoisture < 20) {
    recommendations.push({
      type: 'warning',
      title: 'Dry Soil',
      message: 'Soil moisture is low. Increase irrigation.',
    });
  }

  return recommendations;
};
