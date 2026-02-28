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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import MobileHeader from '../../shared/MobileHeader';
import { getWeatherData, getFarmingRecommendations } from '../../../utils/weatherService';
import { getElevation } from '../../../utils/elevationService';
import { getToken, logout } from '../../utils/helper';
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
const SIDE_PANEL_WIDTH = width * 0.6;

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
                var marker = L.marker([item.latitude, item.longitude], {icon: icon})
                    .addTo(map)
                    .bindPopup(item.name);
                
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
  };

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

  // Side Panel Animations
  const toggleSidePanel = () => {
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

  const handleMapClick = (latitude, longitude) => {
      // If user location exists, draw route to clicked point
      if (userLocation) {
          fetchRoute(userLocation.latitude, userLocation.longitude, latitude, longitude);
      }
      
      // Update Weather for the clicked location
      setSelectedItem(null); // Clear selected item if clicking map randomly
      fetchLocationWeather(latitude, longitude, "Selected Location");
      
      // Open Bottom Sheet to show weather
      expandBottomSheet();
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // If coming from map click with different type, switch category first
    if (type && type !== activeCategory) {
      setActiveCategory(type);
    }

    setSelectedItem(item);
    fetchLocationWeather(item.latitude, item.longitude, item.name);
    
    // Close side panel if open
    if (sidePanelOpen) {
        toggleSidePanel();
    }

    // Expand Bottom Sheet
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

  // Search Functionality
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length < 2) {
        setSearchResults([]);
        return;
    }

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
  };

  const handleSelectSearchResult = (item) => {
      Keyboard.dismiss();
      setSearchQuery(item.name);
      setSearchResults([]);

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
          // If it's online result, just route to it
          if (userLocation) {
              fetchRoute(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
          }
          // Fetch weather for this new location
          fetchLocationWeather(item.latitude, item.longitude, item.name);
          setSelectedItem({ name: item.name, address: item.address, type: 'Location' }); // Pseudo-item for header
          expandBottomSheet();
      }
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
          // Only process map click if search is NOT active
          if (searchQuery.trim().length === 0) {
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView pointerEvents="box-none" style={styles.headerOverlay}>
        <MobileHeader
          navigation={navigation}
          drawerOpen={drawerOpen}
          openDrawer={openDrawer}
          closeDrawer={closeDrawer}
          drawerSlideAnim={drawerSlideAnim}
          user={user}
          onLogout={() => logout(navigation)}
        />
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Feather name="search" size={20} color={colors.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search farms, retailers, or places..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholderTextColor={colors.textLight}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        Keyboard.dismiss();
                    }}>
                        <Feather name="x" size={20} color={colors.textLight} />
                    </TouchableOpacity>
                )}
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
                                onPress={() => handleSelectSearchResult(item)}
                            >
                                <View style={[styles.resultIcon, { backgroundColor: item.type === 'Farms' ? colors.primary : (item.type === 'Retailers' ? colors.warning : '#999') }]}>
                                    <Feather name={item.source === 'local' ? 'map-pin' : 'globe'} size={14} color="#FFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultTitle}>{item.name}</Text>
                                    <Text style={styles.resultSubtitle} numberOfLines={1}>{item.address}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        style={{ maxHeight: 200 }}
                    />
                </View>
            )}
        </View>

        {/* Toggle List Button (Below Search Bar) */}
        <TouchableOpacity 
            style={styles.toggleListButton}
            onPress={toggleSidePanel}
        >
            <Feather name={sidePanelOpen ? "chevrons-left" : "list"} size={20} color={colors.white} />
            <Text style={styles.toggleListText}>{sidePanelOpen ? "Hide List" : "Show List"}</Text>
        </TouchableOpacity>

        {/* Legend Overlay */}
        <View style={styles.legendContainer}>
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
      <Animated.View style={[styles.sidePanel, { transform: [{ translateX: sidePanelAnim }] }]}>
          <View style={styles.sidePanelHeader}>
              <Text style={styles.sidePanelTitle}>Directory</Text>
              <TouchableOpacity onPress={toggleSidePanel}>
                  <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
          </View>
          
          <View style={styles.sidePanelToggle}>
            <TouchableOpacity
              style={[
                styles.panelToggleButton,
                { backgroundColor: activeCategory === 'Farms' ? colors.primary : '#F0F0F0' }
              ]}
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
                { backgroundColor: activeCategory === 'Retailers' ? colors.warning : '#F0F0F0' }
              ]}
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

          <ScrollView style={styles.sidePanelList}>
            {(activeCategory === 'Farms' ? FARMS_DATA : RETAILERS_DATA).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sidePanelItem,
                  {
                    borderLeftColor: activeCategory === 'Farms' ? colors.primary : colors.warning
                  },
                ]}
                onPress={() => handleItemPress(item)}
              >
                <Text style={styles.sidePanelItemName}>{item.name}</Text>
                <Text style={styles.sidePanelItemLocation}>📍 {item.location}</Text>
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
    zIndex: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  searchResultsList: {
    marginTop: 4,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 200,
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
  },
  toggleListButton: {
      position: 'absolute',
      top: 140, // Below search bar
      left: 16,
      backgroundColor: '#1B4D3E',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      zIndex: 25,
  },
  toggleListText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
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
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly lower opacity
      zIndex: 40,
      elevation: 10,
      paddingTop: 40, // Space for status bar
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
  },
  sidePanelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
  },
  sidePanelTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1B4D3E',
  },
  sidePanelToggle: {
      flexDirection: 'row',
      padding: 15,
      gap: 10,
  },
  panelToggleButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
  },
  panelToggleText: {
      fontWeight: '600',
      fontSize: 14,
  },
  sidePanelList: {
      flex: 1,
      paddingHorizontal: 15,
  },
  sidePanelItem: {
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5',
      borderLeftWidth: 4,
      marginBottom: 8,
      backgroundColor: '#FAFAFA',
      borderRadius: 4,
  },
  sidePanelItemName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
  },
  sidePanelItemLocation: {
      fontSize: 12,
      color: '#666',
      marginTop: 2,
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
});
