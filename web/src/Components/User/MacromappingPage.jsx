import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import './Mapping.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Suitability Scoring Algorithm - Based on Black Pepper (Piper nigrum) Specifications
const calculateSuitabilityScore = (weatherData, elevation, annualRainfall, soilPH, latitude) => {
  const scores = {
    temperature: 0,
    humidity: 0,
    rainfall: 0,
    elevation: 0,
    soilPH: 0,
    latitude: 0
  };
  
  // 1. Temperature scoring (optimal: 23-32°C, ideal: 28°C)
  const temp = weatherData.temp || 26;
  if (temp < 0) scores.temperature = -50; // Frost - critical
  else if (temp < 23) scores.temperature = -20; // Too cold
  else if (temp >= 23 && temp <= 32) scores.temperature = 20; // Optimal
  else if (temp > 32) scores.temperature = -15; // Too hot
  
  // 2. Humidity scoring (optimal: 60-80%)
  const humidity = weatherData.humidity || 72;
  if (humidity < 60) scores.humidity = -15; // Too dry
  else if (humidity >= 60 && humidity <= 80) scores.humidity = 15; // Optimal
  else if (humidity > 90) scores.humidity = -10; // Disease risk
  else scores.humidity = 8; // Slightly above optimal
  
  // 3. Annual Rainfall scoring (optimal: 1500-2500mm)
  const rainfall = annualRainfall || 2000;
  if (rainfall < 1200) scores.rainfall = -25; // Insufficient
  else if (rainfall < 1500) scores.rainfall = -10; // Borderline
  else if (rainfall >= 1500 && rainfall <= 2500) scores.rainfall = 25; // Optimal
  else if (rainfall <= 3000) scores.rainfall = 20; // Acceptable
  else scores.rainfall = -5; // Waterlogging risk
  
  // 4. Elevation scoring (optimal: varies by latitude, max 1500m)
  const elev = elevation || 100;
  if (elev > 1500) scores.elevation = -20; // Too high
  else if (elev <= 1000) scores.elevation = 15; // Optimal
  else scores.elevation = 10; // Acceptable (1000-1500m)
  
  // 5. Soil pH scoring (optimal: 5.5-6.5, slightly acidic)
  const pH = soilPH || 6.0;
  if (pH < 5.0) scores.soilPH = -10; // Too acidic
  else if (pH < 5.5) scores.soilPH = -5; // Slightly too acidic
  else if (pH >= 5.5 && pH <= 6.5) scores.soilPH = 20; // Optimal
  else if (pH <= 7.0) scores.soilPH = -5; // Slightly alkaline
  else scores.soilPH = -20; // Too alkaline
  
  // 6. Latitude scoring (optimal: 20°N to 20°S)
  const absLat = Math.abs(latitude || 0);
  if (absLat > 30) scores.latitude = -30; // Outside suitable range
  else if (absLat > 20) scores.latitude = -15; // Outside optimal zone
  else if (absLat > 15) scores.latitude = 10; // Suitable
  else if (absLat > 10) scores.latitude = 15; // Good
  else scores.latitude = 20; // Excellent (near equator)
  
  // Calculate total with normalized range
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossible = 115; // 20+15+25+15+20+20
  const percentage = Math.max(0, Math.min(100, (totalScore / maxPossible) * 100));
  
  return {
    overall: Math.round(percentage),
    factors: scores,
    details: {
      temperature: temp,
      humidity,
      rainfall,
      elevation: elev,
      soilPH: pH,
      latitude
    }
  };
};

const getSuitabilityRating = (score) => {
  if (score >= 85) return { rating: 'Excellent', color: '#27AE60', icon: '🟢', text: 'Ideal for cultivation' };
  if (score >= 70) return { rating: 'Good', color: '#52C41A', icon: '🟢', text: 'Well-suited' };
  if (score >= 55) return { rating: 'Fair', color: '#F39C12', icon: '🟡', text: 'Marginal - may need special care' };
  if (score >= 40) return { rating: 'Poor', color: '#E67E22', icon: '🟠', text: 'Challenging conditions' };
  return { rating: 'Unsuitable', color: '#E74C3C', icon: '🔴', text: 'Not recommended' };
};

