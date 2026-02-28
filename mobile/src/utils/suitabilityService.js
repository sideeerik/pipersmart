/**
 * Suitability scoring for BLACK PEPPER (Piper nigrum) cultivation in the Philippines
 * 
 * Black pepper is well-suited to the country's tropical climate with:
 * - Temperature: 23-32°C (optimal: 27-28°C)
 * - Humidity: 60-80% (optimal: 70%) - HIGH HUMIDITY required
 * - Rainfall: 1000-2500mm annually (100-250 cm) - CONSISTENT rainfall essential
 * - Elevation: 0-1000m (lower is better) - sea level to lowlands ideal
 * 
 * Best local varieties: Panniyur-1, Panniyur-5, Panniyur-8
 * Also suited: Common Philippine types for backyards and plantations
 */

/**
 * Calculate temperature suitability score
 * Optimal: 27-28°C, Range: 23-32°C
 */
const calculateTempScore = (temp) => {
  const optimalTemp = 27.5;
  const minTemp = 23;
  const maxTemp = 32;

  if (temp < minTemp || temp > maxTemp) {
    return 0; // Outside viable range
  }

  // Score peaks at optimal temperature
  const distance = Math.abs(temp - optimalTemp);
  const maxDistance = Math.max(optimalTemp - minTemp, maxTemp - optimalTemp);
  return Math.max(0, 100 * (1 - distance / maxDistance));
};

/**
 * Calculate humidity suitability score
 * Optimal: 70%, Range: 60-80%
 */
const calculateHumidityScore = (humidity) => {
  const optimalHumidity = 70;
  const minHumidity = 60;
  const maxHumidity = 80;

  if (humidity < minHumidity || humidity > maxHumidity) {
    return 0; // Outside viable range
  }

  const distance = Math.abs(humidity - optimalHumidity);
  const maxDistance = Math.max(optimalHumidity - minHumidity, maxHumidity - optimalHumidity);
  return Math.max(0, 100 * (1 - distance / maxDistance));
};

/**
 * Calculate elevation suitability score
 * Optimal: sea level to 1000m
 */
const calculateElevationScore = (elevation) => {
  const maxElevation = 1000;

  if (elevation > maxElevation) {
    return 0; // Too high
  }

  // Score decreases with elevation
  return Math.max(0, 100 * (1 - elevation / maxElevation));
};

/**
 * Calculate rainfall suitability score
 * Optimal: 1500-2500mm annually
 * Estimated from rain probability (simplified)
 */
const calculateRainfallScore = (rainProbability) => {
  // Rain probability 60-80% is good (estimated as good rainfall)
  const optimalRain = 70;
  const minRain = 40;
  const maxRain = 90;

  if (rainProbability < minRain || rainProbability > maxRain) {
    return 50; // Reduced but still viable
  }

  const distance = Math.abs(rainProbability - optimalRain);
  const maxDistance = Math.max(optimalRain - minRain, maxRain - optimalRain);
  return Math.max(0, 100 * (1 - distance / maxDistance));
};

/**
 * Calculate overall suitability score
 * Weighted average of all factors
 */
export const calculateSuitabilityScore = (weather, elevation, rainProbability) => {
  const tempScore = calculateTempScore(weather.temp);
  const humidityScore = calculateHumidityScore(weather.humidity);
  const elevationScore = calculateElevationScore(elevation);
  const rainfallScore = calculateRainfallScore(rainProbability);

  // Weights for each factor
  const weights = {
    temperature: 0.35, // 35%
    humidity: 0.30, // 30%
    elevation: 0.20, // 20%
    rainfall: 0.15, // 15%
  };

  const totalScore =
    tempScore * weights.temperature +
    humidityScore * weights.humidity +
    elevationScore * weights.elevation +
    rainfallScore * weights.rainfall;

  return Math.round(totalScore);
};

/**
 * Get suitability rating and color
 */
export const getSuitabilityRating = (score) => {
  if (score >= 80) {
    return {
      rating: 'Excellent',
      color: '#27AE60', // Green
      icon: '✓✓',
      description: 'Highly suitable for black pepper cultivation',
    };
  } else if (score >= 60) {
    return {
      rating: 'Good',
      color: '#F39C12', // Orange/Yellow
      icon: '✓',
      description: 'Suitable with some considerations',
    };
  } else if (score >= 40) {
    return {
      rating: 'Fair',
      color: '#E67E22', // Dark Orange
      icon: '△',
      description: 'Marginal - additional inputs may be needed',
    };
  } else {
    return {
      rating: 'Poor',
      color: '#E74C3C', // Red
      icon: '✗',
      description: 'Not recommended for black pepper',
    };
  }
};

