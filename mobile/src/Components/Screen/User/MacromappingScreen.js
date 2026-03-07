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
            if (routeLayer) {
                map.removeLayer(routeLayer);
            }
            if (coords && coords.length > 0) {
                var latLngs = coords.map(c => [c.latitude, c.longitude]);
                // Use smoothFactor to optimize rendering performance during zoom/pan
                routeLayer = L.polyline(latLngs, {
                    color: 'blue', 
                    weight: 5,
                    opacity: 0.7,
                    smoothFactor: 3.0, // Higher value = better performance, less detail
                    renderer: L.canvas() // Explicitly use Canvas renderer
                }).addTo(map);
                map.fitBounds(routeLayer.getBounds(), {padding: [50, 50]});
            }
        }

        function setClickMarker(lat, lng) {
            if (clickMarker) {
                map.removeLayer(clickMarker);
            }
            clickMarker = L.marker([lat, lng], {icon: clickIcon}).addTo(map);
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

  const fetchLocationWeather = async (latitude, longitude, locationName) => {
    try {
      setLoadingWeather(true);
      const data = await getWeatherData(latitude, longitude);
      setWeatherData({
        locationName,
        ...data,
      });
      // Generate recommendations based on fetched weather
      const recs = getFarmingRecommendations(data);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching weather:', error);
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
              fetchLocationWeather(latitude, longitude, addressName);
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
    fetchLocationWeather(item.latitude, item.longitude, item.name);
    
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
            fetchLocationWeather(farm.latitude, farm.longitude, farm.name);
            
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
    
    setIsNavigating(false);
    setSelectedItem(null);
    // Clear route from map
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'drawRoute',
        coordinates: []
      }));
    }
    // Collapse bottom sheet
    Animated.spring(sheetY, { 
      toValue: height - BOTTOM_SHEET_MIN_HEIGHT, 
      useNativeDriver: false 
    }).start();
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
                          fetchLocationWeather(item.latitude, item.longitude, item.name);
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

  const directoryItems = activeCategory === 'Farms' ? FARMS_DATA : RETAILERS_DATA;
  const isFarmCategory = activeCategory === 'Farms';

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

      <View style={styles.mapContainer} pointerEvents={isUIActive() ? 'none' : 'auto'}>
        <WebView
          ref={webViewRef}
          source={{ html: MAP_HTML }}
          style={styles.map}
          onMessage={onWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          pointerEvents={isUIActive() ? 'none' : 'auto'}
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
                      onPress={() => {
                        setSelectedItem(null);
                        Animated.spring(sheetY, { toValue: height - BOTTOM_SHEET_MIN_HEIGHT, useNativeDriver: false }).start();
                      }}
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
                    <View style={[styles.currentWeatherCard, { backgroundColor: colors.primary }]}>
                      <View style={styles.weatherTop}>
                        <MaterialCommunityIcons
                          name={getWeatherIcon(weatherData.weatherCode)}
                          size={50}
                          color="#FFFFFF"
                          style={styles.weatherIcon}
                        />
                        <View style={styles.tempSection}>
                          <Text style={styles.currentTemp}>{weatherData.temp}°C</Text>
                          <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
                        </View>
                        <View style={styles.tempRange}>
                            <Text style={styles.tempRangeText}>H: {weatherData.maxTemp}°</Text>
                            <Text style={styles.tempRangeText}>L: {weatherData.minTemp}°</Text>
                        </View>
                      </View>
                    </View>

                    {/* Weather Grid */}
                    <View style={styles.detailsGrid}>
                        <View style={[styles.detailCard, { backgroundColor: '#E8F5E9' }]}>
                            <MaterialCommunityIcons name="water-percent" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
                            <Text style={styles.detailLabel}>Humidity</Text>
                        </View>
                        <View style={[styles.detailCard, { backgroundColor: '#E3F2FD' }]}>
                            <MaterialCommunityIcons name="weather-windy" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.windSpeed} km/h</Text>
                            <Text style={styles.detailLabel}>Wind</Text>
                        </View>
                        <View style={[styles.detailCard, { backgroundColor: '#FFF3E0' }]}>
                            <MaterialCommunityIcons name="cloud-percent" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.rainProbability}%</Text>
                            <Text style={styles.detailLabel}>Rain Chance</Text>
                        </View>
                        <View style={[styles.detailCard, { backgroundColor: '#FCE4EC' }]}>
                            <MaterialCommunityIcons name="water-opacity" size={20} color={colors.primary} />
                            <Text style={styles.detailValue}>{weatherData.soilMoisture.toFixed(1)}%</Text>
                            <Text style={styles.detailLabel}>Soil</Text>
                        </View>
                    </View>

                    {/* Location Tips Section */}
                    {selectedItem && (
                      <View style={styles.tipsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Location Tips</Text>
                        <View style={styles.tipsContainer}>
                          <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="road" size={18} color={colors.accent} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tipLabel}>Road Conditions</Text>
                              <Text style={styles.tipText}>Well-maintained routes. Check weather before travel.</Text>
                            </View>
                          </View>
                          <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="clock-outline" size={18} color={colors.accent} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tipLabel}>Best Time to Visit</Text>
                              <Text style={styles.tipText}>Early morning (6-8 AM) for cooler weather and easier parking.</Text>
                            </View>
                          </View>
                          <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="parking" size={18} color={colors.accent} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tipLabel}>Parking</Text>
                              <Text style={styles.tipText}>Free parking available. Shaded area near entrance.</Text>
                            </View>
                          </View>
                          <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="information" size={18} color={colors.accent} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tipLabel}>Hours</Text>
                              <Text style={styles.tipText}>Open 8 AM - 5 PM daily. Ask for details at gate.</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <View style={styles.recommendationsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                          🌿 Farming Recommendations
                        </Text>
                        {recommendations.map((rec, index) => (
                            <View key={index} style={[styles.recommendationCard, { borderLeftColor: rec.type === 'warning' ? colors.warning : (rec.type === 'danger' ? colors.danger : colors.success) }]}>
                                <Text style={styles.recTitle}>{rec.title}</Text>
                                <Text style={styles.recMessage}>{rec.message}</Text>
                            </View>
                        ))}
                      </View>
                    )}

                    {/* Hourly Forecast */}
                    {weatherData.hourly && (
                      <View style={styles.forecastSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                          ⏰ Next 24 Hours
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {weatherData.hourly.map((hour, index) => (
                            <View key={index} style={styles.hourlyCard}>
                              <Text style={styles.hourlyTime}>{hour.time}</Text>
                              <MaterialCommunityIcons name={getWeatherIcon(hour.weatherCode)} size={24} color={colors.primary} />
                              <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Daily Forecast */}
                    {weatherData.daily && weatherData.daily.length > 0 && (
                      <View style={styles.dailySection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                          📅 7-Day Forecast
                        </Text>
                        {weatherData.daily.map((day, index) => (
                          <View
                            key={index}
                            style={[styles.dailyCard, { backgroundColor: '#FFFFFF' }]}
                          >
                            <View style={styles.dailyLeft}>
                              <Text style={[styles.dailyDate, { color: colors.text }]}>
                                {day.date}
                              </Text>
                              <View style={styles.dailyTempRange}>
                                <Text style={[styles.dailyTempText, { color: colors.text }]}>
                                  {day.maxTemp}°
                                </Text>
                                <Text style={[styles.dailyTempText, { color: colors.textLight }]}>
                                  {day.minTemp}°
                                </Text>
                              </View>
                            </View>
                            <MaterialCommunityIcons
                              name={getWeatherIcon(day.weatherCode)}
                              size={36}
                              color={colors.primary}
                            />
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
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        📋 Optimal Conditions for Black Pepper
                      </Text>
                      
                      {/* Black Pepper Specific Advice */}
                      <View style={[styles.recommendationCard, { borderLeftColor: colors.primary, marginBottom: 16 }]}>
                         <Text style={styles.recTitle}>🌶️ Black Pepper Insight</Text>
                         <Text style={styles.recMessage}>
                            {weatherData.temp >= 20 && weatherData.temp <= 30 && weatherData.humidity >= 60 
                                ? "This location currently has excellent conditions for Black Pepper growth. The temperature and humidity are within the ideal range for flowering and fruiting." 
                                : "Current conditions may require attention. Black Pepper thrives in 20-30°C and high humidity. Consider irrigation or shade management if parameters are outside this range."}
                         </Text>
                      </View>

                      <View style={styles.optimalGrid}>
                        <View
                          style={[
                            styles.optimalCard,
                            {
                              backgroundColor:
                                weatherData.temp >= 20 && weatherData.temp <= 30
                                  ? '#C8E6C9'
                                  : '#FFCDD2',
                            },
                          ]}
                        >
                          <Text style={[styles.optimalLabel, { color: colors.text }]}>
                            Temperature
                          </Text>
                          <Text style={[styles.optimalRange, { color: colors.text }]}>
                            20-30°C
                          </Text>
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
                              backgroundColor:
                                weatherData.humidity >= 60 && weatherData.humidity <= 90
                                  ? '#C8E6C9'
                                  : '#FFCDD2',
                            },
                          ]}
                        >
                          <Text style={[styles.optimalLabel, { color: colors.text }]}>
                            Humidity
                          </Text>
                          <Text style={[styles.optimalRange, { color: colors.text }]}>
                            60-90%
                          </Text>
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
                              backgroundColor:
                                weatherData.soilMoisture >= 40 && weatherData.soilMoisture <= 60
                                  ? '#C8E6C9'
                                  : '#FFCDD2',
                            },
                          ]}
                        >
                          <Text style={[styles.optimalLabel, { color: colors.text }]}>
                            Soil Moisture
                          </Text>
                          <Text style={[styles.optimalRange, { color: colors.text }]}>
                            40-60%
                          </Text>
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
    elevation: 2,
  },
  weatherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherIcon: {
    marginRight: 10,
  },
  tempSection: {
    flex: 1,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tempRange: {
      alignItems: 'flex-end',
  },
  tempRangeText: {
      color: '#FFF',
      fontSize: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailCard: {
    width: '23%',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  recMessage: {
    fontSize: 12,
    color: '#555',
  },
  forecastSection: {
    marginBottom: 20,
  },
  hourlyCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    alignItems: 'center',
    width: 60,
  },
  hourlyTime: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  hourlyTemp: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
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
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  dailyLeft: {
    flex: 1,
  },
  dailyDate: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  dailyTempRange: {
    flexDirection: 'row',
    gap: 10,
  },
  dailyTempText: {
    fontSize: 12,
    fontWeight: '600',
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
  optimalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optimalCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  optimalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  optimalRange: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  optimalStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
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