const getDetailedRecommendations = (temp, humidity, rainfall, elevation, soilPH, latitude) => {
  const recommendations = [];
  
  // Temperature recommendations
  if (temp < 23) {
    recommendations.push({
      title: '🌡️ Temperature Too Low',
      message: `${temp}°C is below optimal (23-32°C). Growth will be slow. Consider microclimate management.`,
      type: 'warning'
    });
  } else if (temp > 32) {
    recommendations.push({
      title: '🌡️ Temperature High',
      message: `${temp}°C exceeds optimal range. Ensure adequate shade and irrigation.`,
      type: 'warning'
    });
  } else {
    recommendations.push({
      title: '✅ Temperature Optimal',
      message: `${temp}°C is in ideal range (23-32°C) for black pepper.`,
      type: 'success'
    });
  }
  
  // Humidity recommendations
  if (humidity < 60) {
    recommendations.push({
      title: '💧 Humidity Low',
      message: `${humidity}% is below optimal (60-80%). Requires irrigation and mulching.`,
      type: 'warning'
    });
  } else if (humidity > 90) {
    recommendations.push({
      title: '💧 High Humidity Risk',
      message: `${humidity}% may increase disease risk. Ensure good drainage and ventilation.`,
      type: 'warning'
    });
  } else {
    recommendations.push({
      title: '✅ Humidity Optimal',
      message: `${humidity}% is ideal for black pepper cultivation.`,
      type: 'success'
    });
  }
  
  // Rainfall recommendations
  if (rainfall < 1500) {
    recommendations.push({
      title: '🌧️ Insufficient Rainfall',
      message: `${rainfall}mm/year is below requirement (1500-2500mm). Supplemental irrigation essential.`,
      type: 'danger'
    });
  } else if (rainfall <= 2500) {
    recommendations.push({
      title: '✅ Rainfall Optimal',
      message: `${rainfall}mm/year is in ideal range (1500-2500mm).`,
      type: 'success'
    });
  } else if (rainfall <= 3000) {
    recommendations.push({
      title: '🌧️ High Rainfall',
      message: `${rainfall}mm/year may cause waterlogging. Improve drainage system.`,
      type: 'warning'
    });
  }
  
  // Elevation recommendations
  if (elevation > 1000) {
    recommendations.push({
      title: '⛰️ Elevation High',
      message: `${elevation}m is above optimal range. Temperature will be lower. Suitable for cooler zones.`,
      type: 'warning'
    });
  } else {
    recommendations.push({
      title: '✅ Elevation Suitable',
      message: `${elevation}m is within optimal range (0-1000m).`,
      type: 'success'
    });
  }
  
  // Soil pH recommendations
  if (soilPH < 5.5) {
    recommendations.push({
      title: '🧪 Soil Too Acidic',
      message: `pH ${soilPH.toFixed(2)} is too acidic. Apply lime to bring pH closer to 5.5-6.5.`,
      type: 'warning'
    });
  } else if (soilPH <= 6.5) {
    recommendations.push({
      title: '✅ Soil pH Optimal',
      message: `pH ${soilPH.toFixed(2)} is in ideal range (5.5-6.5) for black pepper.`,
      type: 'success'
    });
  } else {
    recommendations.push({
      title: '🧪 Soil Too Alkaline',
      message: `pH ${soilPH.toFixed(2)} is too alkaline. Black pepper prefers acidic soil. Consider sulfur application.`,
      type: 'warning'
    });
  }
  
  // Latitude recommendations
  const absLat = Math.abs(latitude);
  if (absLat <= 15) {
    recommendations.push({
      title: '✅ Latitude Excellent',
      message: `Located at ideal tropical zone (${latitude.toFixed(2)}°). Perfect for black pepper.`,
      type: 'success'
    });
  } else if (absLat <= 20) {
    recommendations.push({
      title: '✅ Latitude Good',
      message: `Located at ${latitude.toFixed(2)}°. Suitable for black pepper cultivation.`,
      type: 'success'
    });
  } else {
    recommendations.push({
      title: '⚠️ Latitude Marginal',
      message: `Located at ${latitude.toFixed(2)}° - outside optimal tropical zone (20°N-20°S).`,
      type: 'warning'
    });
  }
  
  return recommendations;
};

