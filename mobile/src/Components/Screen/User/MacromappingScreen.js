import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
  PanResponder,
  Animated,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { BACKEND_URL } from 'react-native-dotenv';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import MobileHeader from '../../shared/MobileHeader';
import { getWeatherData, getFarmingRecommendations } from '../../../utils/weatherService';
import { getElevation } from '../../../utils/elevationService';
import { getToken, logout } from '../../utils/helpers';
import {
  calculateSuitabilityScore,
  getSuitabilityRating,
  getDetailedRecommendations,
} from '../../../utils/suitabilityService';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width, height } = Dimensions.get('window');
const HOURLY_CARD_WIDTH = 92;
const HOURLY_CARD_GAP = 10;
// Bottom Sheet Config - Now serving as Weather Dashboard
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.85;
const BOTTOM_SHEET_MIN_HEIGHT = 180; // Increased to show basic weather glance
const BOTTOM_SHEET_SNAP_POINT = height * 0.5;

// Side Panel Config
const SIDE_PANEL_WIDTH = width * 0.78;
const CONTROL_TOP_OFFSET = Platform.OS === 'android'
  ? (StatusBar.currentHeight || 0) + 74
  : 98;
const SELECTED_CARD_TOP_OFFSET = CONTROL_TOP_OFFSET + 86;

const DEFAULT_LOCATION = {
  latitude: 13.9419,
  longitude: 121.1644, // Lipa City default
};

const FARMS_DATA = [
  {
    id: 1,
    name: "Buro Buro Springs Vermi Farm",
    location: "Talisay, Negros Occidental",
    address: "Barrio Concepcion, Talisay, Philippines, 6115 Philippines",
    specialty: "Organic fertilizer and vermicompost production",
    latitude: 10.7333,
    longitude: 122.9667,
  },
  {
    id: 2,
    name: "Spring Bloom Agri Farm Site 2",
    location: "Sibunag, Guimaras",
    address: "GHP8+FRH, Sibunag, Guimaras",
    specialty: "Integrated Agri-eco tourism destination",
    latitude: 10.4800,
    longitude: 122.5800,
  },
  {
    id: 3,
    name: "Valucrops Inc.",
    location: "Amadeo, Cavite",
    address: "Purok 2 Brgy, Bucal, Amadeo, Cavite",
    specialty: "High value crops and fruit trees",
    latitude: 14.1686,
    longitude: 120.9328,
  },
  {
    id: 4,
    name: "Mindanao Baptist Rural Life Center",
    location: "Bansalan, Davao del Sur",
    address: "Kinuskusan Elementary School, Davao - Cotabato Rd, Bansalan, Davao del Sur",
    specialty: "Sustainable upland farming technologies",
    latitude: 6.8535,
    longitude: 125.1687,
  },
  {
    id: 5,
    name: "Tavera Farms",
    location: "Manolo Fortich, Bukidnon",
    address: "Manolo Fortich, Bukidnon",
    specialty: "High-altitude farming",
    latitude: 8.3667,
    longitude: 124.8667,
  },
  {
    id: 6,
    name: "La Pimienta De Lipa",
    location: "Lipa City, Batangas",
    address: "Purok 6 Sampaguita, Lipa City, Batangas",
    specialty: "Local pepper variety cultivation",
    latitude: 13.9142,
    longitude: 121.1440,
  },
  {
    id: 7,
    name: "Villa Fuscagna Farms",
    location: "Lipa City, Batangas",
    address: "X676+RC5, Lipa City, Batangas",
    specialty: "Integrated farm production",
    latitude: 13.8764,
    longitude: 121.1387,
  },
  {
    id: 8,
    name: "Vilela's Farm",
    location: "Ibaan, Batangas",
    address: "104 Pangao, Ibaan, 4230 Batangas",
    specialty: 'Long-established "pamintahan" and vanilla-pepper intercropping',
    latitude: 13.7894,
    longitude: 121.0134,
  },
  {
    id: 9,
    name: "Gourmet Farms",
    location: "Silang, Cavite",
    address: "Km. 52 Aguinaldo Hwy, Silang, 4118 Cavite",
    specialty: "Organic farming and farm-to-table dining",
    latitude: 14.2160,
    longitude: 120.9600,
  },
  {
    id: 10,
    name: "Shambala Silang",
    location: "Silang, Cavite",
    address: "Shambala Road, Purok 5 Pulong Bunga Road, Silang, 4118 Cavite",
    specialty: "Living art, culture & heritage in harmony with nature",
    latitude: 14.1700,
    longitude: 120.9803,
  },
  {
    id: 11,
    name: "Sanctuario Nature Farms",
    location: "Indang, Cavite",
    address: "Sitio Italaro, Brgy. Kayquit, 3 Indang - Mendez Rd, Indang, 4122 Cavite",
    specialty: "Organic farming training center",
    latitude: 14.1494,
    longitude: 120.9042,
  },
  {
    id: 12,
    name: "South Maya Farm",
    location: "Amadeo, Cavite",
    address: "46 Purok 2, Brgy. Bucal, Amadeo, Cavite",
    specialty: "Sustainable agricultural practices",
    latitude: 14.1690,
    longitude: 120.9330,
  },
  {
    id: 13,
    name: "Pedro Farms",
    location: "Silang, Cavite",
    address: "Hukay Rd, Silang, Cavite",
    specialty: "Local crop production",
    latitude: 14.2000,
    longitude: 120.9800,
  },
  {
    id: 14,
    name: "Bailen Black Pepper",
    location: "Gen. Emilio Aguinaldo, Cavite",
    address: "Brgy. Narvaez, Gen. Emilio Aguinaldo (Bailen), Cavite",
    specialty: "Traditional black pepper farming",
    latitude: 14.1512,
    longitude: 120.8103,
  },
  {
    id: 15,
    name: "Nurture Farmacy",
    location: "Tagaytay, Cavite",
    address: "Pulong Saging, Brgy. Maitim 2nd West, Tagaytay (Silang boundary)",
    specialty: "Wellness and organic farming",
    latitude: 14.1267,
    longitude: 120.9414,
  },
  {
    id: 16,
    name: "Ole Farm Well",
    location: "Padre Garcia, Batangas",
    address: "776 Purok 7, Brgy. San Miguel, Padre Garcia, Batangas",
    specialty: "Diversified farming",
    latitude: 13.8730,
    longitude: 121.1967,
  },
  {
    id: 17,
    name: "Pinagkawitan Agri-Lot",
    location: "Lipa City, Batangas",
    address: "Brgy. Pinagkawitan, Lipa City, Batangas",
    specialty: "Agricultural lot development",
    latitude: 13.8989,
    longitude: 121.1962,
  },
  {
    id: 18,
    name: "Malitlit Pepper Site",
    location: "Lipa City, Batangas",
    address: "Brgy. Malitlit, Lipa City, Batangas",
    specialty: "Pepper cultivation site",
    latitude: 13.9334,
    longitude: 121.2299,
  },
];

