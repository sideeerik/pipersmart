
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  FiSearch,
  FiX,
  FiList,
  FiChevronRight,
  FiMapPin,
  FiGlobe,
} from 'react-icons/fi';
import {
  MdEco,
  MdStorefront,
  MdNavigation,
  MdClose,
  MdFavorite,
  MdFavoriteBorder,
  MdDelete,
  MdWaterDrop,
  MdAir,
  MdUmbrella,
  MdThermostat,
  MdInfo,
  MdCheckCircle,
  MdWarning,
  MdErrorOutline,
  MdWbSunny,
  MdCloud,
  MdBlurOn,
  MdAcUnit,
  MdFlashOn,
} from 'react-icons/md';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import './Mapping.css';

const { VITE_BACKEND_URL } = import.meta.env;
const API_BASE_URL = VITE_BACKEND_URL || 'http://localhost:5000';

const HOURLY_CARD_WIDTH = 92;
const HOURLY_CARD_GAP = 10;

const DEFAULT_LOCATION = {
  latitude: 13.9419,
  longitude: 121.1644,
};

const FARMS_DATA = [
  {
    id: 1,
    name: 'Buro Buro Springs Vermi Farm',
    location: 'Talisay, Negros Occidental',
    address: 'Barrio Concepcion, Talisay, Philippines, 6115 Philippines',
    specialty: 'Organic fertilizer and vermicompost production',
    latitude: 10.7333,
    longitude: 122.9667,
  },
  {
    id: 2,
    name: 'Spring Bloom Agri Farm Site 2',
    location: 'Sibunag, Guimaras',
    address: 'GHP8+FRH, Sibunag, Guimaras',
    specialty: 'Integrated Agri-eco tourism destination',
    latitude: 10.48,
    longitude: 122.58,
  },
  {
    id: 3,
    name: 'Valucrops Inc.',
    location: 'Amadeo, Cavite',
    address: 'Purok 2 Brgy, Bucal, Amadeo, Cavite',
    specialty: 'High value crops and fruit trees',
    latitude: 14.1686,
    longitude: 120.9328,
  },
  {
    id: 4,
    name: 'Mindanao Baptist Rural Life Center',
    location: 'Bansalan, Davao del Sur',
    address: 'Kinuskusan Elementary School, Davao - Cotabato Rd, Bansalan, Davao del Sur',
    specialty: 'Sustainable upland farming technologies',
    latitude: 6.8535,
    longitude: 125.1687,
  },
  {
    id: 5,
    name: 'Tavera Farms',
    location: 'Manolo Fortich, Bukidnon',
    address: 'Manolo Fortich, Bukidnon',
    specialty: 'High-altitude farming',
    latitude: 8.3667,
    longitude: 124.8667,
  },
  {
    id: 6,
    name: 'La Pimienta De Lipa',
    location: 'Lipa City, Batangas',
    address: 'Purok 6 Sampaguita, Lipa City, Batangas',
    specialty: 'Local pepper variety cultivation',
    latitude: 13.9142,
    longitude: 121.144,
  },
  {
    id: 7,
    name: 'Villa Fuscagna Farms',
    location: 'Lipa City, Batangas',
    address: 'X676+RC5, Lipa City, Batangas',
    specialty: 'Integrated farm production',
    latitude: 13.8764,
    longitude: 121.1387,
  },
  {
    id: 8,
    name: "Vilela's Farm",
    location: 'Ibaan, Batangas',
    address: '104 Pangao, Ibaan, 4230 Batangas',
    specialty: 'Long-established "pamintahan" and vanilla-pepper intercropping',
    latitude: 13.7894,
    longitude: 121.0134,
  },
  {
    id: 9,
    name: 'Gourmet Farms',
    location: 'Silang, Cavite',
    address: 'Km. 52 Aguinaldo Hwy, Silang, 4118 Cavite',
    specialty: 'Organic farming and farm-to-table dining',
    latitude: 14.216,
    longitude: 120.96,
  },
  {
    id: 10,
    name: 'Shambala Silang',
    location: 'Silang, Cavite',
    address: 'Shambala Road, Purok 5 Pulong Bunga Road, Silang, 4118 Cavite',
    specialty: 'Living art, culture & heritage in harmony with nature',
    latitude: 14.17,
    longitude: 120.9803,
  },
  {
    id: 11,
    name: 'Sanctuario Nature Farms',
    location: 'Indang, Cavite',
    address: 'Sitio Italaro, Brgy. Kayquit, 3 Indang - Mendez Rd, Indang, 4122 Cavite',
    specialty: 'Organic farming training center',
    latitude: 14.1494,
    longitude: 120.9042,
  },
  {
    id: 12,
    name: 'South Maya Farm',
    location: 'Amadeo, Cavite',
    address: '46 Purok 2, Brgy. Bucal, Amadeo, Cavite',
    specialty: 'Sustainable agricultural practices',
    latitude: 14.169,
    longitude: 120.933,
  },
  {
    id: 13,
    name: 'Pedro Farms',
    location: 'Silang, Cavite',
    address: 'Hukay Rd, Silang, Cavite',
    specialty: 'Local crop production',
    latitude: 14.2,
    longitude: 120.98,
  },
  {
    id: 14,
    name: 'Bailen Black Pepper',
    location: 'Gen. Emilio Aguinaldo, Cavite',
    address: 'Brgy. Narvaez, Gen. Emilio Aguinaldo (Bailen), Cavite',
    specialty: 'Traditional black pepper farming',
    latitude: 14.1512,
    longitude: 120.8103,
  },
  {
    id: 15,
    name: 'Nurture Farmacy',
    location: 'Tagaytay, Cavite',
    address: 'Pulong Saging, Brgy. Maitim 2nd West, Tagaytay (Silang boundary)',
    specialty: 'Wellness and organic farming',
    latitude: 14.1267,
    longitude: 120.9414,
  },
  {
    id: 16,
    name: 'Ole Farm Well',
    location: 'Padre Garcia, Batangas',
    address: '776 Purok 7, Brgy. San Miguel, Padre Garcia, Batangas',
    specialty: 'Diversified farming',
    latitude: 13.873,
    longitude: 121.1967,
  },
  {
    id: 17,
    name: 'Pinagkawitan Agri-Lot',
    location: 'Lipa City, Batangas',
    address: 'Brgy. Pinagkawitan, Lipa City, Batangas',
    specialty: 'Agricultural lot development',
    latitude: 13.8989,
    longitude: 121.1962,
  },
  {
    id: 18,
    name: 'Malitlit Pepper Site',
    location: 'Lipa City, Batangas',
    address: 'Brgy. Malitlit, Lipa City, Batangas',
    specialty: 'Pepper cultivation site',
    latitude: 13.9334,
    longitude: 121.2299,
  },
];