export default function MacromappingPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 14.5994, lng: 120.9842 });
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef(null);

  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    success: '#27AE60',
    warning: '#F39C12',
    danger: '#E74C3C',
  };

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setLoading(true);
      // Try to get user location from browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLoading(false);
          },
          (error) => {
            console.warn('Geolocation error, using default:', error);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
    }
  };

  const analyzeLocation = async (latitude, longitude) => {
    try {
      setAnalyzing(true);
      
      // Get detailed location info via reverse geocoding
      let locationName = 'Selected Location';
      let locationDetails = {
        street: '',
        village: '',
        town: '',
        city: '',
        county: '',
        state: '',
        country: '',
        postalcode: ''
      };
      let displayName = '';
      
      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const geoData = await geoResponse.json();
        if (geoData.address) {
          locationDetails = {
            street: geoData.address.road || geoData.address.street || '',
            village: geoData.address.village || '',
            town: geoData.address.town || '',
            city: geoData.address.city || '',
            county: geoData.address.county || '',
            state: geoData.address.state || '',
            country: geoData.address.country || '',
            postalcode: geoData.address.postcode || ''
          };
          displayName = geoData.display_name || '';
          locationName = geoData.address.city || geoData.address.town || geoData.address.village || 'Selected Location';
        }
      } catch (geoError) {
        console.warn('Reverse geocoding failed:', geoError);
      }
      
      // Get weather data from WeatherAPI
      let weatherData = {
        temp: 26,
        humidity: 72,
        rainProbability: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy'
      };
      
      try {
        const weatherResponse = await axios.get('https://api.weatherapi.com/v1/current.json', {
          params: {
            key: 'f2e310925a9e4777883160350260102',
            q: `${latitude},${longitude}`,
            aqi: 'no'
          }
        });
        if (weatherResponse.data.current) {
          weatherData = {
            temp: Math.round(weatherResponse.data.current.temp_c),
            humidity: weatherResponse.data.current.humidity,
            rainProbability: weatherResponse.data.current.chance_of_rain || 65,
            windSpeed: Math.round(weatherResponse.data.current.wind_kph),
            condition: weatherResponse.data.current.condition.text
          };
        }
      } catch (weatherError) {
        console.warn('Weather API error, using fallback:', weatherError);
      }
      
      // Get elevation data
      let elevation = 100;
      try {
        const elevResponse = await axios.get(
          `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`
        );
        if (elevResponse.data.results && elevResponse.data.results.length > 0) {
          elevation = Math.round(elevResponse.data.results[0].elevation);
        }
      } catch (elevError) {
        console.warn('Elevation API error, using fallback:', elevError);
      }
      
      // Get annual rainfall from NASA POWER API
      let annualRainfall = 2000; // Default fallback
      try {
        const nasaResponse = await fetch(
          `https://power.larc.nasa.gov/api/v1/climate?parameters=PRECTOT&community=ag&longitude=${longitude}&latitude=${latitude}&start=2020&end=2022&format=json`
        );
        const nasaData = await nasaResponse.json();
        if (nasaData.properties && nasaData.properties.PRECTOT) {
          const yearlyData = nasaData.properties.PRECTOT;
          const avgRainfall = Object.values(yearlyData).reduce((a, b) => a + b, 0) / Object.keys(yearlyData).length;
          annualRainfall = Math.round(avgRainfall * 365 / 100); // Convert to mm/year
        }
      } catch (nasaError) {
        console.warn('NASA POWER API error, using fallback rainfall:', nasaError);
      }
      
      // Get soil pH from SoilGrids API
      let soilPH = 6.0; // Default fallback
      try {
        const soilResponse = await fetch(
          `https://rest.soilgrids.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&depth=0-5cm&property=phH2o`
        );
        const soilData = await soilResponse.json();
        if (soilData.properties && soilData.properties.phH2o && soilData.properties.phH2o.values && soilData.properties.phH2o.values.mean) {
          soilPH = (soilData.properties.phH2o.values.mean[0] / 10).toFixed(2); // Convert to pH scale
        }
      } catch (soilError) {
        console.warn('SoilGrids API error, using fallback soil pH:', soilError);
      }
      
      // Calculate suitability with all parameters
      const scoreResult = calculateSuitabilityScore(weatherData, elevation, annualRainfall, soilPH, latitude);
      const rating = getSuitabilityRating(scoreResult.overall);
      const recommendations = getDetailedRecommendations(
        scoreResult.details.temperature,
        scoreResult.details.humidity,
        scoreResult.details.rainfall,
        scoreResult.details.elevation,
        parseFloat(soilPH),
        latitude
      );
      
      const analysis = {
        id: Date.now(),
        name: locationName,
        displayName,
        locationDetails,
        latitude,
        longitude,
        weather: weatherData,
        elevation,
        annualRainfall,
        soilPH: parseFloat(soilPH),
        score: scoreResult.overall,
        scoreFactors: scoreResult.factors,
        rating,
        recommendations,
        timestamp: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };
      
      setSelectedAnalysis(analysis);
      setAnalyses([analysis, ...analyses]);
      setShowResults(true);
      setAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing location:', error);
      setAnalyzing(false);
    }
  };

  const MapClickHandler = ({ onAnalyze }) => {
    const map = useMap();
    
    useMapEvents({
      click: (e) => {
        onAnalyze(e.latlng.lat, e.latlng.lng);
      }
    });
    
    useEffect(() => {
      setTimeout(() => map.invalidateSize(), 100);
    }, [map]);
    
    return null;
  };

  if (loading) {
    return (
      <div className="mapping-page">
        <Header />
        <div className="mapping-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading map...</p>
            <p className="loading-subtext">Getting your location</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mapping-page">
      <Header />

      <div className="mapping-container">
        {/* Info Card */}
        <motion.div 
          className="info-card" 
          style={{ backgroundColor: colors.primary }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="info-content">
            <h2 style={{ color: '#FFFFFF', marginBottom: 8 }}>🌾 Black Pepper Macromapping</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>
              Find the best zones for black pepper cultivation. Click anywhere on the map to analyze suitability.
            </p>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="macromapping-grid">
          {/* Map Section */}
          <div className="map-section-enhanced">
            <div className="map-header-enhanced">
              <h1>Suitability Heatmap</h1>
              <p>Click any location to analyze</p>
            </div>

            <div className="map-wrapper-enhanced">
              {userLocation && (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="map-enhanced"
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* User Location Marker */}
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={L.divIcon({
                      html: `<div style="background-color: ${colors.primary}; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
                      className: 'user-marker',
                      iconSize: [20, 20]
                    })}
                  >
                    <Popup>📍 Your Location</Popup>
                  </Marker>

                  {/* 1km Radius Circle */}
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={1000}
                    pathOptions={{
                      color: colors.primary,
                      fill: false,
                      weight: 1,
                      opacity: 0.3,
                      dashArray: '5, 5'
                    }}
                  />

                  {/* Analysis Markers */}
                  {analyses.map((analysis) => (
                    <Marker
                      key={analysis.id}
                      position={[analysis.latitude, analysis.longitude]}
                      icon={L.divIcon({
                        html: `<div style="background-color: ${analysis.rating.color}; border-radius: 50%; width: 28px; height: 28px; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">${analysis.score}</div>`,
                        className: 'analysis-marker',
                        iconSize: [28, 28]
                      })}
                      eventHandlers={{
                        click: () => {
                          setSelectedAnalysis(analysis);
                          setShowResults(true);
                        }
                      }}
                    >
                      <Popup>
                        <div className="popup-analysis">
                          <strong>{analysis.name}</strong>
                          <p>Score: {analysis.score}%</p>
                          <p>{analysis.rating.rating}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Heat Circles for Analyses */}
                  {analyses.map((analysis) => (
                    <Circle
                      key={`heat-${analysis.id}`}
                      center={[analysis.latitude, analysis.longitude]}
                      radius={500}
                      pathOptions={{
                        fillColor: analysis.rating.color,
                        fillOpacity: 0.15,
                        color: analysis.rating.color,
                        weight: 1,
                        opacity: 0.3
                      }}
                    />
                  ))}

                  <MapClickHandler onAnalyze={analyzeLocation} />
                </MapContainer>
              )}
            </div>

            {/* Map Legend */}
            <motion.div 
              className="map-legend-enhanced"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3>Suitability Scale</h3>
              <div className="legend-grid">
                <div className="legend-item">
                  <div style={{ backgroundColor: '#E74C3C' }} className="legend-color"></div>
                  <span>Poor (0-39%)</span>
                </div>
                <div className="legend-item">
                  <div style={{ backgroundColor: '#E67E22' }} className="legend-color"></div>
                  <span>Fair (40-59%)</span>
                </div>
                <div className="legend-item">
                  <div style={{ backgroundColor: '#F39C12' }} className="legend-color"></div>
                  <span>Good (60-79%)</span>
                </div>
                <div className="legend-item">
                  <div style={{ backgroundColor: '#27AE60' }} className="legend-color"></div>
                  <span>Excellent (80-100%)</span>
                </div>
              </div>
            </motion.div>

            {/* Map Info */}
            <div className="map-info">
              <div className="info-row">
                <div className="info-item">
                  <div style={{ backgroundColor: colors.primary }} className="info-dot"></div>
                  <span>Your Location</span>
                </div>
                <div className="info-item">
                  <div style={{ backgroundColor: '#F39C12' }} className="info-dot"></div>
                  <span>Analyzed Location</span>
                </div>
              </div>
            </div>

            {analyzing && (
              <div className="analyzing-indicator">
                <div className="spinner-small"></div>
                <span>Analyzing location...</span>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <AnimatePresence>
            {showResults && selectedAnalysis && (
              <motion.div 
                className="results-panel"
                initial={{ opacity: 0, x: 400 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 400 }}
                transition={{ duration: 0.3 }}
              >
                <div className="results-header">
                  <h2>{selectedAnalysis.name}</h2>
                  <button onClick={() => setShowResults(false)} className="close-btn">✕</button>
                </div>

                {/* Score Card */}
                <div 
                  className="score-card" 
                  style={{ backgroundColor: selectedAnalysis.rating.color }}
                >
                  <div className="score-content">
                    <p className="score-label">Suitability Score</p>
                    <p className="score-value">{selectedAnalysis.score}%</p>
                    <p className="score-rating">{selectedAnalysis.rating.icon} {selectedAnalysis.rating.rating}</p>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: '8px 0 0 0' }}>{selectedAnalysis.rating.text}</p>
                  </div>
                </div>

                {/* Scoring Factors */}
                {selectedAnalysis.scoreFactors && (
                  <div className="results-section">
                    <h3>📊 Scoring Breakdown</h3>
                    <div className="scoring-factors">
                      <div className="factor-item">
                        <span className="factor-name">Temperature</span>
                        <span className="factor-value" style={{ color: selectedAnalysis.scoreFactors.temperature >= 15 ? '#27AE60' : '#E74C3C' }}>
                          {selectedAnalysis.scoreFactors.temperature > 0 ? '+' : ''}{selectedAnalysis.scoreFactors.temperature}
                        </span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">Humidity</span>
                        <span className="factor-value" style={{ color: selectedAnalysis.scoreFactors.humidity >= 10 ? '#27AE60' : '#E74C3C' }}>
                          {selectedAnalysis.scoreFactors.humidity > 0 ? '+' : ''}{selectedAnalysis.scoreFactors.humidity}
                        </span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">Rainfall</span>
                        <span className="factor-value" style={{ color: selectedAnalysis.scoreFactors.rainfall >= 15 ? '#27AE60' : '#E74C3C' }}>
                          {selectedAnalysis.scoreFactors.rainfall > 0 ? '+' : ''}{selectedAnalysis.scoreFactors.rainfall}
                        </span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">Elevation</span>
                        <span className="factor-value" style={{ color: selectedAnalysis.scoreFactors.elevation >= 10 ? '#27AE60' : '#E74C3C' }}>
                          {selectedAnalysis.scoreFactors.elevation > 0 ? '+' : ''}{selectedAnalysis.scoreFactors.elevation}
                        </span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">Soil pH</span>
                        <span className="factor-value" style={{ color: selectedAnalysis.scoreFactors.soilPH >= 15 ? '#27AE60' : '#E74C3C' }}>
                          {selectedAnalysis.scoreFactors.soilPH > 0 ? '+' : ''}{selectedAnalysis.scoreFactors.soilPH}
                        </span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">Latitude</span>
                        <span className="factor-value" style={{ color: selectedAnalysis.scoreFactors.latitude >= 10 ? '#27AE60' : '#E74C3C' }}>
                          {selectedAnalysis.scoreFactors.latitude > 0 ? '+' : ''}{selectedAnalysis.scoreFactors.latitude}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Info */}
                <div className="results-section">
                  <h3>📍 Location Details</h3>
                  <div className="info-list">
                    <div className="info-item-result">
                      <span className="label">Full Address</span>
                      <span className="value" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                        {selectedAnalysis.displayName || selectedAnalysis.name}
                      </span>
                    </div>
                    {selectedAnalysis.locationDetails.street && (
                      <div className="info-item-result">
                        <span className="label">Street</span>
                        <span className="value">{selectedAnalysis.locationDetails.street}</span>
                      </div>
                    )}
                    {selectedAnalysis.locationDetails.village && (
                      <div className="info-item-result">
                        <span className="label">Village</span>
                        <span className="value">{selectedAnalysis.locationDetails.village}</span>
                      </div>
                    )}
                    {selectedAnalysis.locationDetails.city && (
                      <div className="info-item-result">
                        <span className="label">City</span>
                        <span className="value">{selectedAnalysis.locationDetails.city}</span>
                      </div>
                    )}
                    {selectedAnalysis.locationDetails.county && (
                      <div className="info-item-result">
                        <span className="label">County</span>
                        <span className="value">{selectedAnalysis.locationDetails.county}</span>
                      </div>
                    )}
                    {selectedAnalysis.locationDetails.state && (
                      <div className="info-item-result">
                        <span className="label">State</span>
                        <span className="value">{selectedAnalysis.locationDetails.state}</span>
                      </div>
                    )}
                    {selectedAnalysis.locationDetails.country && (
                      <div className="info-item-result">
                        <span className="label">Country</span>
                        <span className="value">{selectedAnalysis.locationDetails.country}</span>
                      </div>
                    )}
                    {selectedAnalysis.locationDetails.postalcode && (
                      <div className="info-item-result">
                        <span className="label">Postal Code</span>
                        <span className="value">{selectedAnalysis.locationDetails.postalcode}</span>
                      </div>
                    )}
                    <div className="info-item-result">
                      <span className="label">Latitude</span>
                      <span className="value">{selectedAnalysis.latitude.toFixed(6)}</span>
                    </div>
                    <div className="info-item-result">
                      <span className="label">Longitude</span>
                      <span className="value">{selectedAnalysis.longitude.toFixed(6)}</span>
                    </div>
                    <div className="info-item-result">
                      <span className="label">Elevation</span>
                      <span className="value">{selectedAnalysis.elevation} m</span>
                    </div>
                    <div className="info-item-result">
                      <span className="label">Date & Time</span>
                      <span className="value">{selectedAnalysis.timestamp} {selectedAnalysis.time}</span>
                    </div>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="results-section">
                  <h3>🌤️ Weather & Environmental Data</h3>
                  <div className="weather-grid">
                    <div className="weather-card">
                      <span className="weather-icon">🌡️</span>
                      <span className="weather-label">Temperature</span>
                      <span className="weather-value">{selectedAnalysis.weather.temp}°C</span>
                      <span className="weather-optimal">Optimal: 23-32°C</span>
                    </div>
                    <div className="weather-card">
                      <span className="weather-icon">💧</span>
                      <span className="weather-label">Humidity</span>
                      <span className="weather-value">{selectedAnalysis.weather.humidity}%</span>
                      <span className="weather-optimal">Optimal: 60-80%</span>
                    </div>
                    <div className="weather-card">
                      <span className="weather-icon">💨</span>
                      <span className="weather-label">Wind Speed</span>
                      <span className="weather-value">{selectedAnalysis.weather.windSpeed} km/h</span>
                      <span className="weather-optimal">Optimal: &lt; 20 km/h</span>
                    </div>
                    <div className="weather-card">
                      <span className="weather-icon">🌧️</span>
                      <span className="weather-label">Rain Prob.</span>
                      <span className="weather-value">{selectedAnalysis.weather.rainProbability}%</span>
                      <span className="weather-optimal">Optimal: 60-80%</span>
                    </div>
                  </div>
                  <div className="info-item-result" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #D4E5DD' }}>
                    <span className="label">Condition</span>
                    <span className="value">{selectedAnalysis.weather.condition}</span>
                  </div>
                  <div className="info-item-result">
                    <span className="label">Annual Rainfall</span>
                    <span className="value">{selectedAnalysis.annualRainfall} mm (Optimal: 1500-2500mm)</span>
                  </div>
                  <div className="info-item-result">
                    <span className="label">Soil pH</span>
                    <span className="value">{selectedAnalysis.soilPH.toFixed(2)} (Optimal: 5.5-6.5)</span>
                  </div>
                  <div className="info-item-result">
                    <span className="label">Elevation</span>
                    <span className="value">{selectedAnalysis.elevation} m (Optimal: 0-1000m)</span>
                  </div>
                </div>

                {/* Recommendations */}
                {selectedAnalysis.recommendations.length > 0 && (
                  <div className="results-section">
                    <h3>Recommendations</h3>
                    <div className="recommendations-list">
                      {selectedAnalysis.recommendations.map((rec, idx) => (
                        <div key={idx} className={`rec-item rec-${rec.type}`}>
                          <span className="rec-icon">
                            {rec.type === 'success' ? '✅' : '⚠️'}
                          </span>
                          <div className="rec-content">
                            <p className="rec-title">{rec.title}</p>
                            <p className="rec-message">{rec.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Analyses */}
        {analyses.length > 0 && (
          <motion.div 
            className="recent-analyses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2>Recent Analyses</h2>
            <div className="analyses-grid">
              {analyses.slice(0, 4).map((analysis) => (
                <div 
                  key={analysis.id} 
                  className="analysis-item"
                  onClick={() => {
                    setSelectedAnalysis(analysis);
                    setShowResults(true);
                  }}
                >
                  <div 
                    className="score-circle" 
                    style={{ backgroundColor: analysis.rating.color }}
                  >
                    {analysis.score}%
                  </div>
                  <h4>{analysis.name}</h4>
                  <p>{analysis.rating.rating}</p>
                  <p className="analysis-date">{analysis.timestamp}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
