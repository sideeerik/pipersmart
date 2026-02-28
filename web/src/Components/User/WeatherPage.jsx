import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import './Weather.css';

export default function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [suitability, setSuitability] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchWeather();
    
    // Auto-refresh weather every 10 seconds
    const refreshInterval = setInterval(() => {
      fetchWeather();
      setLastRefresh(new Date());
    }, 10 * 1000); // 10 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Update time display every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const latitude = 14.5994;
      const longitude = 120.9842;
      
      // WeatherAPI.com endpoint
      const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
        params: {
          key: apiKey,
          q: `${latitude},${longitude}`,
          days: 7,
          aqi: 'no',
          alerts: 'no',
        },
      });

      const current = response.data.current;
      const forecast = response.data.forecast.forecastday[0];
      const hourly = response.data.forecast.forecastday[0].hour;

      // Get the next 8 hours starting from the next full hour
      const currentHour = new Date().getHours();
      const nextHourIndex = hourly.findIndex(hour => {
        const hourDate = new Date(hour.time);
        return hourDate.getHours() > currentHour;
      });
      const startIndex = nextHourIndex >= 0 ? nextHourIndex : 1;

      // Format current weather
      const weatherData = {
        temp: Math.round(current.temp_c),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_kph),
        precipitation: current.precip_mm || 0,
        soilMoisture: 65,
        weatherDescription: current.condition.text,
        icon: current.condition.code,
        maxTemp: Math.round(forecast.day.maxtemp_c),
        minTemp: Math.round(forecast.day.mintemp_c),
        rainProbability: forecast.day.daily_chance_of_rain,
        rainForecast: forecast.day.totalprecip_mm,
        feelsLike: Math.round(current.feelslike_c),
        pressure: current.pressure_mb,
        cloudiness: current.cloud,
        visibility: current.vis_km * 1000,
      };

      // Format hourly forecast (next 8 hours)
      const hourly8 = hourly.slice(startIndex, startIndex + 8).map((hour) => {
        const date = new Date(hour.time);
        const hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 === 0 ? 12 : hours % 12;
        const timeStr = `${displayHours}:00 ${ampm}`;
        return {
          time: timeStr,
          temp: Math.round(hour.temp_c),
          rainProbability: hour.chance_of_rain,
          description: hour.condition.text,
          icon: hour.condition.code,
        };
      });

      // Format 7-day forecast
      const forecast7day = response.data.forecast.forecastday.slice(0, 7).map((day) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        maxTemp: Math.round(day.day.maxtemp_c),
        minTemp: Math.round(day.day.mintemp_c),
        precipitation: day.day.totalprecip_mm,
        rainProbability: day.day.daily_chance_of_rain,
        description: day.day.condition.text,
        icon: day.day.condition.code,
      }));

      setWeather(weatherData);
      setHourlyData(hourly8);
      setForecastData(forecast7day);
      const suitabilityData = calculateFarmingSuitability(weatherData);
      setSuitability(suitabilityData);
      generateRecommendations(weatherData);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError(error.message || 'Failed to load weather data');
      setWeather(null);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (data) => {
    const recs = [];

    // Temperature recommendations (matching mobile)
    if (data.temp < 20 || data.temp > 30) {
      recs.push({
        title: 'Temperature Alert',
        message: `Current temp ${data.temp}°C is outside optimal range (20-30°C).${data.temp < 20 ? ' Reduce irrigation.' : ' Ensure adequate irrigation and shade.'}`,
        icon: '🌡️',
        type: 'warning',
      });
    }

    // Humidity recommendations (matching mobile)
    if (data.humidity < 60 || data.humidity > 90) {
      recs.push({
        title: 'Humidity Adjustment',
        message: `Humidity at ${data.humidity}% is outside optimal (60-90%).${data.humidity > 85 ? ' Monitor for fungal diseases.' : ' Increase irrigation frequency.'}`,
        icon: '💧',
        type: 'warning',
      });
    }

    // Wind speed recommendations (matching mobile)
    if (data.windSpeed > 20) {
      recs.push({
        title: 'High Wind Alert',
        message: 'Wind speed is high. Check structural integrity and consider wind protection.',
        icon: '💨',
        type: 'danger',
      });
    }

    // Soil moisture recommendations (matching mobile)
    if (data.soilMoisture < 20) {
      recs.push({
        title: 'Dry Soil',
        message: 'Soil moisture is low. Increase irrigation immediately.',
        icon: '🌱',
        type: 'warning',
      });
    } else if (data.soilMoisture >= 20 && data.soilMoisture <= 60) {
      recs.push({
        title: 'Good Soil Moisture',
        message: `Soil moisture at ${data.soilMoisture}% is in optimal range.`,
        icon: '✓',
        type: 'success',
      });
    }

    // Rain recommendations (matching mobile)
    if (data.rainProbability > 70) {
      recs.push({
        title: 'Rain Expected',
        message: 'High rain probability. Delay fertilizer application.',
        icon: '🌧️',
        type: 'info',
      });
    }

    // Heavy precipitation alert
    if (data.rainForecast > 10) {
      recs.push({
        title: 'Heavy Rain',
        message: 'Heavy rainfall expected. Monitor for waterlogging and fungal diseases.',
        icon: '⛈️',
        type: 'warning',
      });
    }

    // Weather condition specific alerts
    if (data.weatherDescription?.includes('Cloud') || data.cloudiness > 70) {
      recs.push({
        title: 'Cloudy Conditions',
        message: 'Heavy cloud cover detected. Monitor for reduced photosynthesis.',
        icon: '☁️',
        type: 'info',
      });
    }

    // Optimal conditions alert (matching mobile)
    if (data.temp >= 20 && data.temp <= 30 && data.humidity >= 60 && data.humidity <= 90) {
      recs.push({
        title: 'Optimal Conditions',
        message: 'Current weather conditions are optimal for black pepper growth!',
        icon: '✅',
        type: 'success',
      });
    }

    setRecommendations(recs);
  };

  const calculateFarmingSuitability = (data) => {
    let score = 100;
    const activities = {
      planting: true,
      spraying: true,
      irrigation: true,
      harvesting: true,
    };
    const alerts = [];

    // Temperature check (optimal: 20-30°C)
    if (data.temp < 20) {
      score -= 15;
      activities.planting = false;
      alerts.push('Temperature too low for planting');
    } else if (data.temp > 30) {
      score -= 10;
      activities.harvesting = false;
      alerts.push('Temperature too high for harvest');
    } else {
      score += 5;
    }

    // Humidity check (optimal: 60-90%)
    if (data.humidity < 60) {
      score -= 10;
      activities.spraying = false;
      alerts.push('Low humidity - avoid spraying');
    } else if (data.humidity > 90) {
      score -= 15;
      alerts.push('High humidity - disease risk');
    } else {
      score += 10;
    }

    // Wind speed check (optimal: < 20 km/h)
    if (data.windSpeed > 20) {
      score -= 20;
      activities.spraying = false;
      activities.planting = false;
      alerts.push('High wind - avoid operations');
    } else {
      score += 5;
    }

    // Rainfall check
    if (data.rainProbability > 70) {
      score -= 10;
      activities.spraying = false;
      activities.harvesting = false;
      alerts.push('Heavy rain expected');
    }

    // Soil moisture check (optimal: 40-60%)
    if (data.soilMoisture < 30) {
      score -= 10;
      alerts.push('Soil too dry - increase irrigation');
    } else if (data.soilMoisture > 70) {
      score -= 8;
      alerts.push('Soil too wet - monitor drainage');
    } else {
      score += 5;
    }

    // Determine risk level
    let riskLevel = 'Low';
    let riskColor = 'success';
    if (score < 40) {
      riskLevel = 'High';
      riskColor = 'danger';
    } else if (score < 70) {
      riskLevel = 'Medium';
      riskColor = 'warning';
    }

    // Determine best activity
    let bestActivity = 'General Maintenance';
    if (activities.irrigation) bestActivity = 'Irrigation';
    if (activities.spraying && data.humidity >= 60 && data.humidity <= 90) bestActivity = 'Spraying & Pest Control';
    if (activities.planting && score > 80) bestActivity = 'Planting/Propagation';
    if (activities.harvesting && data.temp >= 20 && data.temp <= 28) bestActivity = 'Harvesting';

    return {
      score: Math.max(0, Math.min(100, score)),
      riskLevel,
      riskColor,
      bestActivity,
      alerts: alerts.slice(0, 2),
      activities,
    };
  };

  const getWeatherIconEmoji = (code) => {
    // WeatherAPI.com condition codes
    if (code === 1000) return '☀️'; // Sunny
    if (code === 1003) return '⛅'; // Partly cloudy
    if (code === 1006) return '☁️'; // Cloudy
    if (code === 1009) return '☁️'; // Overcast
    if (code === 1030) return '🌫️'; // Mist
    if (code === 1063 || code === 1180 || code === 1183 || code === 1186 || code === 1189) return '🌧️'; // Rain
    if (code === 1069 || code === 1192 || code === 1195 || code === 1198 || code === 1201) return '🌧️'; // Heavy rain
    if (code === 1072 || code === 1204 || code === 1207 || code === 1249 || code === 1252) return '❄️'; // Snow
    if (code === 1087 || code === 1279 || code === 1282) return '⛈️'; // Thunderstorm
    return '☀️';
  };

  return (
    <div className="weather-page">
      <Header />

      <div className="weather-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading weather data...</p>
          </div>
        ) : weather ? (
          <>
            {/* Main Weather Grid - Current & Summary */}
            <motion.div 
              className="weather-hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Left Column */}
              <motion.div 
                className="weather-current"
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
              >
                <motion.div 
                  className="weather-icon-large"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  key={weather.icon}
                >
                  {getWeatherIconEmoji(weather.icon)}
                </motion.div>
                <motion.h1 
                  className="weather-temp"
                  key={weather.temp}
                  animate={{ scale: 1 }}
                  initial={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {weather.temp}°C
                </motion.h1>
                <motion.p 
                  className="weather-status"
                  key={weather.weatherDescription}
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  {weather.weatherDescription || 'Current Weather'}
                </motion.p>
                <motion.p 
                  className="weather-feels-like"
                  key={weather.feelsLike}
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  Feels like <strong>{weather.feelsLike}°C</strong>
                </motion.p>
                
                {/* Quick Stats Row */}
                <motion.div 
                  className="weather-details-row"
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div className="weather-detail" whileHover={{ scale: 1.05 }}>
                    <span className="detail-icon">💧</span>
                    <span className="detail-value">{weather.humidity}%</span>
                    <span className="detail-label">Humidity</span>
                  </motion.div>
                  <motion.div className="weather-detail" whileHover={{ scale: 1.05 }}>
                    <span className="detail-icon">💨</span>
                    <span className="detail-value">{weather.windSpeed}</span>
                    <span className="detail-label">Wind km/h</span>
                  </motion.div>
                  <motion.div className="weather-detail" whileHover={{ scale: 1.05 }}>
                    <span className="detail-icon">🌧️</span>
                    <span className="detail-value">{weather.rainProbability}%</span>
                    <span className="detail-label">Rain Chance</span>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="temp-range"
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>↑ High: {weather.maxTemp}°C</span>
                  <span>↓ Low: {weather.minTemp}°C</span>
                </motion.div>
              </motion.div>

              {/* Right Column - Summary */}
              <motion.div 
                className="weather-summary-container"
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="weather-summary"
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
                >
                  <p className="weather-time">📍 {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="weather-day">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  <p className="weather-description">{weather.weatherDescription}</p>

                  {/* Farming Suitability Card */}
                  {suitability && (
                    <motion.div 
                      className="suitability-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="suitability-score">
                        <div className={`score-circle ${suitability.score >= 80 ? 'excellent' : suitability.score >= 60 ? 'good' : suitability.score >= 40 ? 'moderate' : 'poor'}`}>
                          {suitability.score}%
                        </div>
                        <span className="score-label">Today's Score</span>
                      </div>

                      <div className="suitability-content">
                        <h3>🌾 Farming Suitability</h3>
                        <p className="suitability-activity">
                          <strong>Best Activity:</strong> {suitability.bestActivity}
                        </p>
                        {suitability.alerts.length > 0 && (
                          <div className="suitability-alerts">
                            {suitability.alerts.map((alert, idx) => (
                              <div key={idx} className="alert-item">
                                {alert}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="suitability-risk">
                        <span className={`risk-badge ${suitability.riskLevel.toLowerCase()}`}>
                          {suitability.riskLevel} Risk
                        </span>
                        <span className="risk-label">Risk Level</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Hourly Forecast (matching mobile) */}
                <motion.div 
                  className="hourly-section"
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2>⏰ Next 8 Hours</h2>
                  <div className="hourly-scroll">
                    {hourlyData && hourlyData.length > 0 ? (
                      hourlyData.map((hour, idx) => (
                        <motion.div 
                          key={idx} 
                          className="hourly-card"
                          whileHover={{ scale: 1.05, y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="hourly-time">{hour.time}</p>
                          <p className="hourly-icon">{getWeatherIconEmoji(hour.icon)}</p>
                          <p className="hourly-temp">{hour.temp}°</p>
                          <p className="hourly-rain">💧{hour.rainProbability}%</p>
                        </motion.div>
                      ))
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>


            {/* Weather Details Grid (matching mobile) */}
            <motion.div 
              className="weather-details-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {[
                { icon: '💧', label: 'Humidity', value: `${weather.humidity}%`, status: weather.humidity >= 60 && weather.humidity <= 90 ? '✓' : '!' },
                { icon: '💨', label: 'Wind Speed', value: `${weather.windSpeed} km/h`, status: weather.windSpeed <= 20 ? '✓' : '!' },
                { icon: '🌧️', label: 'Precipitation', value: `${weather.precipitation}mm`, status: '✓' },
                { icon: '☁️', label: 'Rain Chance', value: `${weather.rainProbability}%`, status: '✓' },
                { icon: '🌱', label: 'Soil Moisture', value: `${Math.round(weather.soilMoisture)}%`, status: weather.soilMoisture >= 40 && weather.soilMoisture <= 60 ? '✓' : '!' },
                { icon: '💧', label: 'Rain Forecast', value: `${weather.rainForecast}mm`, status: '✓' }
              ].map((detail, idx) => (
                <motion.div
                  key={idx}
                  className="detail-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
                >
                  <span className="detail-icon">{detail.icon}</span>
                  <span className="detail-value">{detail.value}</span>
                  <span className="detail-label">{detail.label}</span>
                  {detail.status && <span className="detail-status">{detail.status}</span>}
                </motion.div>
              ))}
            </motion.div>
            <motion.div 
              className="optimal-section"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2>🎯 Optimal Conditions for Black Pepper</h2>
              <div className="optimal-grid">
                <motion.div 
                  className={`optimal-card ${weather.temp >= 20 && weather.temp <= 30 ? 'optimal' : 'outside'}`}
                  whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
                >
                  <h3>🌡️ Temperature</h3>
                  <p className="optimal-range">20-30°C</p>
                  <p className="optimal-current">Current: {weather.temp}°C</p>
                  <span className="status-badge">
                    {weather.temp >= 20 && weather.temp <= 30 ? '✓ Optimal' : '✗ Outside Range'}
                  </span>
                </motion.div>

                <motion.div 
                  className={`optimal-card ${weather.humidity >= 60 && weather.humidity <= 90 ? 'optimal' : 'outside'}`}
                  whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
                >
                  <h3>💧 Humidity</h3>
                  <p className="optimal-range">60-90%</p>
                  <p className="optimal-current">Current: {weather.humidity}%</p>
                  <span className="status-badge">
                    {weather.humidity >= 60 && weather.humidity <= 90 ? '✓ Optimal' : '✗ Outside Range'}
                  </span>
                </motion.div>

                <motion.div 
                  className={`optimal-card ${weather.windSpeed <= 20 ? 'optimal' : 'outside'}`}
                  whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
                >
                  <h3>💨 Wind Speed</h3>
                  <p className="optimal-range">0-20 km/h</p>
                  <p className="optimal-current">Current: {weather.windSpeed} km/h</p>
                  <span className="status-badge">
                    {weather.windSpeed <= 20 ? '✓ Optimal' : '✗ Outside Range'}
                  </span>
                </motion.div>

                <motion.div 
                  className={`optimal-card ${weather.soilMoisture >= 40 && weather.soilMoisture <= 60 ? 'optimal' : 'outside'}`}
                  whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
                >
                  <h3>🌱 Soil Moisture</h3>
                  <p className="optimal-range">40-60%</p>
                  <p className="optimal-current">Current: {Math.round(weather.soilMoisture)}%</p>
                  <span className="status-badge">
                    {weather.soilMoisture >= 40 && weather.soilMoisture <= 60 ? '✓ Optimal' : '✗ Outside Range'}
                  </span>
                </motion.div>
              </div>
            </motion.div>


            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <motion.div
                className="recommendations-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h2>🌿 Smart Farming Recommendations</h2>
                <div className="recommendations-grid">
                  {recommendations.map((rec, index) => (
                    <motion.div 
                      key={index} 
                      className={`recommendation-card ${rec.type}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.04, y: -4 }}
                      viewport={{ once: true }}
                    >
                      <div className="rec-icon">{rec.icon}</div>
                      <div className="rec-content">
                        <h3>{rec.title}</h3>
                        <p>{rec.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 7-Day Forecast */}
            {forecastData.length > 0 && (
              <motion.div 
                className="forecast-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h2>📅 7-Day Forecast</h2>
                <div className="forecast-cards">
                  {forecastData.map((day, index) => (
                    <motion.div 
                      key={index} 
                      className="forecast-card"
                      whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="forecast-date">{day.date}</p>
                      <p className="forecast-icon">{getWeatherIconEmoji(day.icon)}</p>
                      <div className="forecast-temps">
                        <span className="high">{day.maxTemp}°</span>
                        <span className="low">{day.minTemp}°</span>
                      </div>
                      <p className="forecast-chance">💧 {day.rainProbability}%</p>
                      <p className="forecast-precip">📊 {day.precipitation.toFixed(1)}mm</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : error ? (
          <div className="error-state">
            <p>Unable to load weather data. Please try again.</p>
            <p style={{ fontSize: '12px', color: '#888' }}>{error}</p>
            <button onClick={() => {
              setError(null);
              fetchWeather();
            }} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <div className="error-state">
            <p>Unable to load weather data. Please try again.</p>
            <button onClick={fetchWeather} className="retry-btn">
              Retry
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
