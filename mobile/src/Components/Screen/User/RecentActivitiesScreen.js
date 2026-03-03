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
  FlatList,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { logout, getUser, getToken } from '../../utils/helpers';
import MobileHeader from '../../shared/MobileHeader';

const { width } = Dimensions.get('window');

const bungaLogo = require('../../../../picsbl/logowalangbg.png');

const colors = {
  primary: '#1B4D3E',
  primaryDark: '#0D2818',
  primaryLight: '#E8F5E9',
  secondary: '#FFFFFF',
  background: '#F2F4F0',
  text: '#1B4D3E',
  textLight: '#5A7A73',
  border: '#D4E5DD',
  accent: '#D4AF37',
  warning: '#F39C12',
  danger: '#E74C3C',
  success: '#27AE60',
  cardBg: '#FFFFFF',
};

export default function RecentActivitiesScreen({ navigation }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [filterSort, setFilterSort] = useState('newest'); // newest, oldest
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all'); // all, BUNGA_ANALYSIS, LEAF_ANALYSIS, FORUM_POST, SAVED_LOCATION
  const [filterExpanded, setFilterExpanded] = useState(false);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;
  const lastFetchRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchActivities(page);
  }, [page, filterSort]);

  const fetchActivities = async (pageNum) => {
    // Prevent duplicate fetches
    const fetchKey = `${pageNum}-${filterSort}`;
    if (lastFetchRef.current === fetchKey) {
      return;
    }
    lastFetchRef.current = fetchKey;

    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await axios.get(
        `${process.env.BACKEND_URL}/api/v1/activities/all?page=${pageNum}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        let sortedActivities = response.data.data.activities;
        
        // Apply sorting
        if (filterSort === 'oldest') {
          sortedActivities = sortedActivities.reverse();
        }
        
        setActivities(sortedActivities);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalActivities(response.data.data.pagination.totalActivities);
        console.log(`✅ Fetched ${sortedActivities.length} activities (Page ${pageNum})`);
      }
    } catch (error) {
      console.error('❌ Error fetching activities:', error.message);
      Alert.alert('Error', 'Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout(navigation);
        },
      },
    ]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'BUNGA_ANALYSIS':
        return { name: 'bunga', isImage: true, image: bungaLogo, color: colors.warning };
      case 'LEAF_ANALYSIS':
        return { name: 'leaf', icon: 'MaterialCommunityIcons', color: colors.success };
      case 'FORUM_POST':
        return { name: 'message-circle', icon: 'Feather', color: colors.primary };
      case 'SAVED_LOCATION':
        return { name: 'map-pin', icon: 'Feather', color: colors.danger };
      default:
        return { name: 'activity', icon: 'Feather', color: colors.textLight };
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case 'BUNGA_ANALYSIS':
        return `Bunga Analysis: ${activity.results?.ripeness || 'Unknown'} (${activity.results?.market_grade || 'N/A'})`;
      case 'LEAF_ANALYSIS':
        return `Leaf Disease: ${activity.results?.disease || 'Unknown'}`;
      case 'FORUM_POST':
        return `Forum Post in "${activity.threadId?.title || 'Unknown Thread'}"`;
      case 'SAVED_LOCATION':
        return `Saved Location: ${activity.farm.name}`;
      default:
        return 'Recent Activity';
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'BUNGA_ANALYSIS':
        return `${activity.results?.ripeness} • Health: ${activity.results?.health_class || 'N/A'} • Confidence: ${activity.results?.confidence || 0}%`;
      case 'LEAF_ANALYSIS':
        return `${activity.results?.disease || 'Unknown'} • Confidence: ${activity.results?.confidence || 0}%`;
      case 'FORUM_POST':
        return `Posted in "${activity.threadId?.title || 'Unknown Thread'}"`;
      case 'SAVED_LOCATION':
        return `${activity.farm.address || 'Location saved'} • Lat: ${activity.farm.latitude?.toFixed(4)}, Lng: ${activity.farm.longitude?.toFixed(4)}`;
      default:
        return 'Activity recorded';
    }
  };

  const getFilteredActivities = () => {
    if (activityFilter === 'all') {
      return activities;
    }
    return activities.filter(activity => activity.type === activityFilter);
  };

  const getActivityDetails = (activity) => {
    switch (activity.type) {
      case 'BUNGA_ANALYSIS':
        // Handle both new and old data structures
        const ripenessValue = typeof activity.results?.ripeness === 'object' 
          ? activity.results?.ripeness?.grade || 'Unknown' 
          : activity.results?.ripeness || 'Unknown';
        const ripenessPercent = typeof activity.results?.ripeness_percentage === 'number' 
          ? activity.results?.ripeness_percentage 
          : (activity.results?.ripeness?.percentage || 0);
        const healthPercent = typeof activity.results?.health_percentage === 'number' 
          ? activity.results?.health_percentage 
          : (activity.results?.health?.percentage || 0);
        const confidenceValue = typeof activity.results?.confidence === 'number' 
          ? activity.results?.confidence 
          : (activity.results?.ripeness?.confidence || 0);
        
        return [
          { label: 'Ripeness', value: String(ripenessValue), icon: '🍌', metric: true },
          { label: 'Ripeness %', value: `${ripenessPercent}%`, icon: '📊', percentage: ripenessPercent },
          { label: 'Health Class', value: String(activity.results?.health_class || 'N/A'), icon: '💚', metric: true },
          { label: 'Health %', value: `${healthPercent}%`, icon: '📈', percentage: healthPercent },
          { label: 'Confidence', value: `${confidenceValue}%`, icon: '🎯', percentage: confidenceValue },
          { label: 'Market Grade', value: String(activity.results?.market_grade || 'Unknown'), icon: '⭐', metric: true },
          { label: 'Scan Image', value: activity.image?.url ? 'View Image' : 'No Image', icon: '📸', isImage: true, imageUrl: activity.image?.url },
          { label: 'Processing Time', value: `${activity.processingTime || 0}ms`, icon: '⏱️', metric: true },
        ];
      case 'LEAF_ANALYSIS':
        return [
          { label: 'Disease', value: String(activity.results?.disease || 'Unknown'), icon: '🍃', metric: true },
          { label: 'Confidence', value: `${activity.results?.confidence || 0}%`, icon: '🎯', percentage: activity.results?.confidence || 0 },
          { label: 'Detections', value: `${activity.results?.detections?.length || 0} found`, icon: '🔍', metric: true },
          { label: 'Scan Image', value: activity.image?.url ? 'View Image' : 'No Image', icon: '📸', isImage: true, imageUrl: activity.image?.url },
          { label: 'Processing Time', value: `${activity.processingTime || 0}ms`, icon: '⏱️', metric: true },
        ];
      case 'FORUM_POST':
        return [
          { label: 'Thread', value: activity.threadId?.title || 'Unknown', icon: '💬', metric: true },
          { label: 'Content', value: activity.content.substring(0, 50) + (activity.content.length > 50 ? '...' : ''), icon: '📝' },
          { label: 'Category', value: activity.threadId?.category || 'General', icon: '🏷️' },
          { label: 'Replies', value: activity.threadId?.interactionCount || '0', icon: '💭' },
        ];
      case 'SAVED_LOCATION':
        return [
          { label: 'Location Name', value: activity.farm.name || 'N/A', icon: '🌾', metric: true },
          { label: 'Address', value: activity.farm.address || 'N/A', icon: '📍' },
          { label: 'Coordinates', value: `${activity.farm.latitude?.toFixed(4)}, ${activity.farm.longitude?.toFixed(4)}`, icon: '🗺️' },
        ];
      default:
        return [];
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleActivityPress = (activity) => {
    Alert.alert(
      'See Activity?',
      'Navigate to the details of this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'default',
          onPress: () => {
            switch (activity.type) {
              case 'SAVED_LOCATION':
                navigation.navigate('Macromapping', {
                  locationId: activity._id,
                  latitude: activity.farm.latitude,
                  longitude: activity.farm.longitude,
                  locationName: activity.farm.name
                });
                break;
              case 'FORUM_POST':
                navigation.navigate('Forum', { threadId: activity.threadId?._id });
                break;
              case 'BUNGA_ANALYSIS':
                navigation.navigate('BungaRipeness', { analysisId: activity._id });
                break;
              case 'LEAF_ANALYSIS':
                navigation.navigate('LeafAnalysis', { analysisId: activity._id });
                break;
              default:
                break;
            }
          }
        }
      ]
    );
  };

  const handleDeleteActivity = (activity) => {
    const activityType = activity.type === 'BUNGA_ANALYSIS' ? 'bunga' : 'leaf';
    
    Alert.alert(
      'Delete Analysis?',
      `Are you sure you want to delete this ${activityType} analysis? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from local state immediately for instant UI feedback
              setActivities(activities.filter(a => a._id !== activity._id));
              
              const token = await getToken();
              const endpoint = activity.type === 'BUNGA_ANALYSIS' 
                ? `/api/v1/predict/bunga/${activity._id}`
                : `/api/v1/predict/leaf/${activity._id}`;
              
              const response = await axios.delete(
                `${process.env.BACKEND_URL}${endpoint}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.success) {
                console.log(`✅ ${activityType} analysis deleted`);
              }
            } catch (error) {
              console.error(`❌ Error deleting ${activityType} analysis:`, error.message);
              const errorMsg = error.response?.data?.error || 'Failed to delete analysis record';
              Alert.alert('Error', errorMsg);
              // Refetch if deletion failed to restore the item
              fetchActivities(page);
            }
          }
        }
      ]
    );
  };

  const ActivityCard = ({ activity }) => {
    const iconData = getActivityIcon(activity.type);
    const Icon = iconData.icon === 'Feather' ? Feather : MaterialCommunityIcons;
    const details = getActivityDetails(activity);
    const [expanded, setExpanded] = useState(false);

    return (
      <TouchableOpacity 
        style={[
          styles.activityCard,
          expanded && styles.activityCardExpanded
        ]}
        activeOpacity={0.9}
        onPress={() => setExpanded(!expanded)}
      >
        {/* Header with icon and title */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: iconData.color + '20' }]}>
            {iconData.isImage ? (
              <Image 
                source={iconData.image} 
                style={styles.activityImage}
                resizeMode="contain"
              />
            ) : (
              <Icon name={iconData.name} size={28} color={iconData.color} />
            )}
          </View>
          
          <View style={styles.titleSection}>
            <Text style={styles.activityTitle} numberOfLines={2}>{getActivityTitle(activity)}</Text>
            <Text style={styles.activityTime}>
              {formatDate(activity.createdAt || activity.savedAt)}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.activityBadge}>
              <Text style={styles.activityType}>
                {activity.type === 'BUNGA_ANALYSIS' ? '🍌' : activity.type === 'LEAF_ANALYSIS' ? '🍃' : activity.type === 'FORUM_POST' ? '💬' : '📍'}
              </Text>
            </View>
            <MaterialCommunityIcons 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={iconData.color}
              style={styles.expandIcon}
            />
          </View>
        </View>

        {/* Description line */}
        <View style={styles.descriptionSection}>
          <Text style={styles.activityDesc}>{getActivityDescription(activity)}</Text>
        </View>

        {/* Details grid - shown when expanded */}
        {expanded && details.length > 0 && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailsDivider} />
            <View style={styles.detailsGrid}>
              {details.map((detail, idx) => (
                <View key={idx}>
                  {detail.isImage && detail.imageUrl ? (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>{detail.icon}</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{detail.label}</Text>
                        <Image 
                          source={{ uri: detail.imageUrl }} 
                          style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 8 }}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.detailItem}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailIcon}>{detail.icon}</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{detail.label}</Text>
                        {detail.percentage !== undefined ? (
                          <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${Math.min(detail.percentage, 100)}%` }]} />
                          </View>
                        ) : null}
                        <Text style={styles.detailValue}>{detail.value}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {(activity.type === 'BUNGA_ANALYSIS' || activity.type === 'LEAF_ANALYSIS') && (
                <TouchableOpacity 
                  style={[styles.actionButton, { flex: 1, backgroundColor: colors.danger }]}
                  activeOpacity={0.8}
                  onPress={() => handleDeleteActivity(activity)}
                >
                  <MaterialCommunityIcons name="trash-can" size={18} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={64} color={colors.border} />
      <Text style={styles.emptyTitle}>No Activities Yet</Text>
      <Text style={styles.emptyDesc}>
        Your recent activities will appear here. Start by analyzing leaves or saving locations!
      </Text>
    </View>
  );

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
        onLogout={handleLogout}
      />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.pageTitle}>Recent Activities</Text>
          <Text style={styles.pageSubtitle}>
            {totalActivities} activities · Showing page {page} of {totalPages}
          </Text>
        </View>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortMenuVisible(!sortMenuVisible)}
        >
          <MaterialCommunityIcons name="sort" size={20} color={colors.primary} />
          <Text style={styles.sortButtonText}>{filterSort}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {sortMenuVisible && (
        <View style={styles.sortMenu}>
          <TouchableOpacity
            style={[styles.sortOption, filterSort === 'newest' && styles.sortOptionActive]}
            onPress={() => {
              setFilterSort('newest');
              setPage(1);
              setSortMenuVisible(false);
            }}
          >
            <Text style={[styles.sortOptionText, filterSort === 'newest' && styles.sortOptionTextActive]}>
              Newest First
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, filterSort === 'oldest' && styles.sortOptionActive]}
            onPress={() => {
              setFilterSort('oldest');
              setPage(1);
              setSortMenuVisible(false);
            }}
          >
            <Text style={[styles.sortOptionText, filterSort === 'oldest' && styles.sortOptionTextActive]}>
              Oldest First
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Toggle Button */}
      <View style={styles.filterHeaderContainer}>
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setFilterExpanded(!filterExpanded)}
        >
          <MaterialCommunityIcons 
            name={filterExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.filterToggleText}>
            Filters
          </Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {activityFilter === 'all' ? 'All' : activityFilter.replace('_', ' ')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons - Vertical Toggle Layout */}
      {filterExpanded && (
        <View style={styles.filterPanelExpanded}>
          <TouchableOpacity
            style={[
              styles.filterToggle,
              activityFilter === 'all' && styles.filterToggleActive
            ]}
            onPress={() => {
              setActivityFilter('all');
              setPage(1);
              setFilterExpanded(false);
            }}
          >
            <View style={[styles.filterToggleCircle, activityFilter === 'all' && styles.filterToggleCircleActive]}>
              {activityFilter === 'all' && <View style={styles.filterToggleDot} />}
            </View>
            <Text style={[
              styles.filterToggleLabel,
              activityFilter === 'all' && styles.filterToggleLabelActive
            ]}>
              Show All Activities
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[
              styles.filterToggle,
              activityFilter === 'BUNGA_ANALYSIS' && styles.filterToggleActive
            ]}
            onPress={() => {
              setActivityFilter('BUNGA_ANALYSIS');
              setPage(1);
              setFilterExpanded(false);
            }}
          >
            <View style={[styles.filterToggleCircle, activityFilter === 'BUNGA_ANALYSIS' && styles.filterToggleCircleActive]}>
              {activityFilter === 'BUNGA_ANALYSIS' && <View style={styles.filterToggleDot} />}
            </View>
            <Text style={[
              styles.filterToggleLabel,
              activityFilter === 'BUNGA_ANALYSIS' && styles.filterToggleLabelActive
            ]}>
              🍌 Bunga Analysis
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[
              styles.filterToggle,
              activityFilter === 'LEAF_ANALYSIS' && styles.filterToggleActive
            ]}
            onPress={() => {
              setActivityFilter('LEAF_ANALYSIS');
              setPage(1);
              setFilterExpanded(false);
            }}
          >
            <View style={[styles.filterToggleCircle, activityFilter === 'LEAF_ANALYSIS' && styles.filterToggleCircleActive]}>
              {activityFilter === 'LEAF_ANALYSIS' && <View style={styles.filterToggleDot} />}
            </View>
            <Text style={[
              styles.filterToggleLabel,
              activityFilter === 'LEAF_ANALYSIS' && styles.filterToggleLabelActive
            ]}>
              🍃 Leaf Disease
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[
              styles.filterToggle,
              activityFilter === 'FORUM_POST' && styles.filterToggleActive
            ]}
            onPress={() => {
              setActivityFilter('FORUM_POST');
              setPage(1);
              setFilterExpanded(false);
            }}
          >
            <View style={[styles.filterToggleCircle, activityFilter === 'FORUM_POST' && styles.filterToggleCircleActive]}>
              {activityFilter === 'FORUM_POST' && <View style={styles.filterToggleDot} />}
            </View>
            <Text style={[
              styles.filterToggleLabel,
              activityFilter === 'FORUM_POST' && styles.filterToggleLabelActive
            ]}>
              💬 Forum Posts
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[
              styles.filterToggle,
              activityFilter === 'SAVED_LOCATION' && styles.filterToggleActive
            ]}
            onPress={() => {
              setActivityFilter('SAVED_LOCATION');
              setPage(1);
              setFilterExpanded(false);
            }}
          >
            <View style={[styles.filterToggleCircle, activityFilter === 'SAVED_LOCATION' && styles.filterToggleCircleActive]}>
              {activityFilter === 'SAVED_LOCATION' && <View style={styles.filterToggleDot} />}
            </View>
            <Text style={[
              styles.filterToggleLabel,
              activityFilter === 'SAVED_LOCATION' && styles.filterToggleLabelActive
            ]}>
              📍 Saved Locations
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Activities List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Loading activities...</Text>
          </View>
        ) : activities.length > 0 ? (
          <>
            {getFilteredActivities().map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}

            {/* Pagination Controls */}
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <Feather name="chevron-left" size={20} color={page === 1 ? colors.border : colors.primary} />
                <Text style={[styles.paginationButtonText, page === 1 && styles.paginationButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.pageIndicator}>
                <Text style={styles.pageIndicatorText}>{page} / {totalPages}</Text>
              </View>

              <TouchableOpacity
                style={[styles.paginationButton, page === totalPages && styles.paginationButtonDisabled]}
                onPress={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <Text style={[styles.paginationButtonText, page === totalPages && styles.paginationButtonTextDisabled]}>
                  Next
                </Text>
                <Feather name="chevron-right" size={20} color={page === totalPages ? colors.border : colors.primary} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: colors.textLight,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sortMenu: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activityCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityCardExpanded: {
    borderColor: colors.primary,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandIcon: {
    marginLeft: 4,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityImage: {
    width: 32,
    height: 32,
  },
  titleSection: {
    flex: 1,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
    lineHeight: 20,
  },
  activityDesc: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  descriptionSection: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
  activityBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityType: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  expandedDetails: {
    marginTop: 8,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  detailsGrid: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 2,
  },
  detailIcon: {
    fontSize: 20,
    marginTop: 2,
    minWidth: 24,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
    lineHeight: 18,
  },
  progressBarContainer: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 3.5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3.5,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 8,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  paginationButtonDisabled: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  paginationButtonTextDisabled: {
    color: colors.border,
  },
  pageIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
  },
  pageIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  filterButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  filterHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    gap: 10,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
  },
  filterBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterPanelExpanded: {
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  filterToggleActive: {
    backgroundColor: colors.primaryLight,
  },
  filterToggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterToggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  filterToggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  filterToggleLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
});