const RETAILERS_DATA = [
  {
    id: 101,
    name: "Joypaul Trading",
    location: "Lipa City, Batangas",
    address: "295 Brgy. Antipolo del Sur, Lipa City, Philippines, 4217",
    specialty: "Agricultural trading",
    latitude: 13.9140,
    longitude: 121.1885,
  },
  {
    id: 102,
    name: "Pepperworks Trading",
    location: "Lipa City, Batangas",
    address: "309 Zone 06 Brgy. Adya, Lipa City, Philippines, 4217",
    specialty: "Spices and pepper trading",
    latitude: 13.8764,
    longitude: 121.1387,
  },
  {
    id: 103,
    name: "Nanay's Best Herbs and Spices",
    location: "Lipa City, Batangas",
    address: "#229 Purok 4 Barangay Sampaguita, Lipa City, 4217 Batangas",
    specialty: "Herbs and spices retail",
    latitude: 13.9142,
    longitude: 121.1440,
  },
  {
    id: 104,
    name: "Amparo’s Trading",
    location: "Lipa City, Batangas",
    address: "044, Lipa City, 4217 Batangas",
    specialty: "General merchandise and trading",
    latitude: 13.9419,
    longitude: 121.1644,
  },
  {
    id: 105,
    name: "Garsion Merchandising Corp.",
    location: "Lipa City, Batangas",
    address: "192 Brgy. Sampaguita, Lipa City, 4217 Batangas",
    specialty: "Merchandising and supplies",
    latitude: 13.9150,
    longitude: 121.1450,
  },
  {
    id: 106,
    name: "Gyllmarc Spices Plant",
    location: "Lipa City, Batangas",
    address: "Purok 1, Brgy. Calamias, Lipa City, Batangas",
    specialty: "Spice processing and retail",
    latitude: 13.8726,
    longitude: 121.1510,
  },
  {
    id: 107,
    name: "LRG Pepper & Spices",
    location: "Lipa City, Batangas",
    address: "Brgy. Inosluban, Lipa City, Batangas",
    specialty: "Pepper and spices specialty store",
    latitude: 13.9888,
    longitude: 121.1710,
  },
  {
    id: 108,
    name: "Lipa City Public Market",
    location: "Lipa City, Batangas",
    address: "Lipa City Public Market, Lipa City, Batangas",
    specialty: "General public market",
    latitude: 13.9400,
    longitude: 121.1600,
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
        .map-name-tooltip.leaflet-tooltip-top:before {
            border-top-color: #D4E5DD;
        }
        .map-name-tooltip.farm-label.leaflet-tooltip {
            border-color: #9BD1A6;
        }
        .map-name-tooltip.retailer-label.leaflet-tooltip {
            border-color: #F7C37A;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            center: [13.9419, 121.1644],
            zoom: 13,
            rotate: true,
            touchRotate: true,
            rotateControl: {
                closeOnZeroBearing: false,
                position: 'topleft'
            },
            preferCanvas: true // Force canvas renderer for better performance on mobile
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

        // Keep vector layers stable across zoom/rotate.
        function ensureRouteLayerGroup() {
            if (!routeLayerGroup) {
                map.createPane('routePane');
                map.getPane('routePane').style.zIndex = 450;
                routeLayerGroup = L.layerGroup([], { pane: 'routePane' }).addTo(map);
            }
        }

        function addMarkers(data) {
            // Do not clear existing markers immediately if we want smooth updates, 
            // but for simplicity, we clear all and redraw.
            Object.values(markers).forEach(m => map.removeLayer(m));
            markers = {};

            data.forEach(item => {
                var icon = item.type === 'Farms' ? farmIcon : retailerIcon;
                var markerType = item.type === 'Farms' ? 'Farm' : 'Retailer';
                var popupContent = '<div class="marker-popup">' +
                    '<div class="marker-popup-type">' + (item.type === 'Farms' ? 'Farm Location' : 'Retailer Location') + '</div>' +
                    '<div class="marker-popup-name-row"><span>-></span><span>' + item.name + '</span></div>' +
                    '<div class="marker-popup-location">Location: ' + (item.location || item.address || 'Location') + '</div>' +
                    '<div class="marker-popup-location" style="margin-top:4px;">' + markerType + ' Name: ' + item.name + '</div>' +
                    '</div>';

                var marker = L.marker([item.latitude, item.longitude], {icon: icon})
                    .addTo(map)
                    .bindPopup(popupContent)
                    .bindTooltip('-> ' + markerType + ': ' + item.name, {
                        permanent: true,
                        direction: 'top',
                        offset: [0, -26],
                        opacity: 0.95,
                        className: 'map-name-tooltip ' + (item.type === 'Farms' ? 'farm-label' : 'retailer-label')
                    });
                
                marker.on('click', function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerClick',
                        id: item.id,
                        itemType: item.type
                    }));
                });
                
                markers[item.id] = marker;
            });
        }

        function updateUserLocation(lat, lng) {
            if (userMarker) {
                userMarker.setLatLng([lat, lng]);
            } else {
                userMarker = L.marker([lat, lng], {icon: userIcon}).addTo(map);
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
                // Use smoothFactor to optimize rendering performance during zoom/pan
                routeLayer = L.polyline(latLngs, {
                    color: 'blue',
                    weight: 5,
                    opacity: 0.75,
                    smoothFactor: 2.5, // Slightly more detail while staying smooth
                    renderer: L.canvas(),
                    pane: 'routePane'
                }).addTo(routeLayerGroup);
                routeLayer.bringToFront();
                map.fitBounds(routeLayer.getBounds(), {padding: [50, 50]});
            }
        }

        function setClickMarker(lat, lng) {
            if (clickMarker) {
                map.removeLayer(clickMarker);
            }
            clickMarker = L.marker([lat, lng], {icon: clickIcon}).addTo(map);
        }

        function clearClickMarker() {
            if (clickMarker) {
                map.removeLayer(clickMarker);
                clickMarker = null;
            }
        }

        map.on('click', function(e) {
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            
            // Only place marker on map click if no search is active (handled in React logic)
            // But we send the event first
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                latitude: lat,
                longitude: lng
            }));
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
                var msg = JSON.parse(data);
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

