/**
 * Suitability scoring for black pepper (Piper nigrum) in the Philippines.
 *
 * Reference ranges used:
 * - Temperature: viable 20-35 C, strongest at 25-35 C
 * - Humidity: ideal 60-80% RH
 * - Rainfall proxy: high and consistent rainfall preferred
 * - Elevation: viable up to 1500 m, best below 350 m
 */

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const calculateTempScore = (temp) => {
  if (temp >= 25 && temp <= 35) return 100;
  if (temp >= 22 && temp < 25) return 84;
  if (temp > 35 && temp <= 37) return 72;
  if (temp >= 20 && temp < 22) return 62;
  if (temp > 37 && temp <= 39) return 48;
  return 20;
};

const calculateHumidityScore = (humidity) => {
  if (humidity >= 60 && humidity <= 80) return 100;
  if (humidity >= 55 && humidity < 60) return 82;
  if (humidity > 80 && humidity <= 88) return 86;
  if (humidity >= 45 && humidity < 55) return 62;
  if (humidity > 88 && humidity <= 95) return 58;
  return 28;
};

const calculateElevationScore = (elevation) => {
  if (elevation <= 350) return 100;
  if (elevation <= 700) return 90;
  if (elevation <= 1000) return 78;
  if (elevation <= 1500) return 62;
  if (elevation <= 1800) return 40;
  return 20;
};

const calculateRainfallScore = (rainProbability) => {
  if (rainProbability >= 60 && rainProbability <= 90) return 100;
  if (rainProbability >= 45 && rainProbability < 60) return 84;
  if (rainProbability > 90) return 80;
  if (rainProbability >= 30 && rainProbability < 45) return 64;
  return 38;
};

const getContextBonus = (locationContext = {}) => {
  const searchableText = `${locationContext.name || ''} ${locationContext.specialty || ''}`.toLowerCase();
  let bonus = 0;
  const reasons = [];

  if (locationContext.kind === 'farm') {
    bonus += 6;
    reasons.push('existing farm site');
  }

  if (searchableText.includes('pepper') || searchableText.includes('pamintahan') || searchableText.includes('piper')) {
    bonus += 8;
    reasons.push('pepper-linked location');
  }

  return {
    value: Math.min(14, bonus),
    reasons,
  };
};

export const calculateSuitabilityScore = (
  weather,
  elevation,
  rainProbability,
  locationContext = {}
) => {
  const breakdown = {
    temperature: calculateTempScore(weather.temp),
    humidity: calculateHumidityScore(weather.humidity),
    elevation: calculateElevationScore(elevation),
    rainfall: calculateRainfallScore(rainProbability),
  };

  const weights = {
    temperature: 0.3,
    humidity: 0.25,
    elevation: 0.2,
    rainfall: 0.25,
  };

  const baseScore =
    breakdown.temperature * weights.temperature +
    breakdown.humidity * weights.humidity +
    breakdown.elevation * weights.elevation +
    breakdown.rainfall * weights.rainfall;

  const contextBonus = getContextBonus(locationContext);
  const score = clampScore(baseScore + contextBonus.value);

  return {
    score,
    baseScore: clampScore(baseScore),
    bonusScore: contextBonus.value,
    bonusReasons: contextBonus.reasons,
    breakdown,
  };
};

export const getSuitabilityRating = (score) => {
  if (score >= 85) {
    return {
      rating: 'Excellent',
      color: '#27AE60',
      icon: '++',
      description: 'Highly suitable for black pepper cultivation',
    };
  }

  if (score >= 70) {
    return {
      rating: 'Good',
      color: '#1F8A70',
      icon: '+',
      description: 'Suitable with manageable field considerations',
    };
  }

  if (score >= 55) {
    return {
      rating: 'Fair',
      color: '#F39C12',
      icon: '~',
      description: 'Moderately suitable if shade and moisture are managed well',
    };
  }

  return {
    rating: 'Poor',
    color: '#E67E22',
    icon: '!',
    description: 'Challenging for black pepper without stronger interventions',
  };
};

export const getDetailedRecommendations = (weather, elevation, rainProbability) => {
  const recommendations = [];

  if (weather.temp < 20) {
    recommendations.push({
      type: 'danger',
      title: 'Temperature Too Low',
      message: 'Below 20 C can damage black pepper growth. Protected establishment is recommended.',
    });
  } else if (weather.temp < 25) {
    recommendations.push({
      type: 'warning',
      title: 'Cooler Than Ideal',
      message: 'Viable, but not in the strongest growth band. Expect slower vine growth than in warmer tropical sites.',
    });
  } else if (weather.temp <= 35) {
    recommendations.push({
      type: 'success',
      title: 'Strong Temperature Band',
      message: `Current temperature of ${weather.temp} C is in the preferred warm range for black pepper.`,
    });
  } else {
    recommendations.push({
      type: 'warning',
      title: 'Heat Stress Risk',
      message: 'Temperatures above 35 C can stress vines. Use shade, mulch, and reliable irrigation.',
    });
  }

  if (weather.humidity < 60) {
    recommendations.push({
      type: 'warning',
      title: 'Humidity Below Target',
      message: 'Black pepper prefers 60-80% RH. Support moisture retention with mulch and irrigation.',
    });
  } else if (weather.humidity <= 80) {
    recommendations.push({
      type: 'success',
      title: 'Healthy Humidity Window',
      message: `Current humidity of ${weather.humidity}% supports vigorous vine growth.`,
    });
  } else {
    recommendations.push({
      type: 'info',
      title: 'Humid Conditions',
      message: 'Humidity is favorable for growth, but monitor for fungal pressure and keep airflow open.',
    });
  }

  if (elevation <= 350) {
    recommendations.push({
      type: 'success',
      title: 'Prime Elevation Zone',
      message: 'This site sits in the strongest low-elevation yield band for black pepper.',
    });
  } else if (elevation <= 1500) {
    recommendations.push({
      type: 'info',
      title: 'Acceptable Elevation',
      message: `Elevation of ${Math.round(elevation)} m is still viable, though top-end yields are usually better lower down.`,
    });
  } else {
    recommendations.push({
      type: 'warning',
      title: 'High Elevation Site',
      message: 'Above 1500 m is beyond the preferred elevation band and may reduce performance.',
    });
  }

  if (rainProbability < 45) {
    recommendations.push({
      type: 'warning',
      title: 'Rainfall Support Needed',
      message: 'Black pepper needs consistent moisture. Plan irrigation during extended dry periods.',
    });
  } else if (rainProbability <= 90) {
    recommendations.push({
      type: 'success',
      title: 'Moisture Pattern Looks Favorable',
      message: 'The rainfall outlook supports the high-moisture environment black pepper prefers.',
    });
  } else {
    recommendations.push({
      type: 'info',
      title: 'Very Wet Outlook',
      message: 'Rainfall is favorable, but drainage must stay strong to avoid waterlogging and root rot.',
    });
  }

  recommendations.push({
    type: 'info',
    title: 'Shade and Wind Protection',
    message: 'Black pepper performs best with partial shade and shelter from strong winds. Support standards and windbreaks help.',
  });

  return recommendations;
};
