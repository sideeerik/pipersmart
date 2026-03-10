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
    textLight: '#5A7A73',
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
        console.log('MobileHeader: No token found - user logged out');
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
          console.log('MobileHeader: User loaded from AsyncStorage -', userData.name);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // Check auth status immediately on mount
    checkAuthStatus();
    
    // Subscribe to auth changes from anywhere in the app
    const unsubscribe = onAuthChange((userData) => {
      console.log('MobileHeader: Auth change detected -', userData?.name || 'logged out');
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
        console.log('fetchNotifications: User not logged in - skipping API call');
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
      const isCanceled =
        error?.name === 'AbortError' ||
        error?.name === 'CanceledError' ||
        error?.code === 'ERR_CANCELED' ||
        error?.message === 'canceled';
      // Silently fail on canceled requests - don't block UI
      if (!isCanceled) {
        console.error('⚠️ Notification fetch timeout (will retry):', error.message);
      }
      // Keep existing notifications instead of clearing
    }
  };
  const parseForumActionUrl = (actionUrl) => {
    if (!actionUrl || typeof actionUrl !== 'string') return null;

    const threadMatch =
      actionUrl.match(/\/forum\/thread\/([^\/?#]+)/i) ||
      actionUrl.match(/^forum\/thread\/([^\/?#]+)/i);
    const postMatch = actionUrl.match(/#post-([^\/?#]+)/i);

    if (!threadMatch?.[1]) return null;

    return {
      threadId: threadMatch[1],
      postId: postMatch?.[1] || null,
    };
  };

  const normalizeScreenName = (raw) => {
    if (!raw || typeof raw !== 'string') return null;

    const cleaned = raw.replace(/^\/+/, '').split(/[?#]/)[0].trim().toLowerCase();
    if (!cleaned) return null;

    const screenMap = {
      index: 'Index',
      login: 'Login',
      register: 'Register',
      userhome: 'UserHome',
      about: 'About',
      contact: 'Contact',
      piperknowledge: 'PiperKnowledge',
      profile: 'Profile',
      updateprofile: 'UpdateProfile',
      forgotpassword: 'ForgotPassword',
      changepassword: 'ChangePassword',
      weather: 'Weather',
      pipebot: 'Pipebot',
      piperbot: 'Pipebot',
      macromapping: 'Macromapping',
      leafanalysis: 'LeafAnalysis',
      bungaripeness: 'BungaRipeness',
      forum: 'Forum',
      messenger: 'Messenger',
      recentactivities: 'RecentActivities',
    };

    return screenMap[cleaned] || null;
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

      const actionUrl = notification.actionUrl;
      const forumUrlData = parseForumActionUrl(actionUrl);
      const threadId = notification.data?.threadId || notification.threadId || forumUrlData?.threadId;
      const isForumType =
        String(notification.type || '').toLowerCase() === 'forum' ||
        String(actionUrl || '').toLowerCase() === 'forum' ||
        !!forumUrlData;

      setNotificationsOpen(false);

      if (isForumType) {
        if (threadId) {
          console.log('🔗 Navigating to Forum thread:', threadId);
          navigation.navigate('Forum', {
            threadId,
            postId: forumUrlData?.postId || null,
          });
          return;
        }

        console.warn('⚠️ Forum notification missing threadId, navigating to Forum feed');
        navigation.navigate('Forum');
        return;
      }

      const mappedScreen = normalizeScreenName(actionUrl);
      if (mappedScreen) {
        console.log('🔗 Navigating to screen:', mappedScreen);
        navigation.navigate(mappedScreen);
        return;
      }

      if (actionUrl) {
        console.warn('⚠️ Unknown notification actionUrl:', actionUrl, '- fallback to UserHome');
      } else {
        console.warn('⚠️ Notification has no actionUrl or type');
      }
      navigation.navigate('UserHome');
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

  const getNotificationIcon = (notification) => {
    const type = String(notification?.type || '').toLowerCase();
    const severity = String(notification?.severity || '').toLowerCase();

    if (severity === 'critical') return 'alert-octagon';
    if (severity === 'warning') return 'alert-circle';
    if (type.includes('forum')) return 'forum';
    if (type.includes('message') || type.includes('chat')) return 'message-text';
    if (type.includes('bunga') || type.includes('pepper')) return 'sprout';
    if (type.includes('leaf')) return 'leaf';
    if (type.includes('weather')) return 'weather-partly-cloudy';
    if (type.includes('map') || type.includes('macro')) return 'map-marker-radius';
    return 'bell-ring';
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

  const filteredNotifications = notificationFilter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

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
        <Text style={[styles.drawerItemText, { color: colors.text }]}>PepperCorn Ripeness</Text>
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
        <View style={styles.notificationOverlay}>
          <TouchableOpacity
            style={styles.notificationBackdrop}
            activeOpacity={1}
            onPress={() => setNotificationsOpen(false)}
          />

          <View style={styles.notificationDropdown}>
            <View style={[styles.notificationHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>Notifications</Text>
                <Text style={[styles.notificationSubtitle, { color: colors.textLight }]}>
                  {unreadCount} unread
                </Text>
              </View>
              <TouchableOpacity onPress={() => setNotificationsOpen(false)} style={styles.notificationCloseBtn}>
                <Feather name="x" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  notificationFilter === 'all' && [styles.filterButtonActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setNotificationFilter('all')}
              >
                <Feather
                  name="list"
                  size={12}
                  color={notificationFilter === 'all' ? '#FFFFFF' : colors.textLight}
                />
                <Text style={[styles.filterButtonText, notificationFilter === 'all' && styles.filterButtonTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  notificationFilter === 'unread' && [styles.filterButtonActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setNotificationFilter('unread')}
              >
                <Feather
                  name="bell"
                  size={12}
                  color={notificationFilter === 'unread' ? '#FFFFFF' : colors.textLight}
                />
                <Text style={[styles.filterButtonText, notificationFilter === 'unread' && styles.filterButtonTextActive]}>
                  Unread
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.notificationLoader} />
            ) : filteredNotifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Feather name="bell-off" size={32} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textLight }]}>No notifications</Text>
              </View>
            ) : (
              <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                {filteredNotifications.map((notification) => (
                  <View
                    key={notification._id}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: notification.read ? '#F9FCFA' : '#EDF8F2',
                        borderLeftColor: getSeverityColor(notification.severity),
                      },
                      !notification.read && styles.notificationItemUnread,
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationIconWrap,
                        {
                          borderColor: getSeverityColor(notification.severity),
                          backgroundColor: getSeverityColor(notification.severity) + '1F',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getNotificationIcon(notification)}
                        size={18}
                        color={getSeverityColor(notification.severity)}
                      />
                    </View>

                    <View style={styles.notificationDotCol}>
                      {!notification.read ? (
                        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                      ) : (
                        <View style={styles.readDot} />
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.notificationBody}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <View style={styles.notificationTitleRow}>
                        <Text style={[styles.notificationItemTitle, { color: colors.text }]} numberOfLines={1}>
                          {notification.title}
                        </Text>
                        <View style={styles.notificationTimePill}>
                          <Text style={styles.notificationTimeText}>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.notificationItemMessage, { color: colors.textLight }]} numberOfLines={3}>
                        {notification.message}
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
        </View>
      </Modal>

      <View style={[styles.topNav, { backgroundColor: colors.primary }]}> 
        <TouchableOpacity style={styles.navButton} onPress={openDrawer}>
          <Feather name="menu" size={26} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>PiperSmart</Text>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonSoft]}
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
            style={[styles.navButton, styles.navButtonSoft]}
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
    paddingVertical: 10,
    paddingTop: 34,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 12,
    position: 'relative',
  },
  navButtonSoft: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
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
    backgroundColor: 'rgba(9, 18, 14, 0.45)',
    justifyContent: 'flex-start',
    paddingTop: 68,
    paddingHorizontal: 10,
  },
  notificationBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  notificationDropdown: {
    borderRadius: 18,
    maxHeight: '62%',
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: '#F4FAF6',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  notificationSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  notificationCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF6F2',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: '#FAFDFB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D4E3DC',
    backgroundColor: '#FFFFFF',
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
  notificationLoader: {
    marginTop: 24,
  },
  notificationsList: {
    maxHeight: 380,
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  notificationItemUnread: {
    shadowOpacity: 0.12,
    elevation: 3,
  },
  notificationDotCol: {
    width: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    marginRight: 6,
  },
  notificationIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  notificationBody: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  notificationTimePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#EAF2EE',
  },
  notificationTimeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#567369',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8E5DF',
  },
  notificationItemMessage: {
    fontSize: 11,
    lineHeight: 16,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(231,76,60,0.08)',
    marginLeft: 8,
    marginTop: 2,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
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


