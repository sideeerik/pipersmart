import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { logout } from '../../utils/helper';
import MobileHeader from '../../shared/MobileHeader';
import { getWeatherData, getFarmingRecommendations } from '../../../utils/weatherService';
import { BACKEND_URL } from 'react-native-dotenv';

const { width } = Dimensions.get('window');

export default function WeatherScreen({ navigation }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const drawerSlideAnim = React.useRef(new Animated.Value(-280)).current;

  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    primaryLight: '#27AE60',
    secondary: '#FFFFFF',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    accent: '#D4AF37',
    warning: '#F39C12',
    danger: '#E74C3C',
    success: '#27AE60',
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await getWeatherData();
      setWeather(weatherData);
      const recs = getFarmingRecommendations(weatherData);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeather();
    setRefreshing(false);
  };

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

  const getWeatherIcon = (code) => {
    if (code <= 3) return 'weather-sunny'; // Clear
    if (code === 45 || code === 48) return 'weather-fog'; // Fog
    if (code >= 51 && code <= 67) return 'weather-rainy'; // Rain
    if (code >= 71 && code <= 77) return 'weather-snowy'; // Snow
    if (code >= 80 && code <= 82) return 'weather-rainy'; // Showers
    if (code >= 95 && code <= 99) return 'weather-lightning'; // Thunderstorm
    return 'cloud';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <MobileHeader
        navigation={navigation}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
        user={user}
        onLogout={() => {
          // ⚡ Fast logout - immediate response (backend call happens in background)
          logout(navigation);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {weather && (
          <>
            {/* Current Weather Card */}
            <View style={[styles.currentWeatherCard, { backgroundColor: colors.primary }]}>
              <View style={styles.weatherTop}>
                <MaterialCommunityIcons
                  name={getWeatherIcon(weather.weatherCode)}
                  size={80}
                  color="#FFFFFF"
                  style={styles.weatherIcon}
                />
                <View style={styles.tempSection}>
                  <Text style={styles.currentTemp}>{weather.temp}°C</Text>
                  <Text style={styles.weatherCondition}>{weather.condition}</Text>
                </View>
              </View>

              <View style={styles.tempRangeContainer}>
                <View style={styles.tempRange}>
                  <MaterialCommunityIcons name="thermometer" size={20} color="#FFFFFF" />
                  <Text style={styles.tempRangeText}>
                    Max: {weather.maxTemp}°C
                  </Text>
                </View>
                <View style={styles.tempRange}>
                  <MaterialCommunityIcons name="thermometer" size={20} color="#FFFFFF" />
                  <Text style={styles.tempRangeText}>
                    Min: {weather.minTemp}°C
                  </Text>
                </View>
              </View>
            </View>

            {/* Weather Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={[styles.detailCard, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons
                  name="water-percent"
                  size={28}
                  color={colors.primary}
                />
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {weather.humidity}%
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Humidity
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={28}
                  color={colors.primary}
                />
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {weather.windSpeed} km/h
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Wind Speed
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons
                  name="water-outline"
                  size={28}
                  color={colors.primary}
                />
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {weather.precipitation}mm
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Precipitation
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons
                  name="cloud-percent"
                  size={28}
                  color={colors.primary}
                />
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {weather.rainProbability}%
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Rain Chance
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: '#FCE4EC' }]}>
                <MaterialCommunityIcons
                  name="water-opacity"
                  size={28}
                  color={colors.primary}
                />
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {weather.soilMoisture.toFixed(1)}%
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Soil Moisture
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: '#E0F2F1' }]}>
                <MaterialCommunityIcons
                  name="cloud-download"
                  size={28}
                  color={colors.primary}
                />
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {weather.rainForecast}mm
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Rain Forecast
                </Text>
              </View>
            </View>

            {/* Farming Recommendations */}
            {recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🌿 Farming Recommendations
                </Text>

                {recommendations.map((rec, index) => {
                  let backgroundColor = colors.success;
                  let icon = 'check-circle';

                  if (rec.type === 'warning') {
                    backgroundColor = colors.warning;
                    icon = 'alert-circle';
                  } else if (rec.type === 'danger') {
                    backgroundColor = colors.danger;
                    icon = 'alert-octagon';
                  }

                  return (
                    <View
                      key={index}
                      style={[
                        styles.recommendationCard,
                        { borderLeftColor: backgroundColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={icon}
                        size={24}
                        color={backgroundColor}
                        style={styles.recIcon}
                      />
                      <View style={styles.recContent}>
                        <Text
                          style={[
                            styles.recTitle,
                            { color: colors.text },
                          ]}
                        >
                          {rec.title}
                        </Text>
                        <Text
                          style={[
                            styles.recMessage,
                            { color: colors.textLight },
                          ]}
                        >
                          {rec.message}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Hourly Forecast */}
            {weather.hourly && weather.hourly.length > 0 && (
              <View style={styles.forecastSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  ⏰ Next 24 Hours
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  {weather.hourly.map((hour, index) => (
                    <View
                      key={index}
                      style={[styles.hourlyCard, { backgroundColor: '#E8F5E9' }]}
                    >
                      <Text style={[styles.hourlyTime, { color: colors.text }]}>
                        {hour.time}
                      </Text>
                      <MaterialCommunityIcons
                        name={getWeatherIcon(hour.weatherCode)}
                        size={32}
                        color={colors.primary}
                        style={styles.hourlyIcon}
                      />
                      <Text style={[styles.hourlyTemp, { color: colors.text }]}>
                        {hour.temp}°
                      </Text>
                      <View style={styles.hourlyRain}>
                        <MaterialCommunityIcons name="cloud-percent" size={12} color={colors.warning} />
                        <Text style={[styles.hourlyRainText, { color: colors.text }]}>
                          {hour.rainProbability}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Daily Forecast */}
            {weather.daily && weather.daily.length > 0 && (
              <View style={styles.dailySection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  📅 7-Day Forecast
                </Text>
                {weather.daily.map((day, index) => (
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

            {/* Recommendations */}
            <View style={styles.optimalSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📋 Optimal Conditions for Black Pepper
              </Text>
              <View style={styles.optimalGrid}>
                <View
                  style={[
                    styles.optimalCard,
                    {
                      backgroundColor:
                        weather.temp >= 20 && weather.temp <= 30
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
                          weather.temp >= 20 && weather.temp <= 30
                            ? colors.success
                            : colors.danger,
                      },
                    ]}
                  >
                    {weather.temp >= 20 && weather.temp <= 30
                      ? '✓ Optimal'
                      : '✗ Outside Range'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.optimalCard,
                    {
                      backgroundColor:
                        weather.humidity >= 60 && weather.humidity <= 90
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
                          weather.humidity >= 60 && weather.humidity <= 90
                            ? colors.success
                            : colors.danger,
                      },
                    ]}
                  >
                    {weather.humidity >= 60 && weather.humidity <= 90
                      ? '✓ Optimal'
                      : '✗ Outside Range'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.optimalCard,
                    {
                      backgroundColor:
                        weather.soilMoisture >= 40 && weather.soilMoisture <= 60
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
                          weather.soilMoisture >= 40 &&
                          weather.soilMoisture <= 60
                            ? colors.success
                            : colors.danger,
                      },
                    ]}
                  >
                    {weather.soilMoisture >= 40 && weather.soilMoisture <= 60
                      ? '✓ Optimal'
                      : '✗ Outside Range'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ height: 30 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  currentWeatherCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
  },
  weatherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    marginRight: 16,
  },
  tempSection: {
    flex: 1,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  tempRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 16,
  },
  tempRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempRangeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  recIcon: {
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  recMessage: {
    fontSize: 12,
    lineHeight: 18,
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
  forecastSection: {
    marginBottom: 20,
  },
  hourlyCard: {
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    marginBottom: 12,
    width: 80,
    alignItems: 'center',
    elevation: 2,
  },
  hourlyTime: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  hourlyIcon: {
    marginVertical: 6,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: '700',
  },
  hourlyRain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  hourlyRainText: {
    fontSize: 10,
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
});