export default function MacromappingScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // For weather focus
  const [showResults, setShowResults] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Selected Item State (Farm/Retailer)
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Weather State (Integrated from WeatherScreen)
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [suitabilityData, setSuitabilityData] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState('Farms'); // 'Farms' or 'Retailers'
  
  // Side Panel State
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const sidePanelAnim = useRef(new Animated.Value(-SIDE_PANEL_WIDTH)).current;

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  // Saved Locations State
  const [savedLocations, setSavedLocations] = useState([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const savedPanelAnim = useRef(new Animated.Value(300)).current;
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Double-click prevention
  const lastClickTimes = useRef({});
  const searchDebounceTimer = useRef(null);
  const suppressMapTapUntil = useRef(0);

  const webViewRef = useRef(null);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;
  
  // Bottom Sheet Animation
  const sheetY = useRef(new Animated.Value(height - BOTTOM_SHEET_MIN_HEIGHT)).current;
  const lastSheetY = useRef(height - BOTTOM_SHEET_MIN_HEIGHT);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        sheetY.setOffset(lastSheetY.current);
        sheetY.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dy: sheetY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        sheetY.flattenOffset();
        let target = 0;
        
        if (gestureState.vy < -0.5 || (gestureState.dy < -100 && lastSheetY.current > height - BOTTOM_SHEET_SNAP_POINT)) {
          target = height - BOTTOM_SHEET_MAX_HEIGHT;
        } else if (gestureState.vy > 0.5 || (gestureState.dy > 100 && lastSheetY.current < height - BOTTOM_SHEET_SNAP_POINT)) {
          target = height - BOTTOM_SHEET_MIN_HEIGHT;
        } else {
          const currentY = lastSheetY.current + gestureState.dy;
          const distToTop = Math.abs(currentY - (height - BOTTOM_SHEET_MAX_HEIGHT));
          const distToMid = Math.abs(currentY - (height - BOTTOM_SHEET_SNAP_POINT));
          const distToBottom = Math.abs(currentY - (height - BOTTOM_SHEET_MIN_HEIGHT));
          
          if (distToTop < distToMid && distToTop < distToBottom) {
            target = height - BOTTOM_SHEET_MAX_HEIGHT;
          } else if (distToMid < distToBottom) {
            target = height - BOTTOM_SHEET_SNAP_POINT;
          } else {
            target = height - BOTTOM_SHEET_MIN_HEIGHT;
          }
        }
        
        Animated.spring(sheetY, {
          toValue: target,
          useNativeDriver: false,
          bounciness: 4,
        }).start(() => {
          lastSheetY.current = target;
        });
      },
    })
  ).current;



  useEffect(() => {
    initializeMap();
  }, []);

  const sendMarkersToMap = () => {
    if (webViewRef.current) {
      // Combine data and add type
      const combinedData = [
        ...FARMS_DATA.map(i => ({ ...i, type: 'Farms' })),
        ...RETAILERS_DATA.map(i => ({ ...i, type: 'Retailers' }))
      ];
      
      webViewRef.current.postMessage(JSON.stringify({
        type: 'addMarkers',
        data: combinedData
      }));
    }
  };

  useEffect(() => {
    // Send initial markers to WebView when it loads
    if (webViewRef.current) {
      setTimeout(() => {
        sendMarkersToMap();
      }, 1000);
    }
  }, []); // Run once on mount

  useEffect(() => {
    // Fetch saved locations on mount
    fetchSavedLocations();
  }, []);

  useEffect(() => {
    // Center map on user location when location is obtained
    if (userLocation && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'focusLocation',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }));
    }
  }, [userLocation]);

  useEffect(() => {
    // Auto-focus on activity location if passed via route params (from RecentActivities)
    if (navigation.getState().routes[navigation.getState().index].params?.latitude) {
      const { latitude, longitude, locationName } = navigation.getState().routes[navigation.getState().index].params;
      if (webViewRef.current) {
        setTimeout(() => {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'focusLocation',
            latitude: latitude,
            longitude: longitude
          }));
          console.log(`📍 Focused on ${locationName}`);
        }, 500);
      }
    }
  }, [navigation]);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const suppressMapTap = (duration = 800) => {
    suppressMapTapUntil.current = Date.now() + duration;
  };

  // Side Panel Animations
  const toggleSidePanel = () => {
    suppressMapTap(1000);
    const toValue = sidePanelOpen ? -SIDE_PANEL_WIDTH : 0;
    Animated.timing(sidePanelAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSidePanelOpen(!sidePanelOpen));
  };

  const fetchLocationWeather = async (latitude, longitude, locationName, locationContext = {}) => {
    try {
      setLoadingWeather(true);
      const data = await getWeatherData(latitude, longitude);
      const elevationResults = await getElevation([{ latitude, longitude }]);
      const elevation = elevationResults?.[0]?.elevation ?? 100;
      const scoreResult = calculateSuitabilityScore(data, elevation, data.rainProbability, locationContext);
      const suitability = getSuitabilityRating(scoreResult.score);
      const detailedRecommendations = getDetailedRecommendations(data, elevation, data.rainProbability);

      setWeatherData({
        locationName,
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

  const fetchRoute = async (fromLat, fromLng, toLat, toLng) => {
    try {
      // Use 'simplified' overview to reduce the number of points and improve rendering speed
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=simplified&geometries=geojson`;
      const response = await axios.get(url);
      
      if (response.data.routes && response.data.routes.length > 0) {
        const coordinates = response.data.routes[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'drawRoute',
            coordinates: coordinates
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleMapClick = async (latitude, longitude) => {
      const now = Date.now();
      if (lastClickTimes.current.mapClick && now - lastClickTimes.current.mapClick < 500) return;
      lastClickTimes.current.mapClick = now;
      
      // Get actual address via reverse geocoding
      let addressName = "Clicked Location";
      let fullAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          addressName = `${place.city || place.subregion || 'Location'}, ${place.region || place.country || ''}`.trim();
          // Construct full address
          fullAddress = [
            place.street,
            place.city,
            place.subregion,
            place.region,
            place.country
          ].filter(Boolean).join(', ');
        }
      } catch (error) {
        console.log("Reverse geocoding failed, using coordinates");
      }

      // Create temporary location object from map click
      const clickedLocation = {
        id: Math.random(),
        name: addressName,
        latitude,
        longitude,
        address: fullAddress,
        location: addressName,
        specialty: 'Custom Location'
      };

      // Show confirmation dialog
      Alert.alert(
        'Proceed to location?',
        `Navigate to ${addressName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            onPress: () => {
              if (userLocation) {
                fetchRoute(userLocation.latitude, userLocation.longitude, latitude, longitude);
              }
              
              setSelectedItem(clickedLocation);
              fetchLocationWeather(latitude, longitude, addressName, clickedLocation);
              expandBottomSheet();
              
              // Ask to save after delay
              setTimeout(() => {
                Alert.alert(
                  'Save location?',
                  `Save this location to your favorites?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save', onPress: () => saveLocation(clickedLocation) }
                  ]
                );
              }, 500);
            }
          }
        ]
      );
  };

  const expandBottomSheet = () => {
      Animated.spring(sheetY, {
        toValue: height - BOTTOM_SHEET_SNAP_POINT,
        useNativeDriver: false,
      }).start(() => {
        lastSheetY.current = height - BOTTOM_SHEET_SNAP_POINT;
      });
  };

  const collapseBottomSheet = () => {
    Animated.spring(sheetY, {
      toValue: height - BOTTOM_SHEET_MIN_HEIGHT,
      useNativeDriver: false,
    }).start(() => {
      lastSheetY.current = height - BOTTOM_SHEET_MIN_HEIGHT;
    });
  };

  const clearSelectedPlace = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsNavigating(false);
    setSelectedItem(null);
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'drawRoute',
        coordinates: []
      }));
      webViewRef.current.postMessage(JSON.stringify({
        type: 'clearClickMarker'
      }));
    }
    collapseBottomSheet();
  };

  const handleItemPress = (item, type = null) => {
    const now = Date.now();
    if (lastClickTimes.current.itemPress && now - lastClickTimes.current.itemPress < 500) return;
    lastClickTimes.current.itemPress = now;
    
    const isSaved = isLocationSaved(item.id);
    
    // First confirmation dialog
    Alert.alert(
      'Proceed to location?',
      `Navigate to ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            // Show location with weather and route
            showLocationDetails(item, type);
            
            // Ask to save/unsave after 500ms
            setTimeout(() => {
              if (isSaved) {
                const savedId = getSavedLocationId(item.id);
                Alert.alert(
                  'Already Saved',
                  `${item.name} is in your favorites`,
                  [
                    { text: 'Keep', style: 'cancel' },
                    { text: 'Remove from Favorites', style: 'destructive', onPress: () => unsaveLocation(savedId) }
                  ]
                );
              } else {
                Alert.alert(
                  'Save location?',
                  `Save ${item.name} to your favorites?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save', onPress: () => saveLocation(item) }
                  ]
                );
              }
            }, 500);
          }
        }
      ]
    );
  };

  const showLocationDetails = (item, type = null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (type && type !== activeCategory) {
      setActiveCategory(type);
    }

    setSelectedItem(type ? { ...item, type } : item);
    fetchLocationWeather(item.latitude, item.longitude, item.name, {
      ...item,
      kind: (type || activeCategory) === 'Farms' ? 'farm' : 'retailer',
    });
    
    if (sidePanelOpen) {
        toggleSidePanel();
    }

    expandBottomSheet();

    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'focusLocation',
        latitude: item.latitude,
        longitude: item.longitude
      }));
    }

    if (userLocation) {
      fetchRoute(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
    }
  };

  const fetchSavedLocations = async () => {
    try {
      setLoadingSaved(true);
      const token = await getToken();
      if (!token) {
        console.log('No token, skipping saved locations fetch');
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/macromapping/saved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.savedLocations) {
        setSavedLocations(response.data.savedLocations);
      }
    } catch (error) {
      console.error('Error fetching saved locations:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const saveLocation = async (item) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Please login to save locations');
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/macromapping/save`,
        {
          farmId: item.id,
          farmName: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          address: item.address,
          location: item.location,
          specialty: item.specialty
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', `${item.name} saved to favorites!`);
        fetchSavedLocations(); // Refresh list
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      if (errorMsg === 'This location is already saved') {
        Alert.alert('Already Saved', 'This location is already in your favorites');
      } else {
        Alert.alert('Error', `Failed to save: ${errorMsg}`);
      }
      console.error('❌ Save error:', error.response?.data || error.message);
    }
  };

  const unsaveLocation = async (locationId) => {
    try {
      const token = await getToken();
      const response = await axios.delete(
        `${BACKEND_URL}/api/v1/macromapping/saved/${locationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Removed', 'Location removed from favorites');
        fetchSavedLocations(); // Refresh list
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove location');
      console.error('Unsave error:', error);
    }
  };

  const isLocationSaved = (itemId) => {
    return savedLocations.some(loc => loc.farm.id === itemId);
  };

  const getSavedLocationId = (itemId) => {
    const saved = savedLocations.find(loc => loc.farm.id === itemId);
    return saved?._id;
  };

  const toggleSavedPanel = () => {
    suppressMapTap(1000);
    const toValue = showSavedPanel ? 300 : 0; // 300 = header only (collapsed), 0 = full panel (expanded)
    Animated.timing(savedPanelAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false
    }).start(() => setShowSavedPanel(!showSavedPanel));
  };

  const handleLocationClick = (item) => {
    const farm = item.farm;
    Alert.alert(
      'Go to location?',
      `Navigate to ${farm.name}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Navigate',
          onPress: () => {
            // Ensure userLocation is available before routing
            if (!userLocation) {
              Alert.alert('Location Required', 'Unable to calculate route. Please enable location services.');
              return;
            }

            // Set selected item
            setSelectedItem(farm);
            
            // Fetch weather for the location
            fetchLocationWeather(farm.latitude, farm.longitude, farm.name, {
              ...farm,
              kind: 'farm',
            });
            
            // Fetch and draw route
            fetchRoute(userLocation.latitude, userLocation.longitude, farm.latitude, farm.longitude);
            
            // Focus map on location
            if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'focusLocation',
                latitude: farm.latitude,
                longitude: farm.longitude
              }));
            }
            
            // Expand bottom sheet
            expandBottomSheet();
            
            // Close saved panel
            setShowSavedPanel(false);
            
            // Hide floating button
            const toValue = 300; // collapsed state
            Animated.timing(savedPanelAnim, {
              toValue,
              duration: 300,
              useNativeDriver: false
            }).start();
          }
        }
      ]
    );
  };

  const cancelNavigation = () => {
    const now = Date.now();
    if (lastClickTimes.current.cancel && now - lastClickTimes.current.cancel < 500) return;
    lastClickTimes.current.cancel = now;
    
    clearSelectedPlace();
  };

  const startNavigation = () => {
    const now = Date.now();
    if (lastClickTimes.current.proceed && now - lastClickTimes.current.proceed < 500) return;
    lastClickTimes.current.proceed = now;
    
    setIsNavigating(true);
    Alert.alert('Navigation Started', `Navigate to ${selectedItem.name}. Follow the route on the map.`);
  };

  const handleCategoryChange = (category) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCategory(category);
    // Do NOT clear selectedItem here, just switch list view
  };

  const initializeMap = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setUserLocation(DEFAULT_LOCATION);
        setLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      
      setUserLocation({ latitude, longitude });

      // Reverse Geocoding to get address name
      let addressName = "My Location";
      try {
          const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (reverseGeocode.length > 0) {
              const place = reverseGeocode[0];
              addressName = `${place.city || place.subregion}, ${place.region}`;
          }
      } catch (geoError) {
          console.log("Reverse geocode error:", geoError);
      }
      
      // Initial Weather Fetch for User Location
      fetchLocationWeather(latitude, longitude, addressName);
      
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateUserLocation',
          latitude,
          longitude
        }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to default location silently if real location fails
      setUserLocation(DEFAULT_LOCATION);
      fetchLocationWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, "Lipa City");
      
      if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
              type: 'updateUserLocation',
              latitude: DEFAULT_LOCATION.latitude,
              longitude: DEFAULT_LOCATION.longitude
          }));
          // Focus map on default location so it's not empty
          webViewRef.current.postMessage(JSON.stringify({
              type: 'focusLocation',
              latitude: DEFAULT_LOCATION.latitude,
              longitude: DEFAULT_LOCATION.longitude
          }));
      }
      setLoading(false);
    }
  };

  // Search Functionality with Debounce
  const handleSearch = async (text) => {
    suppressMapTap(900);
    setSearchQuery(text);
    
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    
    if (text.length < 2) {
        setSearchResults([]);
        return;
    }

    searchDebounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      
      // 1. Local Search (Farms & Retailers)
      const localResults = [
        ...FARMS_DATA.map(f => ({ ...f, type: 'Farms', source: 'local', unique_id: `local_farms_${f.id}` })),
        ...RETAILERS_DATA.map(r => ({ ...r, type: 'Retailers', source: 'local', unique_id: `local_retailers_${r.id}` }))
    ].filter(item => item.name.toLowerCase().includes(text.toLowerCase()));

    try {
        // 2. Online Search (Photon API by Komoot - Free & No Key)
        // More lenient than Nominatim regarding headers/usage
        const response = await axios.get(`https://photon.komoot.io/api/?q=${text}&limit=5`);
        
        // Photon returns GeoJSON
        const onlineResults = response.data.features.map((feature, index) => ({
            id: feature.properties.osm_id || Math.random(),
            unique_id: `online_${index}_${feature.properties.osm_id || Math.random()}`,
            name: feature.properties.name || feature.properties.city || 'Unknown Place',
            address: [
                feature.properties.street,
                feature.properties.city,
                feature.properties.state,
                feature.properties.country
            ].filter(Boolean).join(', '),
            location: `${feature.properties.city || feature.properties.state || 'Location'}, ${feature.properties.country || 'Philippines'}`,
            specialty: 'Online location',
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            type: 'Location',
            source: 'online'
        }));

        setSearchResults([...localResults, ...onlineResults]);
    } catch (error) {
        console.error("Search error:", error);
        setSearchResults(localResults); // Fallback to local only
      } finally {
          setIsSearching(false);
      }
    }, 300); // 300ms debounce
  };

  const handleSelectSearchResult = (item) => {
      suppressMapTap(900);
      const now = Date.now();
      if (lastClickTimes.current.searchSelect && now - lastClickTimes.current.searchSelect < 500) return;
      lastClickTimes.current.searchSelect = now;
      
      Keyboard.dismiss();
      setSearchQuery(item.name);
      setSearchResults([]);
      setSearchActive(false);
      
      // Clear route when closing search
      if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
              type: 'drawRoute',
              coordinates: []
          }));
      }

      // Focus on map
      if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
              type: 'focusLocation',
              latitude: item.latitude,
              longitude: item.longitude
          }));
          
          // Place Red Marker (Destination) at the searched location
          webViewRef.current.postMessage(JSON.stringify({
              type: 'setClickMarker',
              latitude: item.latitude,
              longitude: item.longitude
          }));
      }

      // If it's a local item, open details
      if (item.source === 'local') {
          handleItemPress(item, item.type);
      } else {
          // If it's online result, show confirmation before routing
          Alert.alert(
              'Proceed to location?',
              `Navigate to ${item.name}?`,
              [
                  { text: 'Cancel', style: 'cancel' },
                  {
                      text: 'Proceed',
                      onPress: () => {
                          // Only fetch route if user confirms
                          if (userLocation) {
                              fetchRoute(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
                          }
                          // Fetch weather for this new location
                          fetchLocationWeather(item.latitude, item.longitude, item.name, {
                            ...item,
                            kind: msg.itemType === 'Farms' ? 'farm' : 'retailer',
                          });
                          setSelectedItem(item); // Use full item so save works with all required fields
                          expandBottomSheet();
                      }
                  }
              ]
          );
      }
  };

  const isUIActive = () => {
    return searchActive || sidePanelOpen || showSavedPanel || isNavigating || (lastSheetY.current !== height - BOTTOM_SHEET_MIN_HEIGHT);
  };

  const onWebViewMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === 'markerClick') {
        const list = msg.itemType === 'Farms' ? FARMS_DATA : RETAILERS_DATA;
        const item = list.find(i => i.id === msg.id);
        if (item) {
          handleItemPress(item, msg.itemType);
        }
      } else if (msg.type === 'mapClick') {
          if (Date.now() < suppressMapTapUntil.current) return;
          // Only process map click if UI is NOT active
          if (!isUIActive()) {
              handleMapClick(msg.latitude, msg.longitude);
              // Tell WebView to place the marker visually
              if (webViewRef.current) {
                  webViewRef.current.postMessage(JSON.stringify({
                      type: 'setClickMarker',
                      latitude: msg.latitude,
                      longitude: msg.longitude
                  }));
              }
          }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getWeatherIcon = (code) => {
    if (!code) return 'cloud';
    if (code <= 3) return 'weather-sunny'; // Clear
    if (code === 45 || code === 48) return 'weather-fog'; // Fog
    if (code >= 51 && code <= 67) return 'weather-rainy'; // Rain
    if (code >= 71 && code <= 77) return 'weather-snowy'; // Snow
    if (code >= 80 && code <= 82) return 'weather-rainy'; // Showers
    if (code >= 95 && code <= 99) return 'weather-lightning'; // Thunderstorm
    return 'cloud';
  };

  const getRecommendationAccent = (type) => {
    if (type === 'danger') return '#E74C3C';
    if (type === 'warning') return '#F39C12';
    if (type === 'info') return '#2D8CFF';
    return '#27AE60';
  };

  const getRecommendationIcon = (type) => {
    if (type === 'danger') return 'alert-octagon';
    if (type === 'warning') return 'alert-triangle';
    if (type === 'info') return 'info';
    return 'check-circle';
  };

  const getCurrentPhilippineHourLabel = () => {
    const hourParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date());

    const hourValue = hourParts.find((part) => part.type === 'hour')?.value ?? '0';
    return `${Number(hourValue)}:00`;
  };

  const directoryItems = activeCategory === 'Farms' ? FARMS_DATA : RETAILERS_DATA;
  const isFarmCategory = activeCategory === 'Farms';
  const currentPhilippineHourLabel = getCurrentPhilippineHourLabel();
  const hourlyScrollRef = useRef(null);
  const [hourlyViewportWidth, setHourlyViewportWidth] = useState(width);
  const hourlyEdgePadding = Math.max((hourlyViewportWidth - HOURLY_CARD_WIDTH) / 2, 0);

  useEffect(() => {
    if (!weatherData?.hourly?.length || !hourlyScrollRef.current || !hourlyViewportWidth) {
      return;
    }

    const currentHourIndex = weatherData.hourly.findIndex(
      (hour) => hour.time === currentPhilippineHourLabel
    );

    if (currentHourIndex < 0) {
      return;
    }

    requestAnimationFrame(() => {
      hourlyScrollRef.current?.scrollTo({
        x: currentHourIndex * (HOURLY_CARD_WIDTH + HOURLY_CARD_GAP),
        animated: true,
      });
    });
  }, [weatherData?.hourly, currentPhilippineHourLabel, hourlyViewportWidth]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView pointerEvents="box-none" style={styles.headerOverlay} onTouchStart={() => suppressMapTap(900)}>
        <MobileHeader
          navigation={navigation}
          drawerOpen={drawerOpen}
          openDrawer={openDrawer}
          closeDrawer={closeDrawer}
          drawerSlideAnim={drawerSlideAnim}
          user={user}
          onLogout={() => logout(navigation)}
        />
        
        {/* Search Toggle Button */}
        {!searchActive && (
          <TouchableOpacity 
              style={[styles.searchToggleButton, { top: CONTROL_TOP_OFFSET }]}
              onPressIn={() => suppressMapTap(900)}
              onPress={() => setSearchActive(true)}
          >
              <Feather name="search" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Search Bar - Shown When Active */}
        {searchActive && (
          <View style={[styles.searchContainer, { top: CONTROL_TOP_OFFSET }]} onTouchStart={() => suppressMapTap(900)}>
              <View style={styles.searchBar}>
                  <Feather name="search" size={20} color={colors.textLight} />
                  <TextInput
                      style={styles.searchInput}
                      placeholder="Search farms, retailers, or places..."
                      value={searchQuery}
                      onChangeText={handleSearch}
                      placeholderTextColor={colors.textLight}
                      autoFocus={true}
                      onFocus={() => suppressMapTap(900)}
                  />
                  <TouchableOpacity
                    onPressIn={() => suppressMapTap(900)}
                    onPress={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchActive(false);
                      Keyboard.dismiss();
                      // Clear route when closing search
                      if (webViewRef.current) {
                          webViewRef.current.postMessage(JSON.stringify({
                              type: 'drawRoute',
                              coordinates: []
                          }));
                      }
                    }}
                  >
                      <Feather name="x" size={20} color={colors.textLight} />
                  </TouchableOpacity>
              </View>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                  <View style={styles.searchResultsList}>
                      <FlatList
                          data={searchResults}
                          keyExtractor={(item) => item.unique_id}
                          keyboardShouldPersistTaps="handled"
                          renderItem={({ item }) => (
                              <TouchableOpacity 
                                  style={styles.searchResultItem}
                                  onPressIn={() => suppressMapTap(900)}
                                  onPress={() => handleSelectSearchResult(item)}
                              >
                                  <View style={[styles.resultIcon, { backgroundColor: item.type === 'Farms' ? colors.primary : (item.type === 'Retailers' ? colors.warning : (item.type === 'Location' ? '#666' : '#999')) }]}>
                                      <Feather name={item.source === 'local' ? 'map-pin' : 'globe'} size={14} color="#FFF" />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                      <Text style={styles.resultTitle}>{item.name}</Text>
                                      <Text style={styles.resultSubtitle} numberOfLines={2}>{item.address || 'Location'}</Text>
                                      {item.type && item.type !== 'Location' && (
                                          <Text style={styles.resultType}>{item.type}</Text>
                                      )}
                                  </View>
                              </TouchableOpacity>
                          )}
                          style={{ maxHeight: 200 }}
                      />
                  </View>
              )}
          </View>
        )}

        {/* Toggle List Button (Right Side, Same Level as Search) - Hidden when search active */}
        {!searchActive && (
          <TouchableOpacity 
              pointerEvents="auto"
              style={[styles.toggleListButton, { top: CONTROL_TOP_OFFSET }]}
              onPressIn={() => suppressMapTap(900)}
              onPress={toggleSidePanel}
          >
              <Feather name={sidePanelOpen ? "chevrons-left" : "list"} size={20} color={colors.white} />
              <Text style={styles.toggleListText}>{sidePanelOpen ? "Hide List" : "Show List"}</Text>
          </TouchableOpacity>
        )}

        {/* Selected Location Card */}
        {selectedItem && (
            <View style={[styles.selectedLocationCard, { top: SELECTED_CARD_TOP_OFFSET }]}>
                <View style={[styles.selectedLocationIcon, { backgroundColor: selectedItem.type === 'Farms' ? colors.primary : colors.warning }]}>
                    <Feather name="map-pin" size={18} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.selectedLocationName}>{selectedItem.name}</Text>
                    <Text style={styles.selectedLocationAddress} numberOfLines={1}>{selectedItem.address || selectedItem.location || 'Location'}</Text>
                </View>
                <TouchableOpacity style={styles.selectedLocationClose} onPress={clearSelectedPlace}>
                    <Feather name="x" size={18} color={colors.text} />
                </TouchableOpacity>
            </View>
        )}

        {/* Legend Overlay */}
        <View style={[styles.legendContainer, selectedItem && { bottom: 250 }]}>
            <Text style={styles.legendTitle}>Map Legend</Text>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
                <Text style={styles.legendText}>Farms</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'orange' }]} />
                <Text style={styles.legendText}>Retailers</Text>
            </View>
             <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'blue' }]} />
                <Text style={styles.legendText}>You</Text>
            </View>
             <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
                <Text style={styles.legendText}>Destination</Text>
            </View>
        </View>
      </SafeAreaView>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: MAP_HTML }}
          style={styles.map}
          onMessage={onWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoadEnd={() => {
            if (userLocation && webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'updateUserLocation',
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
              }));
              sendMarkersToMap();
            }
          }}
        />
      </View>

      {/* Side Panel for List */}
      <Animated.View style={[styles.sidePanel, { transform: [{ translateX: sidePanelAnim }] }]} onTouchStart={() => suppressMapTap(1000)}>
          <View style={styles.sidePanelHeader}>
              <View style={styles.sidePanelHeaderMain}>
                <Text style={styles.sidePanelTitle}>Directory</Text>
                <Text style={styles.sidePanelSubtitle}>Farms and retailers around you</Text>
              </View>
              <View style={styles.sidePanelHeaderActions}>
                <View style={[
                  styles.sidePanelCountBadge,
                  { backgroundColor: isFarmCategory ? '#E8F5E9' : '#FFF5E8' },
                ]}>
                  <Text style={[
                    styles.sidePanelCountText,
                    { color: isFarmCategory ? colors.primary : '#C97A00' },
                  ]}>
                    {directoryItems.length}
                  </Text>
                </View>
                <TouchableOpacity onPressIn={() => suppressMapTap(900)} onPress={toggleSidePanel}>
                    <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
          </View>
          
          <View style={styles.sidePanelToggle}>
            <TouchableOpacity
              style={[
                styles.panelToggleButton,
                { backgroundColor: activeCategory === 'Farms' ? colors.primary : '#EAF0EC' }
              ]}
              onPressIn={() => suppressMapTap(900)}
              onPress={() => handleCategoryChange('Farms')}
            >
              <Text style={[
                styles.panelToggleText,
                { color: activeCategory === 'Farms' ? '#FFFFFF' : colors.textLight }
              ]}>
                Farms
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.panelToggleButton,
                { backgroundColor: activeCategory === 'Retailers' ? colors.warning : '#EAF0EC' }
              ]}
              onPressIn={() => suppressMapTap(900)}
              onPress={() => handleCategoryChange('Retailers')}
            >
              <Text style={[
                styles.panelToggleText,
                { color: activeCategory === 'Retailers' ? '#FFFFFF' : colors.textLight }
              ]}>
                Retailers
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.sidePanelList}
            contentContainerStyle={styles.sidePanelListContent}
            showsVerticalScrollIndicator={false}
          >
            {directoryItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sidePanelItem,
                  {
                    borderColor: isFarmCategory ? '#D3E6DA' : '#FFDDB1',
                  },
                ]}
                onPressIn={() => suppressMapTap(900)}
                onPress={() => handleItemPress({ ...item, type: activeCategory }, activeCategory)}
                activeOpacity={0.9}
              >
                <View style={styles.sidePanelItemTop}>
                  <View style={[
                    styles.sidePanelItemIconWrap,
                    { backgroundColor: isFarmCategory ? '#E8F5E9' : '#FFF4E5' },
                  ]}>
                    <MaterialCommunityIcons
                      name={isFarmCategory ? 'sprout-outline' : 'store-outline'}
                      size={18}
                      color={isFarmCategory ? colors.primary : '#C97A00'}
                    />
                  </View>

                  <View style={styles.sidePanelItemMain}>
                    <Text style={styles.sidePanelItemName} numberOfLines={1}>{item.name}</Text>

                    <View style={styles.sidePanelItemRow}>
                      <MaterialCommunityIcons
                        name="navigation-variant-outline"
                        size={14}
                        color={isFarmCategory ? colors.primary : '#C97A00'}
                      />
                      <Text style={styles.sidePanelItemArrowText} numberOfLines={1}>
                        {isFarmCategory ? 'Farm' : 'Retailer'}: {item.name}
                      </Text>
                    </View>

                    <View style={styles.sidePanelItemRow}>
                      <Feather name="map-pin" size={13} color={colors.textLight} />
                      <Text style={styles.sidePanelItemLocation} numberOfLines={1}>{item.location}</Text>
                    </View>
                  </View>

                  <Feather name="chevron-right" size={18} color={colors.textLight} />
                </View>

                <Text style={styles.sidePanelItemAddress} numberOfLines={1}>
                  {item.address || 'No address available'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
      </Animated.View>

      {/* Weather & Details Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { 
            top: sheetY,
            height: height
          }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView style={styles.sheetContent}>
            {/* Header: Selected Place or Weather Location */}
            <View style={styles.weatherHeader}>
                <View style={styles.headerTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.weatherLocationName}>
                        {selectedItem ? selectedItem.name : (weatherData?.locationName || "Weather Details")}
                    </Text>
                    {selectedItem && (
                        <Text style={styles.weatherLocationSub}>
                            {selectedItem.address}
                        </Text>
                    )}
                    {userLocation && (selectedItem || weatherData) && (
                        <Text style={[styles.distanceText, {color: colors.success, marginTop: 4}]}>
                            📏 {calculateDistance(
                                userLocation.latitude, 
                                userLocation.longitude, 
                                selectedItem?.latitude || weatherData?.latitude, 
                                selectedItem?.longitude || weatherData?.longitude
                            )} km away
                        </Text>
                    )}
                  </View>
                  {selectedItem && (
                    <TouchableOpacity 
                      onPress={clearSelectedPlace}
                      style={styles.cancelButton}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>
                {selectedItem && (
                  <View style={styles.actionButtons}>
                    {!isNavigating ? (
                      <>
                        {isLocationSaved(selectedItem.id) ? (
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.saveBtnStyle]}
                            onPress={() => unsaveLocation(getSavedLocationId(selectedItem.id))}
                          >
                            <MaterialCommunityIcons name="delete" size={18} color="#FFF" />
                            <Text style={styles.actionBtnText}>Remove</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.saveBtnStyle]}
                            onPress={() => saveLocation(selectedItem)}
                          >
                            <MaterialCommunityIcons name="heart" size={18} color="#FFF" />
                            <Text style={styles.actionBtnText}>Save</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.directionBtnStyle]}
                          onPress={() => startNavigation()}
                        >
                          <MaterialCommunityIcons name="navigation" size={18} color="#FFF" />
                          <Text style={styles.actionBtnText}>Navigate</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#E74C3C', flex: 1 }]}
                        onPress={() => cancelNavigation()}
                      >
                        <MaterialCommunityIcons name="close" size={18} color="#FFF" />
                        <Text style={styles.actionBtnText}>Cancel Navigation</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
            </View>

            {loadingWeather ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : weatherData ? (
                <>
                    {/* Current Weather Card (Compact) */}
                    <LinearGradient
                      colors={['#123A2D', '#1B4D3E', '#2E6B57']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.currentWeatherCard}
                    >
                      <View style={styles.weatherAtmosphereOrbOne} />
                      <View style={styles.weatherAtmosphereOrbTwo} />
                      <View style={styles.weatherTop}>
                        <View style={styles.weatherIconWrap}>
                          <MaterialCommunityIcons
                            name={getWeatherIcon(weatherData.weatherCode)}
                            size={50}
                            color="#FFFFFF"
                            style={styles.weatherIcon}
                          />
                        </View>
                        <View style={styles.tempSection}>
                          <Text style={styles.weatherNowLabel}>Current Weather</Text>
                          <Text style={styles.currentTemp}>{weatherData.temp}°C</Text>
                          <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
                        </View>
                        <View style={styles.tempRange}>
                            <Text style={styles.tempRangeText}>H: {weatherData.maxTemp}°</Text>
                            <Text style={styles.tempRangeText}>L: {weatherData.minTemp}°</Text>
                        </View>
                      </View>
                      <View style={styles.weatherFooterRow}>
                        <View style={styles.weatherFooterChip}>
                          <MaterialCommunityIcons name="map-marker-radius" size={13} color="#D6F5E0" />
                          <Text style={styles.weatherFooterChipText}>{selectedItem ? 'Selected Site' : 'Current Area'}</Text>
                        </View>
                        <View style={styles.weatherFooterChip}>
                          <MaterialCommunityIcons name="leaf" size={13} color="#D6F5E0" />
                          <Text style={styles.weatherFooterChipText}>Pepper analysis active</Text>
                        </View>
                      </View>
                    </LinearGradient>

                    {/* Weather Grid */}
                    <View style={styles.detailsGrid}>
                        <View style={[styles.detailCard, styles.detailHumidity]}>
                            <MaterialCommunityIcons name="water-percent" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
                            <Text style={styles.detailLabel}>Humidity</Text>
                        </View>
                        <View style={[styles.detailCard, styles.detailWind]}>
                            <MaterialCommunityIcons name="weather-windy" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.windSpeed} km/h</Text>
                            <Text style={styles.detailLabel}>Wind</Text>
                        </View>
                        <View style={[styles.detailCard, styles.detailRain]}>
                            <MaterialCommunityIcons name="cloud-percent" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.rainProbability}%</Text>
                            <Text style={styles.detailLabel}>Rain Chance</Text>
                        </View>
                        <View style={[styles.detailCard, styles.detailSoil]}>
                            <MaterialCommunityIcons name="water-opacity" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.soilMoisture.toFixed(1)}%</Text>
                            <Text style={styles.detailLabel}>Soil</Text>
                        </View>
                    </View>

                    {/* Black Pepper Suitability Section */}
                    {selectedItem && suitabilityData && (
                      <View style={styles.tipsSection}>
                        <View style={styles.sectionHeadingRow}>
                          <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>🌿 Black Pepper Suitability</Text>
                            <Text style={styles.sectionSubtitle}>Field-readiness snapshot for this selected site</Text>
                          </View>
                        </View>
                        <View style={[styles.suitabilityHeroCard, { borderLeftColor: suitabilityData.color }]}>
                          <View style={styles.suitabilityHeroTop}>
                            <View>
                              <Text style={styles.suitabilityHeroLabel}>Suitability Score</Text>
                              <Text style={styles.suitabilityHeroScore}>{suitabilityData.score}/100</Text>
                            </View>
                            <View style={[styles.suitabilityBadge, { backgroundColor: suitabilityData.color }]}>
                              <Text style={styles.suitabilityBadgeText}>{suitabilityData.rating}</Text>
                            </View>
                          </View>
                          <Text style={styles.suitabilityHeroText}>{suitabilityData.description}</Text>
                          <Text style={styles.suitabilityMeta}>Elevation: {Math.round(suitabilityData.elevation)} m above sea level</Text>
                          <Text style={styles.suitabilityMeta}>
                            Base score: {suitabilityData.baseScore}/100
                            {suitabilityData.bonusScore > 0 ? `  |  Site bonus: +${suitabilityData.bonusScore}` : ''}
                          </Text>
                          {suitabilityData.bonusReasons?.length > 0 && (
                            <Text style={styles.suitabilityMeta}>
                              Bonus basis: {suitabilityData.bonusReasons.join(', ')}
                            </Text>
                          )}
                          <View style={styles.suitabilityStatsRow}>
                            <View style={styles.suitabilityStatChip}>
                              <MaterialCommunityIcons name="thermometer" size={14} color={colors.primary} />
                              <Text style={styles.suitabilityStatText}>{weatherData.temp}°C</Text>
                            </View>
                            <View style={styles.suitabilityStatChip}>
                              <MaterialCommunityIcons name="water-percent" size={14} color={colors.primary} />
                              <Text style={styles.suitabilityStatText}>{weatherData.humidity}% RH</Text>
                            </View>
                            <View style={styles.suitabilityStatChip}>
                              <MaterialCommunityIcons name="cloud-percent" size={14} color={colors.primary} />
                              <Text style={styles.suitabilityStatText}>{weatherData.rainProbability}% rain</Text>
                            </View>
                          </View>
                          <View style={styles.suitabilityStatsRow}>
                            <View style={styles.suitabilityStatChip}>
                              <Text style={styles.suitabilityStatText}>Temp score {suitabilityData.breakdown.temperature}</Text>
                            </View>
                            <View style={styles.suitabilityStatChip}>
                              <Text style={styles.suitabilityStatText}>Humidity score {suitabilityData.breakdown.humidity}</Text>
                            </View>
                            <View style={styles.suitabilityStatChip}>
                              <Text style={styles.suitabilityStatText}>Elevation score {suitabilityData.breakdown.elevation}</Text>
                            </View>
                            <View style={styles.suitabilityStatChip}>
                              <Text style={styles.suitabilityStatText}>Rain score {suitabilityData.breakdown.rainfall}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.tipsContainer}>
                          <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="thermometer" size={18} color={colors.accent} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tipLabel}>Temperature Fit</Text>
                              <Text style={styles.tipText}>
                                {weatherData.temp >= 23 && weatherData.temp <= 32
                                  ? `Current ${weatherData.temp}°C is within the viable range for black pepper, with best growth near 27-28°C.`
                                  : `Current ${weatherData.temp}°C is outside the ideal range. Use shade, windbreaks, or irrigation support if planting here.`}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="water-percent" size={18} color={colors.accent} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tipLabel}>Moisture and Humidity</Text>
                              <Text style={styles.tipText}>
                                {weatherData.humidity >= 60 && weatherData.humidity <= 80
                                  ? `Humidity at ${weatherData.humidity}% is favorable. Maintain drainage so high moisture helps vines without promoting root rot.`
                                  : `Humidity at ${weatherData.humidity}% needs attention. Black pepper performs best with consistently humid but well-drained conditions.`}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="sprout-outline" size={18} color={colors.accent} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tipLabel}>Planting Decision</Text>
                              <Text style={styles.tipText}>
                                {suitabilityData.score >= 80
                                  ? 'This site is strong for black pepper. Prioritize support posts, disease monitoring, and regular mulching to capitalize on the conditions.'
                                  : suitabilityData.score >= 60
                                  ? 'This site can support black pepper with management. Improve drainage, moisture retention, and shade balance before scaling up.'
                                  : 'This site is marginal for black pepper. Test on a small area first and correct water, shade, and elevation-related limits before expansion.'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <View style={styles.recommendationsSection}>
                        <View style={styles.sectionHeadingRow}>
                          <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                          🌿 Farming Recommendations
                            </Text>
                            <Text style={styles.sectionSubtitle}>Actionable checks before planting or visiting</Text>
                          </View>
                        </View>
                        {recommendations.map((rec, index) => (
                            <View key={index} style={[styles.recommendationCard, { borderLeftColor: getRecommendationAccent(rec.type) }]}>
                                <View style={styles.recommendationTop}>
                                  <View style={[styles.recommendationIconWrap, { backgroundColor: `${getRecommendationAccent(rec.type)}18` }]}>
                                    <Feather name={getRecommendationIcon(rec.type)} size={15} color={getRecommendationAccent(rec.type)} />
                                  </View>
                                  <View style={styles.recommendationCopy}>
                                    <Text style={styles.recTitle}>{rec.title}</Text>
                                    <Text style={styles.recPill}>{rec.type === 'danger' ? 'Immediate attention' : rec.type === 'warning' ? 'Manage closely' : rec.type === 'info' ? 'Field note' : 'Favorable'}</Text>
                                  </View>
                                </View>
                                <Text style={styles.recMessage}>{rec.message}</Text>
                            </View>
                        ))}
                      </View>
                    )}

                    {/* Hourly Forecast */}
                    {weatherData.hourly && (
                      <View style={styles.forecastSection}>
                        <View style={styles.sectionHeadingRow}>
                          <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                              ⏰ Next 24 Hours
                            </Text>
                            <Text style={styles.sectionSubtitle}>Short-range temperature and rain rhythm</Text>
                          </View>
                        </View>
                        <ScrollView
                          ref={hourlyScrollRef}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          onLayout={(event) => setHourlyViewportWidth(event.nativeEvent.layout.width)}
                          contentContainerStyle={[
                            styles.hourlyScrollContent,
                            { paddingHorizontal: hourlyEdgePadding },
                          ]}
                        >
                          {weatherData.hourly.map((hour, index) => {
                            const isCurrentHour = hour.time === currentPhilippineHourLabel;
                            return (
                            <LinearGradient
                              key={index}
                              colors={isCurrentHour ? ['#163D30', '#245847'] : ['#FFFFFF', '#F5FBF7']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.hourlyCard}
                            >
                              <Text style={[styles.hourlyTime, isCurrentHour && styles.hourlyTimeActive]}>{hour.time}</Text>
                              <View style={[styles.hourlyIconWrap, isCurrentHour && styles.hourlyIconWrapActive]}>
                                <MaterialCommunityIcons
                                  name={getWeatherIcon(hour.weatherCode)}
                                  size={22}
                                  color={isCurrentHour ? '#FFFFFF' : colors.primary}
                                />
                              </View>
                              <Text style={[styles.hourlyTemp, isCurrentHour && styles.hourlyTempActive]}>{hour.temp}°</Text>
                              <View style={[styles.hourlyRainChip, isCurrentHour && styles.hourlyRainChipActive]}>
                                <MaterialCommunityIcons
                                  name="weather-rainy"
                                  size={11}
                                  color={isCurrentHour ? '#DDF7E8' : colors.primary}
                                />
                                <Text style={[styles.hourlyRainText, isCurrentHour && styles.hourlyRainTextActive]}>
                                  {hour.rainProbability}%
                                </Text>
                              </View>
                            </LinearGradient>
                          )})}
                        </ScrollView>
                      </View>
                    )}

                    {/* Daily Forecast */}
                    {weatherData.daily && weatherData.daily.length > 0 && (
                      <View style={styles.dailySection}>
                        <View style={styles.sectionHeadingRow}>
                          <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                              📅 7-Day Forecast
                            </Text>
                            <Text style={styles.sectionSubtitle}>Daily outlook for field visits and crop planning</Text>
                          </View>
                        </View>
                        {weatherData.daily.map((day, index) => (
                          <View
                            key={index}
                            style={[styles.dailyCard, index === 0 && styles.dailyCardActive]}
                          >
                            <View style={styles.dailyLeft}>
                              <View style={styles.dailyDateBadge}>
                                <Text style={[styles.dailyDate, { color: colors.text }]}>
                                  {day.date}
                                </Text>
                              </View>
                              <View style={styles.dailyTempRange}>
                                <Text style={[styles.dailyTempHigh, { color: colors.text }]}>
                                  {day.maxTemp}°
                                </Text>
                                <Text style={[styles.dailyTempLow, { color: colors.textLight }]}>
                                  {day.minTemp}°
                                </Text>
                              </View>
                            </View>
                            <View style={styles.dailyCenter}>
                              <View style={[styles.dailyIconWrap, index === 0 && styles.dailyIconWrapActive]}>
                                <MaterialCommunityIcons
                                  name={getWeatherIcon(day.weatherCode)}
                                  size={28}
                                  color={colors.primary}
                                />
                              </View>
                              <Text style={styles.dailyConditionHint}>
                                {day.rainProbability >= 70 ? 'Wet day' : day.rainProbability >= 40 ? 'Mixed skies' : 'Dry window'}
                              </Text>
                            </View>
                            <View style={styles.dailyRight}>
                              <View style={styles.dailyRain}>
                                <MaterialCommunityIcons name="cloud-percent" size={14} color={colors.warning} />
                                <Text style={[styles.dailyRainText, { color: colors.text }]}>
                                  {day.rainProbability}%
                                </Text>
                              </View>
                              <View style={styles.dailyRainAmount}>
                                <MaterialCommunityIcons name="water" size={14} color={colors.primary} />
                                <Text style={[styles.dailyRainAmountText, { color: colors.text }]}>
                                  {day.rainAmount}mm
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Optimal Conditions */}
                    <View style={styles.optimalSection}>
                        <View style={styles.sectionHeadingRow}>
                          <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                          📋 Optimal Conditions for Black Pepper
                            </Text>
                            <Text style={styles.sectionSubtitle}>Quick benchmark against current field conditions</Text>
                          </View>
                        </View>

                      <View style={styles.optimalOverviewCard}>
                        <View style={styles.optimalOverviewTop}>
                          <View>
                            <Text style={styles.optimalOverviewEyebrow}>Field Benchmark</Text>
                            <Text style={styles.optimalOverviewTitle}>Growing Window Match</Text>
                          </View>
                          <View style={[
                            styles.optimalOverviewBadge,
                            { backgroundColor: suitabilityData?.color || colors.primary }
                          ]}>
                            <Text style={styles.optimalOverviewBadgeText}>{suitabilityData?.rating || 'Review'}</Text>
                          </View>
                        </View>
                        <Text style={styles.optimalOverviewText}>
                          {suitabilityData?.score >= 80
                            ? 'Most core signals are aligned. The site is showing a strong black pepper growing window right now.'
                            : suitabilityData?.score >= 60
                            ? 'Several conditions are workable, but at least one factor needs management to keep black pepper performance stable.'
                            : 'Current conditions are below the ideal benchmark. Treat this as a monitored site and correct stress factors before scaling.'}
                        </Text>
                      </View>
                      
                      {/* Black Pepper Specific Advice */}
                      <View style={[styles.recommendationCard, styles.insightCard, { borderLeftColor: suitabilityData?.color || colors.primary, marginBottom: 16 }]}>
                         <Text style={styles.recTitle}>Black Pepper Insight</Text>
                         <Text style={styles.recMessage}>
                            {suitabilityData?.score >= 80
                              ? 'This location is highly favorable for black pepper. Focus on trellising, disease scouting, and moisture consistency to maximize productivity.'
                              : suitabilityData?.score >= 60
                              ? 'This location is workable for black pepper. You can improve performance with proper shade, organic matter, and careful water management.'
                              : 'This location is not yet ideal for black pepper. Treat it as a trial area unless you can improve humidity, drainage, and field protection.'}
                         </Text>
                      </View>

                      <View style={styles.optimalGrid}>
                        <View
                          style={[
                            styles.optimalCard,
                            {
                              backgroundColor: '#FFFFFF',
                              borderColor:
                                weatherData.temp >= 20 && weatherData.temp <= 30
                                  ? '#CAE8D3'
                                  : '#F4D0D0',
                            },
                          ]}
                        >
                          <View style={[styles.optimalIconWrap, weatherData.temp >= 20 && weatherData.temp <= 30 ? styles.optimalIconWrapGood : styles.optimalIconWrapBad]}>
                            <MaterialCommunityIcons name="thermometer" size={18} color={weatherData.temp >= 20 && weatherData.temp <= 30 ? colors.success : colors.danger} />
                          </View>
                          <Text style={[styles.optimalLabel, { color: colors.text }]}>Temperature</Text>
                          <Text style={[styles.optimalCurrent, { color: colors.text }]}>{weatherData.temp}°C</Text>
                          <Text style={[styles.optimalRange, { color: colors.textLight }]}>Ideal: 20-30°C</Text>
                          <Text
                            style={[
                              styles.optimalStatus,
                              {
                                color:
                                  weatherData.temp >= 20 && weatherData.temp <= 30
                                    ? colors.success
                                    : colors.danger,
                              },
                            ]}
                          >
                            {weatherData.temp >= 20 && weatherData.temp <= 30
                              ? '✓ Optimal'
                              : '✗ Outside Range'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.optimalCard,
                            {
                              backgroundColor: '#FFFFFF',
                              borderColor:
                                weatherData.humidity >= 60 && weatherData.humidity <= 90
                                  ? '#CAE8D3'
                                  : '#F4D0D0',
                            },
                          ]}
                        >
                          <View style={[styles.optimalIconWrap, weatherData.humidity >= 60 && weatherData.humidity <= 90 ? styles.optimalIconWrapGood : styles.optimalIconWrapBad]}>
                            <MaterialCommunityIcons name="water-percent" size={18} color={weatherData.humidity >= 60 && weatherData.humidity <= 90 ? colors.success : colors.danger} />
                          </View>
                          <Text style={[styles.optimalLabel, { color: colors.text }]}>Humidity</Text>
                          <Text style={[styles.optimalCurrent, { color: colors.text }]}>{weatherData.humidity}%</Text>
                          <Text style={[styles.optimalRange, { color: colors.textLight }]}>Ideal: 60-90%</Text>
                          <Text
                            style={[
                              styles.optimalStatus,
                              {
                                color:
                                  weatherData.humidity >= 60 && weatherData.humidity <= 90
                                    ? colors.success
                                    : colors.danger,
                              },
                            ]}
                          >
                            {weatherData.humidity >= 60 && weatherData.humidity <= 90
                              ? '✓ Optimal'
                              : '✗ Outside Range'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.optimalCard,
                            {
                              backgroundColor: '#FFFFFF',
                              borderColor:
                                weatherData.soilMoisture >= 40 && weatherData.soilMoisture <= 60
                                  ? '#CAE8D3'
                                  : '#F4D0D0',
                            },
                          ]}
                        >
                          <View style={[styles.optimalIconWrap, weatherData.soilMoisture >= 40 && weatherData.soilMoisture <= 60 ? styles.optimalIconWrapGood : styles.optimalIconWrapBad]}>
                            <MaterialCommunityIcons name="water-opacity" size={18} color={weatherData.soilMoisture >= 40 && weatherData.soilMoisture <= 60 ? colors.success : colors.danger} />
                          </View>
                          <Text style={[styles.optimalLabel, { color: colors.text }]}>Soil Moisture</Text>
                          <Text style={[styles.optimalCurrent, { color: colors.text }]}>{weatherData.soilMoisture.toFixed(1)}%</Text>
                          <Text style={[styles.optimalRange, { color: colors.textLight }]}>Ideal: 40-60%</Text>
                          <Text
                            style={[
                              styles.optimalStatus,
                              {
                                color:
                                  weatherData.soilMoisture >= 40 &&
                                  weatherData.soilMoisture <= 60
                                    ? colors.success
                                    : colors.danger,
                              },
                            ]}
                          >
                            {weatherData.soilMoisture >= 40 && weatherData.soilMoisture <= 60
                              ? '✓ Optimal'
                              : '✗ Outside Range'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={{height: 100}} />
                </>
            ) : (
                <Text style={{textAlign: 'center', marginTop: 20}}>Select a location to see weather details.</Text>
            )}
        </ScrollView>
      </Animated.View>

      {/* FLOATING PANEL - SAVED LOCATIONS */}
      <Animated.View style={[styles.floatingPanel, { transform: [{ translateY: savedPanelAnim }] }]} onTouchStart={() => suppressMapTap(1000)}>
        <TouchableOpacity style={styles.floatingHeader} onPressIn={() => suppressMapTap(900)} onPress={toggleSavedPanel}>
          <View style={styles.floatingHeaderLeft}>
            <View style={styles.floatingHeartWrap}>
              <MaterialCommunityIcons name="heart" size={18} color="#E74C3C" />
            </View>
            <View>
              <Text style={styles.floatingTitle}>Saved Locations</Text>
              <Text style={styles.floatingSubtitle}>{savedLocations.length} favorite places</Text>
            </View>
          </View>
          <View style={styles.floatingHeaderRight}>
            <View style={styles.savedCountPill}>
              <Text style={styles.savedCountPillText}>{savedLocations.length}</Text>
            </View>
            <MaterialCommunityIcons name={showSavedPanel ? 'chevron-down' : 'chevron-up'} size={20} color={colors.accent} />
          </View>
        </TouchableOpacity>

        {showSavedPanel && (
          <FlatList
            data={savedLocations}
            keyExtractor={(item) => item._id}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.savedListContent}
            renderItem={({ item }) => (
              <View style={styles.savedItem}>
                <TouchableOpacity 
                  style={styles.savedItemContent}
                  onPressIn={() => suppressMapTap(900)}
                  onPress={() => handleLocationClick(item)}
                  activeOpacity={0.9}
                >
                  <View style={styles.savedItemTop}>
                    <View style={styles.savedItemIconWrap}>
                      <MaterialCommunityIcons name="map-marker-path" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.savedItemInfo}>
                      <Text style={styles.savedItemName} numberOfLines={1}>{item.farm.name}</Text>
                      <View style={styles.savedMetaRow}>
                        <Feather name="map-pin" size={13} color={colors.textLight} />
                        <Text style={styles.savedItemLocation} numberOfLines={1}>{item.farm.location}</Text>
                      </View>
                      <Text style={styles.savedItemAddress} numberOfLines={1}>
                        {item.farm.address || 'No address available'}
                      </Text>
                      {userLocation && (
                        <View style={styles.savedMetaRow}>
                          <MaterialCommunityIcons name="navigation-variant-outline" size={14} color={colors.success} />
                          <Text style={styles.savedItemDistance}>
                            {calculateDistance(
                              userLocation.latitude,
                              userLocation.longitude,
                              item.farm.latitude,
                              item.farm.longitude
                            )} km away
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.savedDeleteButton}
                  onPressIn={() => suppressMapTap(900)}
                  onPress={() => Alert.alert('Remove', `Remove ${item.farm.name}?`, [
                    { text: 'Cancel' },
                    { text: 'Remove', onPress: () => unsaveLocation(item._id), style: 'destructive' }
                  ])}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.savedEmptyWrap}>
                <MaterialCommunityIcons name="map-search-outline" size={22} color="#7A8E88" />
                <Text style={styles.emptyText}>No saved locations yet</Text>
              </View>
            }
          />
        )}
      </Animated.View>

      {/* FLOATING BUTTON - OPEN FLOATING PANEL */}
      {!showSavedPanel && (
        <TouchableOpacity style={styles.floatingButton} onPressIn={() => suppressMapTap(900)} onPress={toggleSavedPanel}>
          <MaterialCommunityIcons name="heart" size={24} color="#FFF" />
          {savedLocations.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{savedLocations.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 120,
  },
  searchToggleButton: {
    position: 'absolute',
    top: 80,
    left: 16,
    zIndex: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDEBE3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 9,
  },
  toggleListButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    zIndex: 100,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#2A6654',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 12,
  },
  toggleListText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDEBE3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  searchResultsList: {
    marginTop: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDEBE3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
    maxHeight: 240,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
    fontWeight: '500',
  },
  resultType: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  selectedLocationCard: {
    position: 'absolute',
    top: 160,
    left: 16,
    right: 16,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderWidth: 1,
    borderColor: '#DDEBE3',
  },
  selectedLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedLocationName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  selectedLocationAddress: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
  selectedLocationClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF5F1',
    borderWidth: 1,
    borderColor: '#DDEBE3',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 200, // Adjusted to be above the taller bottom sheet
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAF7',
  },
  map: {
    flex: 1,
    backgroundColor: '#F8FAF7',
    opacity: 0.99, 
  },
  // Side Panel Styles
  sidePanel: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: SIDE_PANEL_WIDTH,
      backgroundColor: 'rgba(252, 255, 253, 0.98)',
      zIndex: 40,
      elevation: 10,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 58 : 86,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
  },
  sidePanelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 18,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E4F0E9',
  },
  sidePanelHeaderMain: {
      flex: 1,
      paddingRight: 10,
  },
  sidePanelHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  sidePanelTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#1B4D3E',
  },
  sidePanelSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: '#6A877F',
      fontWeight: '600',
  },
  sidePanelCountBadge: {
      minWidth: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
  },
  sidePanelCountText: {
      fontSize: 14,
      fontWeight: '800',
  },
  sidePanelToggle: {
      flexDirection: 'row',
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 8,
  },
  panelToggleButton: {
      flex: 1,
      paddingVertical: 11,
      alignItems: 'center',
      borderRadius: 12,
  },
  panelToggleText: {
      fontWeight: '700',
      fontSize: 13,
  },
  sidePanelList: {
      flex: 1,
      paddingHorizontal: 14,
  },
  sidePanelListContent: {
      paddingBottom: 24,
  },
  sidePanelItem: {
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderWidth: 1,
      marginBottom: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      shadowColor: '#0D2818',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
  },
  sidePanelItemTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  sidePanelItemIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  sidePanelItemMain: {
      flex: 1,
  },
  sidePanelItemName: {
      fontSize: 13,
      fontWeight: '800',
      color: '#223A33',
  },
  sidePanelItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
  },
  sidePanelItemArrowText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: '#4B675E',
  },
  sidePanelItemLocation: {
      flex: 1,
      fontSize: 11,
      color: '#647A73',
      fontWeight: '600',
  },
  sidePanelItemAddress: {
      marginTop: 8,
      fontSize: 11,
      color: '#7A8E88',
      fontWeight: '500',
  },
  // Bottom Sheet Styles
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 20,
  },
  dragHandleArea: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  weatherHeader: {
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      paddingBottom: 10,
  },
  weatherLocationName: {
      fontSize: 22,
      fontWeight: '700',
      color: '#1B4D3E',
  },
  weatherLocationSub: {
      fontSize: 14,
      color: '#666',
      marginTop: 2,
  },
  currentWeatherCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  weatherAtmosphereOrbOne: {
    position: 'absolute',
    top: -26,
    right: -14,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  weatherAtmosphereOrbTwo: {
    position: 'absolute',
    bottom: -36,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  weatherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  weatherIcon: {
  },
  tempSection: {
    flex: 1,
  },
  weatherNowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.76)',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  currentTemp: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  tempRange: {
      alignItems: 'flex-end',
      gap: 4,
  },
  tempRangeText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '700',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 999,
  },
  weatherFooterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  weatherFooterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  weatherFooterChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailCard: {
    width: '23%',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E3ECE6',
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  detailHumidity: {
    backgroundColor: '#ECF8F0',
  },
  detailWind: {
    backgroundColor: '#ECF3FB',
  },
  detailRain: {
    backgroundColor: '#FFF4E9',
  },
  detailSoil: {
    backgroundColor: '#FAEEF3',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
    color: '#234336',
  },
  detailLabel: {
    fontSize: 10,
    color: '#627A72',
    marginTop: 3,
    fontWeight: '700',
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sectionHeadingRow: {
    marginBottom: 10,
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6E857D',
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E7EEE9',
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  recommendationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  recommendationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationCopy: {
    flex: 1,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  recPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#6A8179',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  recMessage: {
    fontSize: 12,
    color: '#546B64',
    lineHeight: 18,
  },
  insightCard: {
    backgroundColor: '#FBFDFB',
  },
  forecastSection: {
    marginBottom: 20,
  },
  hourlyScrollContent: {
    paddingRight: 6,
  },
  hourlyCard: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
    width: 92,
    borderWidth: 1,
    borderColor: '#E1ECE5',
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hourlyTime: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    color: '#5E7770',
  },
  hourlyTimeActive: {
    color: '#FFFFFF',
  },
  hourlyIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF7F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hourlyIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: '800',
    color: '#163D30',
  },
  hourlyTempActive: {
    color: '#FFFFFF',
  },
  hourlyRainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#EDF7F0',
  },
  hourlyRainChipActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  hourlyRainText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2D6A57',
  },
  hourlyRainTextActive: {
    color: '#FFFFFF',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dailySection: {
    marginBottom: 20,
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3ECE6',
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  dailyCardActive: {
    borderColor: '#CFE4D8',
    backgroundColor: '#F8FCFA',
  },
  dailyLeft: {
    flex: 1,
  },
  dailyDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF7F1',
    marginBottom: 8,
  },
  dailyDate: {
    fontSize: 11,
    fontWeight: '800',
    color: '#37584D',
  },
  dailyTempRange: {
    flexDirection: 'row',
    gap: 8,
  },
  dailyTempHigh: {
    fontSize: 20,
    fontWeight: '800',
  },
  dailyTempLow: {
    fontSize: 15,
    fontWeight: '700',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  dailyCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dailyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F0F8F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dailyIconWrapActive: {
    backgroundColor: '#E3F3E9',
  },
  dailyConditionHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6A837B',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  dailyRight: {
    marginLeft: 12,
    alignItems: 'flex-end',
    gap: 4,
  },
  dailyRain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyRainText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dailyRainAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyRainAmountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  optimalSection: {
    marginBottom: 20,
  },
  optimalOverviewCard: {
    backgroundColor: '#F9FCFA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0EBE4',
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optimalOverviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  optimalOverviewEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B847C',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  optimalOverviewTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  optimalOverviewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  optimalOverviewBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  optimalOverviewText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: '#516A63',
    fontWeight: '600',
  },
  optimalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optimalCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    elevation: 2,
    borderWidth: 1,
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  optimalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optimalIconWrapGood: {
    backgroundColor: '#EAF7EE',
  },
  optimalIconWrapBad: {
    backgroundColor: '#FCECEC',
  },
  optimalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  optimalCurrent: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
  },
  optimalRange: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  optimalStatus: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  saveBtnStyle: {
    backgroundColor: '#E74C3C',
  },
  directionBtnStyle: {
    backgroundColor: '#22c55e',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  tipsSection: {
    marginTop: 16,
    marginHorizontal: 12,
  },
  tipsContainer: {
    gap: 12,
    marginTop: 12,
  },
  suitabilityHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2ECE6',
    marginTop: 12,
    marginBottom: 12,
  },
  suitabilityHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  suitabilityHeroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D847C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suitabilityHeroScore: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B4D3E',
    marginTop: 2,
  },
  suitabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  suitabilityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  suitabilityHeroText: {
    marginTop: 10,
    fontSize: 13,
    color: '#4E6660',
    lineHeight: 19,
    fontWeight: '600',
  },
  suitabilityMeta: {
    marginTop: 8,
    fontSize: 11,
    color: '#748981',
    fontWeight: '600',
  },
  suitabilityStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  suitabilityStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F1F7F3',
    borderWidth: 1,
    borderColor: '#DCE9E2',
  },
  suitabilityStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#315447',
  },
  tipItem: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF7',
    padding: 12,
    borderRadius: 10,
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  tipText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    lineHeight: 16,
  },
  floatingPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#DDEBE3',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    maxHeight: 390,
    zIndex: 100,
  },
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EFEA',
    backgroundColor: '#F8FCFA',
  },
  floatingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floatingHeartWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFECEC',
  },
  floatingHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: '#738B84',
  },
  savedCountPill: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
  },
  savedCountPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  floatingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  savedListContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 9,
  },
  savedItemContent: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDEBE3',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  savedItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  savedItemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },
  savedItemInfo: {
    flex: 1,
  },
  savedItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F3A31',
  },
  savedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  savedItemLocation: {
    flex: 1,
    fontSize: 11,
    color: '#5F7971',
    fontWeight: '600',
  },
  savedItemAddress: {
    marginTop: 4,
    fontSize: 10,
    color: '#7E938D',
    fontWeight: '500',
  },
  savedItemDistance: {
    fontSize: 10,
    color: '#1E8E3E',
    fontWeight: '600',
  },
  savedDeleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFECEC',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 2,
    color: '#7A8E88',
    fontSize: 12,
    fontWeight: '600',
  },
  savedEmptyWrap: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#E74C3C',
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 99,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