/**
 * Get detailed recommendations based on score breakdown
 * Tailored for BLACK PEPPER cultivation in the Philippines
 */
export const getDetailedRecommendations = (weather, elevation, rainProbability) => {
  const recommendations = [];

  // Temperature recommendations - Critical for black pepper
  if (weather.temp < 23) {
    recommendations.push({
      type: 'danger',
      title: 'Temperature Too Low',
      message: 'Below 23°C minimum - black pepper growth will be severely affected. Consider protected cultivation.',
    });
  } else if (weather.temp < 25) {
    recommendations.push({
      type: 'warning',
      title: 'Suboptimal Temperature',
      message: 'Below optimal range (27-28°C). Growth will be slower than ideal.',
    });
  } else if (weather.temp > 32) {
    recommendations.push({
      type: 'warning',
      title: 'High Temperature',
      message: 'Above 32°C optimal range. Ensure adequate shade, mulching, and irrigation to prevent stress.',
    });
  } else {
    recommendations.push({
      type: 'success',
      title: 'Optimal Temperature',
      message: `Current: ${weather.temp}°C - Excellent conditions for black pepper growth.`,
    });
  }

  // Humidity recommendations - CRITICAL for black pepper
  if (weather.humidity < 60) {
    recommendations.push({
      type: 'danger',
      title: 'Humidity Too Low',
      message: 'Below 60% minimum - black pepper requires HIGH humidity (60-80%). Install irrigation/misting systems.',
    });
  } else if (weather.humidity < 70) {
    recommendations.push({
      type: 'warning',
      title: 'Low Humidity',
      message: 'Below optimal 70%. Black pepper thrives in HIGH humidity - increase irrigation and mulching.',
    });
  } else if (weather.humidity <= 80) {
    recommendations.push({
      type: 'success',
      title: 'Optimal Humidity',
      message: `Current: ${weather.humidity}% - Perfect conditions for black pepper. Monitor for fungal diseases in high humidity.`,
    });
  } else {
    recommendations.push({
      type: 'info',
      title: 'Very High Humidity',
      message: `Current: ${weather.humidity}% - Good for growth but ensure proper ventilation to prevent fungal issues.`,
    });
  }

  // Elevation recommendations
  if (elevation > 1000) {
    recommendations.push({
      type: 'warning',
      title: 'Elevation Too High',
      message: 'Above 1000m - black pepper prefers sea level to lowlands (0-1000m). Growth will be limited.',
    });
  } else if (elevation < 100) {
    recommendations.push({
      type: 'success',
      title: 'Optimal Elevation',
      message: 'Elevation ideal for black pepper cultivation (sea level to lowlands).',
    });
  } else {
    recommendations.push({
      type: 'success',
      title: 'Good Elevation',
      message: `Elevation ${Math.round(elevation)}m is within optimal range (0-1000m) for black pepper.`,
    });
  }

  // Rainfall recommendations - CRITICAL for black pepper
  if (rainProbability < 40) {
    recommendations.push({
      type: 'danger',
      title: 'Insufficient Rainfall',
      message: 'Black pepper requires HIGH consistent rainfall (100-250cm annually). Invest in comprehensive irrigation.',
    });
  } else if (rainProbability < 60) {
    recommendations.push({
      type: 'warning',
      title: 'Low Rainfall Probability',
      message: 'Below optimal rainfall for black pepper. Supplemental irrigation essential.',
    });
  } else if (rainProbability <= 80) {
    recommendations.push({
      type: 'success',
      title: 'Good Rainfall Pattern',
      message: 'Adequate consistent rainfall expected - excellent for black pepper moisture requirements.',
    });
  } else {
    recommendations.push({
      type: 'info',
      title: 'High Rainfall',
      message: 'Very high rainfall expected. Ensure good drainage to prevent root rot.',
    });
  }

  // Recommended varieties
  recommendations.push({
    type: 'success',
    title: 'Recommended Varieties',
    message: 'Panniyur-1, Panniyur-5, Panniyur-8 (high-yielding), or common Philippine backyardtypes.',
  });

  return recommendations;
};
