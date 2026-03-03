import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getUser, getToken, onAuthChange } from '../utils/helpers';
import { BACKEND_URL } from 'react-native-dotenv';

export default function MobileHeader({ navigation, drawerOpen = false, openDrawer = () => {}, closeDrawer = () => {}, drawerSlideAnim, user, onLogout }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [currentUser, setCurrentUser] = useState(null); // Track logged in user
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all' or 'unread'
  const notificationAbortController = useRef(null);

  const colors = {
    primary: '#1B4D3E',
    background: '#F8FAF7',
    text: '#1B4D3E',
    border: '#D4E5DD',
    danger: '#E74C3C',
  };

  // Check if user is logged in and fetch latest user data from backend
  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      
      if (!token) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        console.log('🚪 MobileHeader: No token found - user logged out');
        return;
      }

      // Fetch latest user data from backend (includes avatar from MongoDB)
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        
        const userData = response.data.user;
        setIsLoggedIn(true);
        setCurrentUser(userData);
      } catch (backendError) {
        // Fallback to AsyncStorage if backend fails
        const userData = await getUser();
        if (userData) {
          setIsLoggedIn(true);
          setCurrentUser(userData);
          console.log('✅ MobileHeader: User loaded from AsyncStorage -', userData.name);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // Check auth status immediately on mount
    checkAuthStatus();
    
    // Subscribe to auth changes from anywhere in the app
    const unsubscribe = onAuthChange((userData) => {
      console.log('📡 MobileHeader: Auth change detected -', userData?.name || 'logged out');
      if (userData) {
        setIsLoggedIn(true);
        setCurrentUser(userData);
        // Refresh from backend to get latest avatar
        checkAuthStatus();
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });
    
    // ONLY fetch notifications if user is logged in
    let initialFetchTimeout;
    let notificationInterval;
    
    if (isLoggedIn) {
      // Fetch notifications after 2 seconds (non-blocking)
      initialFetchTimeout = setTimeout(() => {
        fetchNotifications();
      }, 2000);
      
      // Poll notifications every 60 seconds (only if logged in)
      notificationInterval = setInterval(() => {
        fetchNotifications();
      }, 60000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    
    // Cleanup
    return () => {
      unsubscribe();
      if (notificationInterval) clearInterval(notificationInterval);
      if (initialFetchTimeout) clearTimeout(initialFetchTimeout);
      if (notificationAbortController.current) {
        notificationAbortController.current.abort();
      }
    };
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    try {
      // SAFETY CHECK: Don't fetch if user is not logged in
      if (!isLoggedIn) {
        console.log('⚠️ fetchNotifications: User not logged in - skipping API call');
        return;
      }

      // Cancel previous request if still pending
      if (notificationAbortController.current) {
        notificationAbortController.current.abort();
      }

      // Create new abort controller for this request
      notificationAbortController.current = new AbortController();

      const response = await axios.get(`${BACKEND_URL}/api/v1/notifications`, {
        signal: notificationAbortController.current.signal,
        timeout: 8000 // 8 second timeout
      });
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      // Silently fail on timeout - don't block UI
      if (error.name !== 'AbortError') {
        console.error('⚠️ Notification fetch timeout (will retry):', error.message);
      }
      // Keep existing notifications instead of clearing
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/v1/notifications/${notificationId}/read`, {}, {
        timeout: 8000
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/v1/notifications/${notificationId}`, {
        timeout: 8000
      });
      fetchNotifications();
      setLoading(false);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setLoading(false);
    }
  };

  const handleNotificationPress = (notification) => {
    try {
      if (!notification.read) {
        markAsRead(notification._id);
      }
      
      // Handle Forum notifications with threadId
      if (notification.actionUrl === 'Forum' || notification.type === 'forum') {
        const threadId = notification.data?.threadId || notification.threadId;
        
        if (threadId) {
          console.log('🔗 Navigating to Forum thread:', threadId);
          setNotificationsOpen(false);
          // Navigate to Forum screen with threadId param to trigger deep linking
          navigation.navigate('Forum', { threadId });
        } else {
          console.warn('⚠️ Forum notification missing threadId, navigating to Forum feed');
          setNotificationsOpen(false);
          navigation.navigate('Forum');
        }
      } else if (notification.actionUrl) {
        // Handle other notification types
        console.log('🔗 Navigating to:', notification.actionUrl);
        setNotificationsOpen(false);
        navigation.navigate(notification.actionUrl);
      } else {
        console.warn('⚠️ Notification has no actionUrl or type');
        setNotificationsOpen(false);
      }
    } catch (error) {
      console.error('❌ Error handling notification press:', error);
      setNotificationsOpen(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return colors.danger;
      case 'warning':
        return '#F39C12';
      default:
        return colors.primary;
    }
  };

  const handleProtectedNavigation = async (screenName) => {
    try {
      // Check both prop 'user' and internal state 'isLoggedIn'
      if (!user && !isLoggedIn) {
        Alert.alert(
          'Login Required',
          'Please log in to access this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Login',
              onPress: () => {
                closeDrawer();
                navigation.navigate('Login');
              },
            },
          ]
        );
      } else {
        closeDrawer();
        navigation.navigate(screenName);
      }
    } catch (error) {
      closeDrawer();
      navigation.navigate(screenName);
    }
  };

  const navigationView = (
    <View style={[styles.drawer, { backgroundColor: colors.background }]}> 
      <View style={[styles.drawerHeader, { backgroundColor: colors.primary }]}> 
        <Text style={styles.drawerHeaderText}>PiperSmart</Text>
        <Text style={styles.drawerHeaderSubtext}>Menu</Text>
      </View>

      {/* HOME */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('UserHome')}
      >
        <Feather name="home" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Home</Text>
      </TouchableOpacity>

      {/* ABOUT US */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => {
          closeDrawer();
          navigation.navigate('About');
        }}
      >
        <Feather name="info" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>About Us</Text>
      </TouchableOpacity>

      {/* KNOWLEDGE & LEARNING */}
      <View style={[styles.drawerSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.drawerSectionTitle, { color: colors.textLight }]}>LEARNING</Text>
      </View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('PiperKnowledge')}
      >
        <Feather name="book" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Piper Knowledge</Text>
      </TouchableOpacity>

      {/* ANALYSIS TOOLS */}
      <View style={[styles.drawerSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.drawerSectionTitle, { color: colors.textLight }]}>ANALYSIS</Text>
      </View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('LeafAnalysis')}
      >
        <Feather name="camera" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Leaf Analysis</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('BungaRipeness')}
      >
        <Feather name="aperture" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Bunga Ripeness</Text>
      </TouchableOpacity>

      {/* FARMING & COMMUNITY */}
      <View style={[styles.drawerSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.drawerSectionTitle, { color: colors.textLight }]}>FARMING</Text>
      </View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('Macromapping')}
      >
        <Feather name="map" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Farming Macromapping</Text>
      </TouchableOpacity>

      {/* COMMUNITY & COMMUNICATION */}
      <View style={[styles.drawerSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.drawerSectionTitle, { color: colors.textLight }]}>COMMUNITY</Text>
      </View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('Forum')}
      >
        <Feather name="message-circle" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Community Forum</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('Messenger')}
      >
        <Feather name="message-square" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('Pipebot')}
      >
        <MaterialCommunityIcons name="robot" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>PiperBot</Text>
      </TouchableOpacity>

      {/* ACTIVITIES & TRACKING */}
      <View style={[styles.drawerSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.drawerSectionTitle, { color: colors.textLight }]}>TRACKING</Text>
      </View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => handleProtectedNavigation('RecentActivities')}
      >
        <Feather name="activity" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Recent Activities</Text>
      </TouchableOpacity>

      {/* SUPPORT */}
      <View style={[styles.drawerSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.drawerSectionTitle, { color: colors.textLight }]}>SUPPORT</Text>
      </View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => {
          closeDrawer();
          navigation.navigate('Contact');
        }}
      >
        <Feather name="mail" size={20} color={colors.primary} />
        <Text style={[styles.drawerItemText, { color: colors.text }]}>Contact Us</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      {isLoggedIn && currentUser && (
        <TouchableOpacity
          style={[styles.drawerItem, styles.drawerProfile]}
          onPress={async () => {
            closeDrawer();
            navigation.navigate('Profile');
          }}
        >
          <Feather name="user" size={20} color={colors.primary} />
          <Text style={[styles.drawerItemText, { color: colors.text }]}>
            {currentUser.name}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.drawerLogout, { borderTopColor: colors.border }]}
        onPress={() => {
          closeDrawer();
          if (onLogout) onLogout();
        }}
      >
        <Feather name="log-out" size={20} color={colors.danger} />
        <Text style={[styles.drawerLogoutText, { color: colors.danger }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal
        visible={drawerOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent={true}
      >
        <View style={styles.drawerOverlay}>
          <Animated.View
            style={[
              styles.drawer,
              {
                backgroundColor: colors.background,
                transform: [{ translateX: drawerSlideAnim || slideAnim }],
              },
            ]}
          >
            <ScrollView>{navigationView}</ScrollView>
          </Animated.View>
          <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={closeDrawer} />
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <TouchableOpacity
          style={styles.notificationOverlay}
          activeOpacity={1}
          onPress={() => setNotificationsOpen(false)}
        >
          <View style={[styles.notificationDropdown, { backgroundColor: '#FFFFFF' }]}>
            <View style={[styles.notificationHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotificationsOpen(false)}>
                <Feather name="x" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  notificationFilter === 'all' && [styles.filterButtonActive, { backgroundColor: colors.primary }]
                ]}
                onPress={() => setNotificationFilter('all')}
              >
                <Text style={[styles.filterButtonText, notificationFilter === 'all' && styles.filterButtonTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  notificationFilter === 'unread' && [styles.filterButtonActive, { backgroundColor: colors.primary }]
                ]}
                onPress={() => setNotificationFilter('unread')}
              >
                <Text style={[styles.filterButtonText, notificationFilter === 'unread' && styles.filterButtonTextActive]}>
                  Unread
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (notificationFilter === 'unread' ? notifications.filter(n => !n.read) : notifications).length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Feather name="bell-off" size={32} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textLight }]}>No notifications</Text>
              </View>
            ) : (
              <ScrollView style={styles.notificationsList}>
                {(notificationFilter === 'unread' ? notifications.filter(n => !n.read) : notifications).map((notification) => (
                  <View
                    key={notification._id}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: notification.read ? '#F8FAF7' : '#E8F5E9',
                        borderLeftColor: getSeverityColor(notification.severity),
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <Text style={[styles.notificationItemTitle, { color: colors.text }]}>
                        {notification.title}
                        {!notification.read && (
                          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        )}
                      </Text>
                      <Text style={[styles.notificationItemMessage, { color: colors.textLight }]}>
                        {notification.message}
                      </Text>
                      <Text style={[styles.notificationTime, { color: colors.textLight }]}>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteNotification(notification._id)}
                      style={styles.deleteButton}
                    >
                      <Feather name="trash-2" size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={[styles.topNav, { backgroundColor: colors.primary }]}> 
        <TouchableOpacity style={styles.navButton} onPress={openDrawer}>
          <Feather name="menu" size={26} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>PiperSmart</Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={async () => {
              if (!user) {
                Alert.alert(
                  'Login Required',
                  'Please log in to view notifications.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Login',
                      onPress: () => navigation.navigate('Login'),
                    },
                  ]
                );
              } else {
                setNotificationsOpen(true);
              }
            }}
          >
            <Feather name="bell" size={24} color="#FFFFFF" strokeWidth={2} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={async () => {
              if (isLoggedIn && currentUser) {
                navigation.navigate('Profile');
              } else {
                navigation.navigate('Register');
              }
            }}
          >
            {isLoggedIn && currentUser ? (
              // Logged in: Show user's profile picture or fallback to letter
              currentUser.avatar?.url ? (
                <Image
                  source={{ uri: currentUser.avatar.url }}
                  style={[styles.userAvatarImage, { borderColor: colors.primary }]}
                />
              ) : (
                <View style={[styles.userAvatarCircle, { backgroundColor: colors.primary }]}>
                  <Text style={styles.userAvatarText}>
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )
            ) : (
              // Logged out: Show generic user icon
              <Feather name="user" size={24} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 35,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 8,
  },
  notificationDropdown: {
    borderRadius: 12,
    maxHeight: '50%',
    elevation: 5,
    overflow: 'hidden',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterButtonActive: {
    borderColor: 'transparent',
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  notificationItemTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 6,
  },
  notificationItemMessage: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 14,
  },
  notificationTime: {
    fontSize: 8,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 6,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawer: {
    width: 280,
    height: '100%',
    paddingTop: 0,
    paddingBottom: 20,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 8,
  },
  drawerHeaderText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  drawerHeaderSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  drawerSection: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  drawerSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 16,
  },
  drawerProfile: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  drawerLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 16,
  },
  userAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