const RETAILERS_DATA = [
  {
    id: 101,
    name: 'Joypaul Trading',
    location: 'Lipa City, Batangas',
    address: '295 Brgy. Antipolo del Sur, Lipa City, Philippines, 4217',
    specialty: 'Agricultural trading',
    latitude: 13.914,
    longitude: 121.1885,
  },
  {
    id: 102,
    name: 'Pepperworks Trading',
    location: 'Lipa City, Batangas',
    address: '309 Zone 06 Brgy. Adya, Lipa City, Philippines, 4217',
    specialty: 'Spices and pepper trading',
    latitude: 13.8764,
    longitude: 121.1387,
  },
  {
    id: 103,
    name: "Nanay's Best Herbs and Spices",
    location: 'Lipa City, Batangas',
    address: '#229 Purok 4 Barangay Sampaguita, Lipa City, 4217 Batangas',
    specialty: 'Herbs and spices retail',
    latitude: 13.9142,
    longitude: 121.144,
  },
  {
    id: 104,
    name: "Amparo's Trading",
    location: 'Lipa City, Batangas',
    address: '044, Lipa City, 4217 Batangas',
    specialty: 'General merchandise and trading',
    latitude: 13.9419,
    longitude: 121.1644,
  },
  {
    id: 105,
    name: 'Garsion Merchandising Corp.',
    location: 'Lipa City, Batangas',
    address: '192 Brgy. Sampaguita, Lipa City, 4217 Batangas',
    specialty: 'Merchandising and supplies',
    latitude: 13.915,
    longitude: 121.145,
  },
  {
    id: 106,
    name: 'Gyllmarc Spices Plant',
    location: 'Lipa City, Batangas',
    address: 'Purok 1, Brgy. Calamias, Lipa City, Batangas',
    specialty: 'Spice processing and retail',
    latitude: 13.8726,
    longitude: 121.151,
  },
  {
    id: 107,
    name: 'LRG Pepper & Spices',
    location: 'Lipa City, Batangas',
    address: 'Brgy. Inosluban, Lipa City, Batangas',
    specialty: 'Pepper and spices specialty store',
    latitude: 13.9888,
    longitude: 121.171,
  },
  {
    id: 108,
    name: 'Lipa City Public Market',
    location: 'Lipa City, Batangas',
    address: 'Lipa City Public Market, Lipa City, Batangas',
    specialty: 'General public market',
    latitude: 13.94,
    longitude: 121.16,
  },
];

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
  white: '#FFFFFF',
  accent: '#F39C12',
  cardBg: '#FFFFFF',
};

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate-src.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .leaflet-control-container .leaflet-routing-container-hide { display: none; }
    .marker-popup { min-width: 190px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .marker-popup-type { font-size: 11px; font-weight: 700; color: #1B4D3E; margin-bottom: 6px; }
    .marker-popup-name-row { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #1F2937; }
    .marker-popup-location { margin-top: 6px; font-size: 11px; color: #5A7A73; line-height: 1.4; }
    .map-name-tooltip.leaflet-tooltip {
      background: #FFFFFF;
      border: 1px solid #D4E5DD;
      border-radius: 12px;
      color: #1B4D3E;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.14);
    }
    .map-name-tooltip.leaflet-tooltip-top:before { border-top-color: #D4E5DD; }
    .map-name-tooltip.farm-label.leaflet-tooltip { border-color: #9BD1A6; }
    .map-name-tooltip.retailer-label.leaflet-tooltip { border-color: #F7C37A; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function postToHost(payload) {
      try {
        var message = JSON.stringify(Object.assign({ source: 'macromap' }, payload));
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(message);
        } else if (window.parent) {
          window.parent.postMessage(message, '*');
        }
      } catch (err) {
        console.error(err);
      }
    }

    var map = L.map('map', {
      center: [13.9419, 121.1644],
      zoom: 13,
      rotate: true,
      touchRotate: true,
      rotateControl: { closeOnZeroBearing: false, position: 'topleft' },
      preferCanvas: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var userMarker;
    var markers = {};
    var routeLayer;
    var routeLayerGroup;
    var clickMarker;

    var farmIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    var retailerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    var userIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    var clickIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    function ensureRouteLayerGroup() {
      if (!routeLayerGroup) {
        map.createPane('routePane');
        map.getPane('routePane').style.zIndex = 450;
        routeLayerGroup = L.layerGroup([], { pane: 'routePane' }).addTo(map);
      }
    }

    function addMarkers(data) {
      Object.values(markers).forEach(m => map.removeLayer(m));
      markers = {};

      data.forEach(item => {
        var icon = item.type === 'Farms' ? farmIcon : retailerIcon;
        var markerType = item.type === 'Farms' ? 'Farm' : 'Retailer';
        var popupContent = '<div class="marker-popup">' +
          '<div class="marker-popup-type">' + (item.type === 'Farms' ? 'Farm Location' : 'Retailer Location') + '</div>' +
          '<div class="marker-popup-name-row"><span>?</span><span>' + item.name + '</span></div>' +
          '<div class="marker-popup-location">Location: ' + (item.location || item.address || 'Location') + '</div>' +
          '<div class="marker-popup-location" style="margin-top:4px;">' + markerType + ' Name: ' + item.name + '</div>' +
          '</div>';

        var marker = L.marker([item.latitude, item.longitude], { icon: icon })
          .addTo(map)
          .bindPopup(popupContent)
          .bindTooltip('? ' + markerType + ': ' + item.name, {
            permanent: true,
            direction: 'top',
            offset: [0, -26],
            opacity: 0.95,
            className: 'map-name-tooltip ' + (item.type === 'Farms' ? 'farm-label' : 'retailer-label')
          });

        marker.on('click', function() {
          postToHost({ type: 'markerClick', id: item.id, itemType: item.type });
        });

        markers[item.id] = marker;
      });
    }

    function updateUserLocation(lat, lng) {
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      }
    }

    function focusLocation(lat, lng) {
      map.setView([lat, lng], 15);
    }

    function drawRoute(coords) {
      ensureRouteLayerGroup();
      routeLayerGroup.clearLayers();
      routeLayer = null;
      if (coords && coords.length > 0) {
        var latLngs = coords.map(c => [c.latitude, c.longitude]);
        routeLayer = L.polyline(latLngs, {
          color: 'blue',
          weight: 5,
          opacity: 0.75,
          smoothFactor: 2.5,
          renderer: L.canvas(),
          pane: 'routePane'
        }).addTo(routeLayerGroup);
        routeLayer.bringToFront();
        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
      }
    }

    function setClickMarker(lat, lng) {
      if (clickMarker) {
        map.removeLayer(clickMarker);
      }
      clickMarker = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
    }

    function clearClickMarker() {
      if (clickMarker) {
        map.removeLayer(clickMarker);
        clickMarker = null;
      }
    }

    map.on('click', function(e) {
      postToHost({
        type: 'mapClick',
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    });

    map.on('zoomend moveend resize', function() {
      if (routeLayer && routeLayer.redraw) {
        routeLayer.redraw();
      }
      if (routeLayer && routeLayer.bringToFront) {
        routeLayer.bringToFront();
      }
    });

    document.addEventListener('message', function(event) {
      handleMessage(event.data);
    });

    window.addEventListener('message', function(event) {
      handleMessage(event.data);
    });

    function handleMessage(data) {
      try {
        var msg = typeof data === 'string' ? JSON.parse(data) : data;
        if (!msg || msg.source !== 'macromap') return;

        if (msg.type === 'updateUserLocation') {
          updateUserLocation(msg.latitude, msg.longitude);
        } else if (msg.type === 'addMarkers') {
          addMarkers(msg.data);
        } else if (msg.type === 'focusLocation') {
          focusLocation(msg.latitude, msg.longitude);
        } else if (msg.type === 'drawRoute') {
          drawRoute(msg.coordinates);
        } else if (msg.type === 'setClickMarker') {
          setClickMarker(msg.latitude, msg.longitude);
        } else if (msg.type === 'clearClickMarker') {
          clearClickMarker();
        }
      } catch (e) {
        console.error(e);
      }
    }
  </script>
</body>
</html>
`;
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

  if (
    searchableText.includes('pepper') ||
    searchableText.includes('pamintahan') ||
    searchableText.includes('piper')
  ) {
    bonus += 8;
    reasons.push('pepper-linked location');
  }

  return {
    value: Math.min(14, bonus),
    reasons,
  };
};

const calculateSuitabilityScore = (weather, elevation, rainProbability, locationContext = {}) => {
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

const getSuitabilityRating = (score) => {
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

const getDetailedRecommendations = (weather, elevation, rainProbability) => {
  const recommendations = [];

  if (weather.temp < 20) {
    recommendations.push({
      type: 'danger',
      title: 'Temperature Too Low',
      message: 'Below 20°C can damage black pepper growth. Protected establishment is recommended.',
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
      message: `Current temperature of ${weather.temp}°C is in the preferred warm range for black pepper.`,
    });
  } else {
    recommendations.push({
      type: 'warning',
      title: 'Heat Stress Risk',
      message: 'Temperatures above 35°C can stress vines. Use shade, mulch, and reliable irrigation.',
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

const getWeatherCondition = (code) => {
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

const formatPhilippineHourLabel = (value) => {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    hour12: false,
  }).format(new Date(value));

  return `${Number(hour)}:00`;
};

const formatPhilippineDayLabel = (value) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

const getWeatherData = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
        hourly: 'temperature_2m,precipitation_probability,weather_code,soil_moisture_0_to_10cm',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
        forecast_days: 7,
        timezone: 'auto',
      },
    });

    const current = response.data.current;
    const daily = response.data.daily;
    const hourly = response.data.hourly;

    const hourlyData = hourly.time.slice(0, 24).map((time, index) => ({
      time: formatPhilippineHourLabel(time),
      temp: Math.round(hourly.temperature_2m[index]),
      rainProbability: hourly.precipitation_probability[index],
      weatherCode: hourly.weather_code[index],
    }));

    const dailyData = daily.time.map((time, index) => ({
      date: formatPhilippineDayLabel(time),
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
      rainProbability: daily.precipitation_probability_max[0],
      rainForecast: daily.precipitation_sum[0] || 0,
      weatherCode: current.weather_code,
      hourly: hourlyData,
      daily: dailyData,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
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

const getElevationForLocation = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`
    );
    const elevation = response.data?.results?.[0]?.elevation;
    return Number.isFinite(elevation) ? elevation : 100;
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    return 100;
  }
};

const getFarmingRecommendations = (weather) => {
  const recommendations = [];

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

  if (weather.rainProbability > 70) {
    recommendations.push({
      type: 'info',
      title: 'Rain Expected',
      message: 'High rain probability. Delay fertilizer application.',
    });
  }

  if (weather.soilMoisture < 20) {
    recommendations.push({
      type: 'warning',
      title: 'Dry Soil',
      message: 'Soil moisture is low. Increase irrigation.',
    });
  }

  return recommendations;
};

const getWeatherIcon = (code) => {
  if (!code && code !== 0) return 'cloud';
  if (code <= 3) return 'weather-sunny';
  if (code === 45 || code === 48) return 'weather-fog';
  if (code >= 51 && code <= 67) return 'weather-rainy';
  if (code >= 71 && code <= 77) return 'weather-snowy';
  if (code >= 80 && code <= 82) return 'weather-rainy';
  if (code >= 95 && code <= 99) return 'weather-lightning';
  return 'cloud';
};

const WeatherIcon = ({ code, size = 20, color = '#1B4D3E' }) => {
  const iconName = getWeatherIcon(code);
  if (iconName === 'weather-sunny') return <MdWbSunny size={size} color={color} />;
  if (iconName === 'weather-fog') return <MdBlurOn size={size} color={color} />;
  if (iconName === 'weather-rainy') return <MdUmbrella size={size} color={color} />;
  if (iconName === 'weather-snowy') return <MdAcUnit size={size} color={color} />;
  if (iconName === 'weather-lightning') return <MdFlashOn size={size} color={color} />;
  return <MdCloud size={size} color={color} />;
};

const RecommendationIcon = ({ type, color }) => {
  if (type === 'danger') return <MdErrorOutline size={18} color={color} />;
  if (type === 'warning') return <MdWarning size={18} color={color} />;
  if (type === 'info') return <MdInfo size={18} color={color} />;
  return <MdCheckCircle size={18} color={color} />;
};

export default function MacromappingPage() {
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [suitabilityData, setSuitabilityData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Farms');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900
  );
  const [sheetTop, setSheetTop] = useState(0);

  const mapFrameRef = useRef(null);
  const lastClickTimes = useRef({});
  const searchDebounceTimer = useRef(null);
  const suppressMapTapUntil = useRef(0);
  const confirmResolverRef = useRef(null);
  const sheetTopRef = useRef(sheetTop);
  const sheetPositionsRef = useRef({ minTop: 0, midTop: 0, maxTop: 0 });
  const dragStateRef = useRef({ active: false, startY: 0, startTop: 0 });
  const hourlyScrollRef = useRef(null);
  const [hourlyViewportWidth, setHourlyViewportWidth] = useState(0);

  const hourlyEdgePadding = Math.max((hourlyViewportWidth - HOURLY_CARD_WIDTH) / 2, 0);

  const directoryItems = useMemo(
    () => (activeCategory === 'Farms' ? FARMS_DATA : RETAILERS_DATA),
    [activeCategory]
  );

  const currentPhilippineHourLabel = useMemo(() => {
    const hourParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date());
    const hourValue = hourParts.find((part) => part.type === 'hour')?.value ?? '0';
    return `${Number(hourValue)}:00`;
  }, []);

  const postToMap = (payload) => {
    const frame = mapFrameRef.current;
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(JSON.stringify({ source: 'macromap', ...payload }), '*');
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const openDialog = (config) =>
    new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setDialog(config);
    });

  const closeDialog = (value) => {
    setDialog(null);
    if (confirmResolverRef.current) {
      confirmResolverRef.current(value);
      confirmResolverRef.current = null;
    }
  };

  const getAuthToken = () => localStorage.getItem('token');

  const suppressMapTap = (duration = 800) => {
    suppressMapTapUntil.current = Date.now() + duration;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return '--';
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  const fetchLocationWeather = async (latitude, longitude, locationName, locationContext = {}) => {
    try {
      setLoadingWeather(true);
      const data = await getWeatherData(latitude, longitude);
      const elevation = await getElevationForLocation(latitude, longitude);
      const scoreResult = calculateSuitabilityScore(data, elevation, data.rainProbability, locationContext);
      const suitability = getSuitabilityRating(scoreResult.score);
      const detailedRecommendations = getDetailedRecommendations(data, elevation, data.rainProbability);

      setWeatherData({
        locationName,
        latitude,
        longitude,
        ...data,
      });
      setSuitabilityData({
        ...scoreResult,
        elevation,
        ...suitability,
      });
      setRecommendations(detailedRecommendations.length > 0 ? detailedRecommendations : getFarmingRecommendations(data));
    } catch (error) {
      console.error('Error fetching weather:', error);
      setSuitabilityData(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchRoute = async (fromLat, fromLng, toLat, toLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=simplified&geometries=geojson`;
      const response = await axios.get(url);

      if (response.data.routes && response.data.routes.length > 0) {
        const coordinates = response.data.routes[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        postToMap({ type: 'drawRoute', coordinates });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const expandBottomSheet = () => {
    const { midTop } = sheetPositionsRef.current;
    setSheetTop(midTop);
  };

  const collapseBottomSheet = () => {
    const { minTop } = sheetPositionsRef.current;
    setSheetTop(minTop);
  };

  const clearSelectedPlace = () => {
    setIsNavigating(false);
    setSelectedItem(null);
    postToMap({ type: 'drawRoute', coordinates: [] });
    postToMap({ type: 'clearClickMarker' });
    collapseBottomSheet();
  };

  const isLocationSaved = (item) => savedLocations.some((loc) =>
    Number(loc.latitude) === Number(item.latitude) && Number(loc.longitude) === Number(item.longitude)
  );

  const getSavedLocationId = (item) => {
    const saved = savedLocations.find((loc) =>
      Number(loc.latitude) === Number(item.latitude) && Number(loc.longitude) === Number(item.longitude)
    );
    return saved?._id;
  };

  const saveLocation = async (item) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showToast('Please login to save locations');
        return;
      }
      const scoreValue = Number(suitabilityData?.score);
      if (!Number.isFinite(scoreValue) || !suitabilityData?.rating) {
        showToast('Run the analysis first before saving this location');
        return;
      }

      const locationName = item?.name || item?.displayName || item?.farmName || item?.title || item?.address || 'Selected Location';

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/macromap/save`,
        {
          name: locationName,
          displayName: item?.name || item?.displayName || '',
          locationDetails: {
            street: item.address || '',
            village: item.location || '',
            town: '',
            city: '',
            county: '',
            state: '',
            country: '',
            postalcode: ''
          },
          latitude: item.latitude,
          longitude: item.longitude,
          weather: weatherData || {},
          elevation: suitabilityData?.elevation,
          annualRainfall: undefined,
          soilPH: undefined,
          score: scoreValue,
          scoreFactors: suitabilityData?.breakdown || {},
          rating: suitabilityData?.rating || 'Fair',
          recommendations: recommendations || []
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showToast(`${item.name} saved to favorites!`);
        fetchSavedLocations();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      if (errorMsg === 'This location is already saved') {
        showToast('This location is already in your favorites');
      } else {
        showToast(`Failed to save: ${errorMsg}`);
      }
      console.error('Save error:', error.response?.data || error.message);
    }
  };

  const unsaveLocation = async (locationId) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${API_BASE_URL}/api/v1/macromap/analyses/${locationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Location removed from favorites');
      fetchSavedLocations();
    } catch (error) {
      showToast('Failed to remove location');
      console.error('Unsave error:', error);
    }
  };

  const fetchSavedLocations = async () => {
    try {
      setLoadingSaved(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/v1/macromap/analyses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data) {
        setSavedLocations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching saved locations:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleItemPress = async (item, type = null) => {
    const now = Date.now();
    if (lastClickTimes.current.itemPress && now - lastClickTimes.current.itemPress < 500) return;
    lastClickTimes.current.itemPress = now;

    const isSaved = isLocationSaved(item);
    const proceed = await openDialog({
      title: 'Proceed to location?',
      message: `Navigate to ${item.name}?`,
      actions: [
        { label: 'Cancel', value: false, variant: 'ghost' },
        { label: 'Proceed', value: true, variant: 'primary' },
      ],
    });

    if (!proceed) return;

    showLocationDetails(item, type);

    setTimeout(async () => {
      if (isSaved) {
        const savedId = getSavedLocationId(item);
        const remove = await openDialog({
          title: 'Already Saved',
          message: `${item.name} is in your favorites`,
          actions: [
            { label: 'Keep', value: false, variant: 'ghost' },
            { label: 'Remove from Favorites', value: true, variant: 'danger' },
          ],
        });
        if (remove && savedId) {
          unsaveLocation(savedId);
        }
      } else {
        const save = await openDialog({
          title: 'Save location?',
          message: `Save ${item.name} to your favorites?`,
          actions: [
            { label: 'Cancel', value: false, variant: 'ghost' },
            { label: 'Save', value: true, variant: 'primary' },
          ],
        });
        if (save) {
          saveLocation(item);
        }
      }
    }, 300);
  };

  const showLocationDetails = (item, type = null) => {
    if (type && type !== activeCategory) {
      setActiveCategory(type);
    }
    setSelectedItem(type ? { ...item, type } : item);
    fetchLocationWeather(item.latitude, item.longitude, item.name, {
      ...item,
      kind: (type || activeCategory) === 'Farms' ? 'farm' : 'retailer',
    });
    if (sidePanelOpen) {
      setSidePanelOpen(false);
    }
    expandBottomSheet();
    postToMap({ type: 'focusLocation', latitude: item.latitude, longitude: item.longitude });
    if (userLocation) {
      fetchRoute(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
    }
  };

  const handleMapClick = async (latitude, longitude) => {
    const now = Date.now();
    if (lastClickTimes.current.mapClick && now - lastClickTimes.current.mapClick < 500) return;
    lastClickTimes.current.mapClick = now;

    let addressName = 'Clicked Location';
    let fullAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    try {
      const reverseResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const geoData = await reverseResponse.json();
      if (geoData.address) {
        const place = geoData.address;
        addressName = `${place.city || place.town || place.village || place.county || 'Location'}, ${
          place.state || place.country || ''
        }`.trim();
        fullAddress = [
          place.road,
          place.city || place.town || place.village,
          place.state,
          place.country,
        ]
          .filter(Boolean)
          .join(', ');
      }
    } catch (error) {
      console.warn('Reverse geocoding failed, using coordinates');
    }

    const clickedLocation = {
      id: Math.random(),
      name: addressName,
      latitude,
      longitude,
      address: fullAddress,
      location: addressName,
      specialty: 'Custom Location',
    };

    const proceed = await openDialog({
      title: 'Proceed to location?',
      message: `Navigate to ${addressName}?`,
      actions: [
        { label: 'Cancel', value: false, variant: 'ghost' },
        { label: 'Proceed', value: true, variant: 'primary' },
      ],
    });

    if (!proceed) return;

    if (userLocation) {
      fetchRoute(userLocation.latitude, userLocation.longitude, latitude, longitude);
    }

    setSelectedItem(clickedLocation);
    fetchLocationWeather(latitude, longitude, addressName, clickedLocation);
    expandBottomSheet();

    setTimeout(async () => {
      const save = await openDialog({
        title: 'Save location?',
        message: 'Save this location to your favorites?',
        actions: [
          { label: 'Cancel', value: false, variant: 'ghost' },
          { label: 'Save', value: true, variant: 'primary' },
        ],
      });
      if (save) {
        saveLocation(clickedLocation);
      }
    }, 300);
  };

  const handleLocationClick = async (item) => {
    const farm = item.farm;
    const proceed = await openDialog({
      title: 'Go to location?',
      message: `Navigate to ${farm.name}?`,
      actions: [
        { label: 'Cancel', value: false, variant: 'ghost' },
        { label: 'Navigate', value: true, variant: 'primary' },
      ],
    });

    if (!proceed) return;
    if (!userLocation) {
      showToast('Unable to calculate route. Please enable location services.');
      return;
    }

    setSelectedItem(farm);
    fetchLocationWeather(farm.latitude, farm.longitude, farm.name, {
      ...farm,
      kind: 'farm',
    });
    fetchRoute(userLocation.latitude, userLocation.longitude, farm.latitude, farm.longitude);
    postToMap({ type: 'focusLocation', latitude: farm.latitude, longitude: farm.longitude });
    expandBottomSheet();
    setShowSavedPanel(false);
  };

  const startNavigation = async () => {
    const now = Date.now();
    if (lastClickTimes.current.proceed && now - lastClickTimes.current.proceed < 500) return;
    lastClickTimes.current.proceed = now;

    setIsNavigating(true);
    await openDialog({
      title: 'Navigation Started',
      message: `Navigate to ${selectedItem?.name || 'selected location'}. Follow the route on the map.`,
      actions: [{ label: 'OK', value: true, variant: 'primary' }],
    });
  };

  const cancelNavigation = () => {
    const now = Date.now();
    if (lastClickTimes.current.cancel && now - lastClickTimes.current.cancel < 500) return;
    lastClickTimes.current.cancel = now;
    clearSelectedPlace();
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleSelectSearchResult = async (item) => {
    const now = Date.now();
    if (lastClickTimes.current.searchSelect && now - lastClickTimes.current.searchSelect < 500) return;
    lastClickTimes.current.searchSelect = now;

    setSearchQuery(item.name);
    setSearchResults([]);
    setSearchActive(false);

    postToMap({ type: 'drawRoute', coordinates: [] });
    postToMap({ type: 'focusLocation', latitude: item.latitude, longitude: item.longitude });
    postToMap({ type: 'setClickMarker', latitude: item.latitude, longitude: item.longitude });

    if (item.source === 'local') {
      handleItemPress(item, item.type);
    } else {
      const proceed = await openDialog({
        title: 'Proceed to location?',
        message: `Navigate to ${item.name}?`,
        actions: [
          { label: 'Cancel', value: false, variant: 'ghost' },
          { label: 'Proceed', value: true, variant: 'primary' },
        ],
      });
      if (proceed) {
        if (userLocation) {
          fetchRoute(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
        }
        fetchLocationWeather(item.latitude, item.longitude, item.name, {
          ...item,
          kind: item.type === 'Farms' ? 'farm' : 'retailer',
        });
        setSelectedItem(item);
        expandBottomSheet();
      }
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    searchDebounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      const localResults = [
        ...FARMS_DATA.map((f) => ({
          ...f,
          type: 'Farms',
          source: 'local',
          unique_id: `local_farms_${f.id}`,
        })),
        ...RETAILERS_DATA.map((r) => ({
          ...r,
          type: 'Retailers',
          source: 'local',
          unique_id: `local_retailers_${r.id}`,
        })),
      ].filter((item) => item.name.toLowerCase().includes(text.toLowerCase()));

      try {
        const response = await axios.get(`https://photon.komoot.io/api/?q=${text}&limit=5`);
        const onlineResults = response.data.features.map((feature, index) => ({
          id: feature.properties.osm_id || Math.random(),
          unique_id: `online_${index}_${feature.properties.osm_id || Math.random()}`,
          name: feature.properties.name || feature.properties.city || 'Unknown Place',
          address: [
            feature.properties.street,
            feature.properties.city,
            feature.properties.state,
            feature.properties.country,
          ]
            .filter(Boolean)
            .join(', '),
          location: `${feature.properties.city || feature.properties.state || 'Location'}, ${
            feature.properties.country || 'Philippines'
          }`,
          specialty: 'Online location',
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          type: 'Location',
          source: 'online',
        }));

        setSearchResults([...localResults, ...onlineResults]);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults(localResults);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const isUIActive = () =>
    searchActive ||
    sidePanelOpen ||
    showSavedPanel ||
    isNavigating ||
    sheetTopRef.current !== sheetPositionsRef.current.minTop;

  const handleMapMessage = (event) => {
    try {
      if (typeof event.data !== 'string') return;
      const msg = JSON.parse(event.data);
      if (!msg || msg.source !== 'macromap') return;

      if (msg.type === 'markerClick') {
        const list = msg.itemType === 'Farms' ? FARMS_DATA : RETAILERS_DATA;
        const item = list.find((i) => i.id === msg.id);
        if (item) {
          handleItemPress(item, msg.itemType);
        }
      } else if (msg.type === 'mapClick') {
        if (Date.now() < suppressMapTapUntil.current) return;
        if (!isUIActive()) {
          handleMapClick(msg.latitude, msg.longitude);
          postToMap({ type: 'setClickMarker', latitude: msg.latitude, longitude: msg.longitude });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setSheetPositions = (height) => {
    const maxHeight = height * 0.85;
    const minHeight = 180;
    const snapPoint = height * 0.5;
    const maxTop = Math.max(height - maxHeight, 40);
    const midTop = Math.max(height - snapPoint, 80);
    const minTop = Math.max(height - minHeight, 140);
    sheetPositionsRef.current = { minTop, midTop, maxTop };
    if (sheetTopRef.current === 0) {
      setSheetTop(minTop);
    }
  };

  const startSheetDrag = (event) => {
    event.preventDefault();
    dragStateRef.current = {
      active: true,
      startY: event.clientY,
      startTop: sheetTopRef.current,
    };
    window.addEventListener('pointermove', handleSheetDrag);
    window.addEventListener('pointerup', endSheetDrag);
  };

  const handleSheetDrag = (event) => {
    if (!dragStateRef.current.active) return;
    const { maxTop, minTop } = sheetPositionsRef.current;
    const delta = event.clientY - dragStateRef.current.startY;
    const nextTop = Math.min(minTop, Math.max(maxTop, dragStateRef.current.startTop + delta));
    setSheetTop(nextTop);
  };

  const endSheetDrag = () => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    window.removeEventListener('pointermove', handleSheetDrag);
    window.removeEventListener('pointerup', endSheetDrag);

    const { maxTop, midTop, minTop } = sheetPositionsRef.current;
    const distances = [
      { pos: maxTop, dist: Math.abs(sheetTopRef.current - maxTop) },
      { pos: midTop, dist: Math.abs(sheetTopRef.current - midTop) },
      { pos: minTop, dist: Math.abs(sheetTopRef.current - minTop) },
    ];
    const nearest = distances.sort((a, b) => a.dist - b.dist)[0]?.pos ?? minTop;
    setSheetTop(nearest);
  };

  useEffect(() => {
    sheetTopRef.current = sheetTop;
  }, [sheetTop]);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setSheetPositions(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    setSheetPositions(viewportHeight);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewportHeight]);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    const handler = (event) => handleMapMessage(event);
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  });

  useEffect(() => {
    if (!weatherData?.hourly?.length || !hourlyScrollRef.current) return;
    const currentHourIndex = weatherData.hourly.findIndex((hour) => hour.time === currentPhilippineHourLabel);
    if (currentHourIndex < 0) return;
    hourlyScrollRef.current.scrollTo({
      left: currentHourIndex * (HOURLY_CARD_WIDTH + HOURLY_CARD_GAP),
      behavior: 'smooth',
    });
  }, [weatherData?.hourly, currentPhilippineHourLabel]);

  const initializeMap = async () => {
    try {
      setLoading(true);
      if (!navigator.geolocation) {
        setUserLocation(DEFAULT_LOCATION);
        fetchLocationWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, 'Lipa City');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchLocationWeather(latitude, longitude, 'My Location');
          postToMap({ type: 'updateUserLocation', latitude, longitude });
          setLoading(false);
        },
        async () => {
          setUserLocation(DEFAULT_LOCATION);
          fetchLocationWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, 'Lipa City');
          postToMap({ type: 'updateUserLocation', ...DEFAULT_LOCATION });
          postToMap({ type: 'focusLocation', ...DEFAULT_LOCATION });
          setLoading(false);
        },
        { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 }
      );
    } catch (error) {
      console.error('Error getting location:', error);
      setUserLocation(DEFAULT_LOCATION);
      fetchLocationWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, 'Lipa City');
      postToMap({ type: 'updateUserLocation', ...DEFAULT_LOCATION });
      postToMap({ type: 'focusLocation', ...DEFAULT_LOCATION });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  useEffect(() => {
    if (userLocation) {
      postToMap({
        type: 'focusLocation',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    }
  }, [userLocation]);

  const sendMarkersToMap = () => {
    const combinedData = [
      ...FARMS_DATA.map((i) => ({ ...i, type: 'Farms' })),
      ...RETAILERS_DATA.map((i) => ({ ...i, type: 'Retailers' })),
    ];
    postToMap({ type: 'addMarkers', data: combinedData });
  };

  if (loading) {
    return (
      <div className="macromap-page">
        <Header />
        <div className="macromap-container">
          <div className="macromap-loading">
            <div className="macromap-spinner" />
            <p>Loading map...</p>
            <p className="macromap-subtext">Getting your location</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="macromap-page">
      <Header />
      <div className="macromap-container">
        <div className="macromap-layout">
          <div className="macromap-map-shell">
          <iframe
            ref={mapFrameRef}
            title="Macromap"
            className="macromap-map-frame"
            srcDoc={MAP_HTML}
            onLoad={() => {
              if (userLocation) {
                postToMap({
                  type: 'updateUserLocation',
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                });
              }
              sendMarkersToMap();
            }}
          />

          <div className="macromap-overlay">
            {!searchActive && (
              <button
                type="button"
                className="macromap-search-toggle"
                onClick={() => {
                  suppressMapTap(900);
                  setSearchActive(true);
                }}
              >
                <FiSearch size={22} />
              </button>
            )}

            {searchActive && (
              <div className="macromap-search-container">
                <div className="macromap-search-bar">
                  <FiSearch size={18} />
                  <input
                    className="macromap-search-input"
                    placeholder="Search farms, retailers, or places..."
                    value={searchQuery}
                    onChange={(event) => handleSearch(event.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="macromap-icon-button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchActive(false);
                      postToMap({ type: 'drawRoute', coordinates: [] });
                    }}
                  >
                    <FiX size={18} />
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="macromap-search-results">
                    {searchResults.map((item) => (
                      <button
                        type="button"
                        className="macromap-search-item"
                        key={item.unique_id}
                        onClick={() => handleSelectSearchResult(item)}
                      >
                        <div
                          className="macromap-search-icon"
                          style={{
                            backgroundColor:
                              item.type === 'Farms'
                                ? colors.primary
                                : item.type === 'Retailers'
                                ? colors.warning
                                : '#666',
                          }}
                        >
                          {item.source === 'local' ? <FiMapPin size={14} /> : <FiGlobe size={14} />}
                        </div>
                        <div className="macromap-search-text">
                          <span className="macromap-search-title">{item.name}</span>
                          <span className="macromap-search-subtitle">{item.address || 'Location'}</span>
                          {item.type && item.type !== 'Location' && (
                            <span className="macromap-search-type">{item.type}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {isSearching && <div className="macromap-search-loading">Searching...</div>}
              </div>
            )}

            {!searchActive && (
              <button
                type="button"
                className="macromap-toggle-list"
                onClick={() => {
                  suppressMapTap(900);
                  setSidePanelOpen((prev) => !prev);
                }}
              >
                <FiList size={18} />
                <span>{sidePanelOpen ? 'Hide List' : 'Show List'}</span>
              </button>
            )}

            {selectedItem && (
              <div className="macromap-selected-card">
                <div
                  className="macromap-selected-icon"
                  style={{ backgroundColor: selectedItem.type === 'Farms' ? colors.primary : colors.warning }}
                >
                  <FiMapPin size={16} color="#fff" />
                </div>
                <div className="macromap-selected-text">
                  <h4>{selectedItem.name}</h4>
                  <p>{selectedItem.address || selectedItem.location || 'Location'}</p>
                </div>
                <button type="button" className="macromap-icon-button" onClick={clearSelectedPlace}>
                  <FiX size={16} />
                </button>
              </div>
            )}

            <div className="macromap-legend">
              <h4>Map Legend</h4>
              <div>
                <span className="macromap-legend-dot" style={{ backgroundColor: 'green' }} />
                Farms
              </div>
              <div>
                <span className="macromap-legend-dot" style={{ backgroundColor: 'orange' }} />
                Retailers
              </div>
              <div>
                <span className="macromap-legend-dot" style={{ backgroundColor: 'blue' }} />
                You
              </div>
              <div>
                <span className="macromap-legend-dot" style={{ backgroundColor: 'red' }} />
                Destination
              </div>
            </div>
          </div>

          <div className={`macromap-side-panel ${sidePanelOpen ? 'open' : ''}`}>
            <div className="macromap-side-header">
              <div>
                <h3>Directory</h3>
                <p>Farms and retailers around you</p>
              </div>
              <div className="macromap-side-actions">
                <span
                  className="macromap-count-pill"
                  style={{
                    backgroundColor: activeCategory === 'Farms' ? '#E8F5E9' : '#FFF5E8',
                    color: activeCategory === 'Farms' ? colors.primary : '#C97A00',
                  }}
                >
                  {directoryItems.length}
                </span>
                <button type="button" className="macromap-icon-button" onClick={() => setSidePanelOpen(false)}>
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="macromap-side-toggle">
              <button
                type="button"
                className={activeCategory === 'Farms' ? 'active' : ''}
                onClick={() => handleCategoryChange('Farms')}
              >
                Farms
              </button>
              <button
                type="button"
                className={activeCategory === 'Retailers' ? 'active' : ''}
                onClick={() => handleCategoryChange('Retailers')}
              >
                Retailers
              </button>
            </div>

            <div className="macromap-side-list">
              {directoryItems.map((item) => (
                <button
                  type="button"
                  className="macromap-side-item"
                  key={item.id}
                  onClick={() => handleItemPress({ ...item, type: activeCategory }, activeCategory)}
                >
                  <div
                    className="macromap-side-icon"
                    style={{ backgroundColor: activeCategory === 'Farms' ? '#E8F5E9' : '#FFF4E5' }}
                  >
                    {activeCategory === 'Farms' ? (
                      <MdEco size={18} color={colors.primary} />
                    ) : (
                      <MdStorefront size={18} color="#C97A00" />
                    )}
                  </div>
                  <div className="macromap-side-info">
                    <h4>{item.name}</h4>
                    <p>
                      {activeCategory === 'Farms' ? 'Farm' : 'Retailer'}: {item.name}
                    </p>
                    <span>{item.location}</span>
                    <span className="macromap-side-address">{item.address || 'No address available'}</span>
                  </div>
                  <FiChevronRight size={18} color={colors.textLight} />
                </button>
              ))}
            </div>
          </div>

          <div className={`macromap-saved-panel ${showSavedPanel ? 'open' : ''}`}>
            <button
              type="button"
              className="macromap-saved-header"
              onClick={() => setShowSavedPanel((prev) => !prev)}
            >
              <div>
                <MdFavorite size={18} color={colors.danger} />
                <div>
                  <h4>Saved Locations</h4>
                  <p>{savedLocations.length} favorite places</p>
                </div>
              </div>
              <span>{savedLocations.length}</span>
            </button>

            {showSavedPanel && (
              <div className="macromap-saved-list">
                {loadingSaved && <p className="macromap-empty">Loading favorites...</p>}
                {!loadingSaved && savedLocations.length === 0 && (
                  <p className="macromap-empty">No saved locations yet</p>
                )}
                {savedLocations.map((item) => (
                  <div className="macromap-saved-item" key={item._id}>
                    <button type="button" className="macromap-saved-card" onClick={() => handleLocationClick(item)}>
                      <div className="macromap-saved-icon">
                        <FiMapPin size={16} />
                      </div>
                      <div>
                        <h4>{item.farm.name}</h4>
                        <p>{item.farm.location}</p>
                        <span>{item.farm.address || 'No address available'}</span>
                        {userLocation && (
                          <em>
                            {calculateDistance(
                              userLocation.latitude,
                              userLocation.longitude,
                              item.farm.latitude,
                              item.farm.longitude
                            )}{' '}
                            km away
                          </em>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      className="macromap-delete"
                      onClick={async () => {
                        const remove = await openDialog({
                          title: 'Remove',
                          message: `Remove ${item.farm.name}?`,
                          actions: [
                            { label: 'Cancel', value: false, variant: 'ghost' },
                            { label: 'Remove', value: true, variant: 'danger' },
                          ],
                        });
                        if (remove) {
                          unsaveLocation(item._id);
                        }
                      }}
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showSavedPanel && (
            <button type="button" className="macromap-floating-button" onClick={() => setShowSavedPanel(true)}>
              {savedLocations.length > 0 ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
              {savedLocations.length > 0 && <span>{savedLocations.length}</span>}
            </button>
          )}
        </div>
        <div className="macromap-bottom-sheet">
            <div className="macromap-sheet-handle" onPointerDown={startSheetDrag}>
              <span />
            </div>

            <div className="macromap-sheet-content">
              <div className="macromap-weather-header">
                <div>
                  <h2>{selectedItem ? selectedItem.name : weatherData?.locationName || 'Weather Details'}</h2>
                  {selectedItem && <p>{selectedItem.address}</p>}
                  {userLocation && (selectedItem || weatherData) && (
                    <p className="macromap-distance">
                      Distance:{' '}
                      {calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        selectedItem?.latitude || weatherData?.latitude,
                        selectedItem?.longitude || weatherData?.longitude
                      )}{' '}
                      km away
                    </p>
                  )}
                </div>
                {selectedItem && (
                  <button type="button" className="macromap-close" onClick={clearSelectedPlace}>
                    <MdClose size={18} />
                  </button>
                )}
              </div>

              {selectedItem && (
                <div className="macromap-action-buttons">
                  {!isNavigating ? (
                    <>
                      {isLocationSaved(selectedItem) ? (
                        <button
                          type="button"
                          className="macromap-action-btn danger"
                          onClick={() => unsaveLocation(getSavedLocationId(selectedItem))}
                        >
                          <MdDelete size={16} />
                          Remove
                        </button>
                      ) : (
                        <button type="button" className="macromap-action-btn danger" onClick={() => saveLocation(selectedItem)}>
                          <MdFavorite size={16} />
                          Save
                        </button>
                      )}
                      <button type="button" className="macromap-action-btn success" onClick={startNavigation}>
                        <MdNavigation size={16} />
                        Navigate
                      </button>
                    </>
                  ) : (
                    <button type="button" className="macromap-action-btn danger full" onClick={cancelNavigation}>
                      <MdClose size={16} />
                      Cancel Navigation
                    </button>
                  )}
                </div>
              )}

              {loadingWeather ? (
                <div className="macromap-loading-inline">
                  <div className="macromap-spinner small" />
                  Loading weather data...
                </div>
              ) : weatherData ? (
                <>
                  <div className="macromap-weather-card">
                    <div className="macromap-weather-main">
                      <div className="macromap-weather-icon">
                        <WeatherIcon code={weatherData.weatherCode} size={42} color="#ffffff" />
                      </div>
                      <div>
                        <span className="macromap-weather-label">Current Weather</span>
                        <h3>{weatherData.temp}°C</h3>
                        <p>{weatherData.condition}</p>
                      </div>
                    </div>
                    <div className="macromap-weather-range">
                      <span>H: {weatherData.maxTemp}°</span>
                      <span>L: {weatherData.minTemp}°</span>
                    </div>
                    <div className="macromap-weather-tags">
                      <span>Selected Site</span>
                      <span>Pepper analysis active</span>
                    </div>
                  </div>

                  <div className="macromap-details-grid">
                    <div className="macromap-detail-card">
                      <MdWaterDrop size={20} color={colors.primary} />
                      <h4>{weatherData.humidity}%</h4>
                      <p>Humidity</p>
                    </div>
                    <div className="macromap-detail-card">
                      <MdAir size={20} color={colors.primary} />
                      <h4>{weatherData.windSpeed} km/h</h4>
                      <p>Wind</p>
                    </div>
                    <div className="macromap-detail-card">
                      <MdUmbrella size={20} color={colors.primary} />
                      <h4>{weatherData.rainProbability}%</h4>
                      <p>Rain Chance</p>
                    </div>
                    <div className="macromap-detail-card">
                      <MdThermostat size={20} color={colors.primary} />
                      <h4>{weatherData.soilMoisture.toFixed(1)}%</h4>
                      <p>Soil</p>
                    </div>
                  </div>

                  {selectedItem && suitabilityData && (
                    <div className="macromap-suitability">
                      <div className="macromap-section-heading">
                        <div>
                          <h3>Black Pepper Suitability</h3>
                          <p>Field-readiness snapshot for this selected site</p>
                        </div>
                      </div>
                      <div className="macromap-suitability-card" style={{ borderColor: suitabilityData.color }}>
                        <div className="macromap-suitability-top">
                          <div>
                            <span>Suitability Score</span>
                            <h2>{suitabilityData.score}/100</h2>
                          </div>
                          <span className="macromap-suitability-pill" style={{ backgroundColor: suitabilityData.color }}>
                            {suitabilityData.rating}
                          </span>
                        </div>
                        <p>{suitabilityData.description}</p>
                        <p className="macromap-suitability-meta">
                          Elevation: {Math.round(suitabilityData.elevation)} m above sea level
                        </p>
                        <p className="macromap-suitability-meta">
                          Base score: {suitabilityData.baseScore}/100
                          {suitabilityData.bonusScore > 0 ? ` | Site bonus: +${suitabilityData.bonusScore}` : ''}
                        </p>
                        {suitabilityData.bonusReasons?.length > 0 && (
                          <p className="macromap-suitability-meta">
                            Bonus basis: {suitabilityData.bonusReasons.join(', ')}
                          </p>
                        )}
                        <div className="macromap-suitability-chips">
                          <span>{weatherData.temp}°C</span>
                          <span>{weatherData.humidity}% RH</span>
                          <span>{weatherData.rainProbability}% rain</span>
                        </div>
                        <div className="macromap-suitability-chips">
                          <span>Temp score {suitabilityData.breakdown.temperature}</span>
                          <span>Humidity score {suitabilityData.breakdown.humidity}</span>
                          <span>Elevation score {suitabilityData.breakdown.elevation}</span>
                          <span>Rain score {suitabilityData.breakdown.rainfall}</span>
                        </div>
                      </div>
                      <div className="macromap-tip-list">
                        <div className="macromap-tip">
                          <MdThermostat size={18} color={colors.accent} />
                          <div>
                            <h4>Temperature Fit</h4>
                            <p>
                              {weatherData.temp >= 23 && weatherData.temp <= 32
                                ? `Current ${weatherData.temp}°C is within the viable range for black pepper, with best growth near 27-28°C.`
                                : `Current ${weatherData.temp}°C is outside the ideal range. Use shade, windbreaks, or irrigation support if planting here.`}
                            </p>
                          </div>
                        </div>
                        <div className="macromap-tip">
                          <MdWaterDrop size={18} color={colors.accent} />
                          <div>
                            <h4>Moisture and Humidity</h4>
                            <p>
                              {weatherData.humidity >= 60 && weatherData.humidity <= 80
                                ? `Humidity at ${weatherData.humidity}% is favorable. Maintain drainage so high moisture helps vines without promoting root rot.`
                                : `Humidity at ${weatherData.humidity}% needs attention. Black pepper performs best with consistently humid but well-drained conditions.`}
                            </p>
                          </div>
                        </div>
                        <div className="macromap-tip">
                          <MdEco size={18} color={colors.accent} />
                          <div>
                            <h4>Planting Decision</h4>
                            <p>
                              {suitabilityData.score >= 80
                                ? 'This site is strong for black pepper. Prioritize support posts, disease monitoring, and regular mulching to capitalize on the conditions.'
                                : suitabilityData.score >= 60
                                ? 'This site can support black pepper with management. Improve drainage, moisture retention, and shade balance before scaling up.'
                                : 'This site is marginal for black pepper. Test on a small area first and correct water, shade, and elevation-related limits before expansion.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div className="macromap-recommendations">
                      <div className="macromap-section-heading">
                        <div>
                          <h3>Farming Recommendations</h3>
                          <p>Actionable checks before planting or visiting</p>
                        </div>
                      </div>
                      {recommendations.map((rec, idx) => {
                        const accent =
                          rec.type === 'danger'
                            ? colors.danger
                            : rec.type === 'warning'
                            ? colors.warning
                            : rec.type === 'info'
                            ? '#2D8CFF'
                            : colors.success;
                        return (
                          <div className={`macromap-rec-item ${rec.type}`} key={`${rec.title}-${idx}`}>
                            <div className="macromap-rec-top">
                              <div className="macromap-rec-icon" style={{ backgroundColor: `${accent}22` }}>
                                <RecommendationIcon type={rec.type} color={accent} />
                              </div>
                              <div>
                                <h4>{rec.title}</h4>
                                <span>
                                  {rec.type === 'danger'
                                    ? 'High priority'
                                    : rec.type === 'warning'
                                    ? 'Manage closely'
                                    : rec.type === 'info'
                                    ? 'Field note'
                                    : 'Favorable'}
                                </span>
                              </div>
                            </div>
                            <p>{rec.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {weatherData.hourly && (
                    <div className="macromap-forecast">
                      <div className="macromap-section-heading">
                        <div>
                          <h3>Next 24 Hours</h3>
                          <p>Short-range temperature and rain rhythm</p>
                        </div>
                      </div>
                      <div
                        className="macromap-hourly-scroll"
                        ref={hourlyScrollRef}
                        onScroll={(event) => setHourlyViewportWidth(event.currentTarget.clientWidth)}
                        style={{ padding: `0 ${hourlyEdgePadding}px` }}
                      >
                        {weatherData.hourly.map((hour) => {
                          const isCurrentHour = hour.time === currentPhilippineHourLabel;
                          return (
                            <div className={`macromap-hourly-card ${isCurrentHour ? 'active' : ''}`} key={hour.time}>
                              <span>{hour.time}</span>
                              <div className="macromap-hourly-icon">
                                <WeatherIcon
                                  code={hour.weatherCode}
                                  size={22}
                                  color={isCurrentHour ? '#FFFFFF' : colors.primary}
                                />
                              </div>
                              <strong>{hour.temp}°</strong>
                              <div className="macromap-hourly-rain">
                                <MdUmbrella size={12} color={isCurrentHour ? '#DDF7E8' : colors.primary} />
                                <span>{hour.rainProbability}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {weatherData.daily && weatherData.daily.length > 0 && (
                    <div className="macromap-daily">
                      <div className="macromap-section-heading">
                        <div>
                          <h3>7-Day Forecast</h3>
                          <p>Daily outlook for field visits and crop planning</p>
                        </div>
                      </div>
                      <div className="macromap-daily-list">
                        {weatherData.daily.map((day, index) => (
                          <div className={`macromap-daily-card ${index === 0 ? 'active' : ''}`} key={day.date}>
                            <div>
                              <span className="macromap-daily-date">{day.date}</span>
                              <div className="macromap-daily-temp">
                                <strong>{day.maxTemp}°</strong>
                                <span>{day.minTemp}°</span>
                              </div>
                            </div>
                            <div className="macromap-daily-icon">
                              <WeatherIcon code={day.weatherCode} size={26} color={colors.primary} />
                              <span>
                                {day.rainProbability >= 70
                                  ? 'Wet day'
                                  : day.rainProbability >= 40
                                  ? 'Mixed skies'
                                  : 'Dry window'}
                              </span>
                            </div>
                            <div className="macromap-daily-rain">
                              <span>{day.rainProbability}%</span>
                              <span>{day.rainAmount}mm</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="macromap-optimal">
                    <div className="macromap-section-heading">
                      <div>
                        <h3>Optimal Conditions for Black Pepper</h3>
                        <p>Quick benchmark against current field conditions</p>
                      </div>
                    </div>

                    <div className="macromap-optimal-overview">
                      <div>
                        <span>Field Benchmark</span>
                        <h4>Growing Window Match</h4>
                      </div>
                      <span
                        className="macromap-suitability-pill"
                        style={{ backgroundColor: suitabilityData?.color || colors.primary }}
                      >
                        {suitabilityData?.rating || 'Review'}
                      </span>
                      <p>
                        {suitabilityData?.score >= 80
                          ? 'Most core signals are aligned. The site is showing a strong black pepper growing window right now.'
                          : suitabilityData?.score >= 60
                          ? 'Several conditions are workable, but at least one factor needs management to keep black pepper performance stable.'
                          : 'Current conditions are below the ideal benchmark. Treat this as a monitored site and correct stress factors before scaling.'}
                      </p>
                    </div>

                    <div className="macromap-rec-item info">
                      <div className="macromap-rec-top">
                        <div className="macromap-rec-icon" style={{ backgroundColor: `${colors.primary}22` }}>
                          <MdInfo size={18} color={colors.primary} />
                        </div>
                        <div>
                          <h4>Black Pepper Insight</h4>
                        </div>
                      </div>
                      <p>
                        {suitabilityData?.score >= 80
                          ? 'This location is highly favorable for black pepper. Focus on trellising, disease scouting, and moisture consistency to maximize productivity.'
                          : suitabilityData?.score >= 60
                          ? 'This location is workable for black pepper. You can improve performance with proper shade, organic matter, and careful water management.'
                          : 'This location is not yet ideal for black pepper. Treat it as a trial area unless you can improve humidity, drainage, and field protection.'}
                      </p>
                    </div>

                    <div className="macromap-optimal-grid">
                      <div className={`macromap-optimal-card ${weatherData.temp >= 20 && weatherData.temp <= 30 ? 'good' : 'bad'}`}>
                        <div className="macromap-optimal-icon">
                          <MdThermostat size={18} />
                        </div>
                        <h4>Temperature</h4>
                        <strong>{weatherData.temp}°C</strong>
                        <span>Ideal: 20-30°C</span>
                        <em>{weatherData.temp >= 20 && weatherData.temp <= 30 ? 'Optimal' : 'Outside Range'}</em>
                      </div>
                      <div
                        className={`macromap-optimal-card ${
                          weatherData.humidity >= 60 && weatherData.humidity <= 90 ? 'good' : 'bad'
                        }`}
                      >
                        <div className="macromap-optimal-icon">
                          <MdWaterDrop size={18} />
                        </div>
                        <h4>Humidity</h4>
                        <strong>{weatherData.humidity}%</strong>
                        <span>Ideal: 60-90%</span>
                        <em>
                          {weatherData.humidity >= 60 && weatherData.humidity <= 90
                            ? 'Optimal'
                            : 'Outside Range'}
                        </em>
                      </div>
                      <div
                        className={`macromap-optimal-card ${
                          weatherData.soilMoisture >= 40 && weatherData.soilMoisture <= 60 ? 'good' : 'bad'
                        }`}
                      >
                        <div className="macromap-optimal-icon">
                          <MdThermostat size={18} />
                        </div>
                        <h4>Soil Moisture</h4>
                        <strong>{weatherData.soilMoisture.toFixed(1)}%</strong>
                        <span>Ideal: 40-60%</span>
                        <em>
                          {weatherData.soilMoisture >= 40 && weatherData.soilMoisture <= 60
                            ? 'Optimal'
                            : 'Outside Range'}
                        </em>
                      </div>
                    </div>
                  </div>

                  <div className="macromap-spacer" />
                </>
              ) : (
                <p className="macromap-empty">Select a location to see weather details.</p>
              )}
            </div>
          </div>

          
        </div>

        {toast && <div className="macromap-toast">{toast}</div>}

        {dialog && (
          <div className="macromap-dialog-backdrop">
            <div className="macromap-dialog">
              <h3>{dialog.title}</h3>
              <p>{dialog.message}</p>
              <div className="macromap-dialog-actions">
                {dialog.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`macromap-dialog-btn ${action.variant || 'primary'}`}
                    onClick={() => closeDialog(action.value)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
