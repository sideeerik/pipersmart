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
  Modal,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { logout, getUser } from '../../utils/helper';
import MobileHeader from '../../shared/MobileHeader';

const { width } = Dimensions.get('window');

// Filter options handled via right-side drawer: 'all' or 'friends'

// Black Pepper Keywords for validation
const BLACK_PEPPER_KEYWORDS = [
  'black pepper', 'pepper', 'piper', 'disease', 'farming', 'cultivat', 'plant',
  'ripeness', 'harvest', 'pest', 'soil', 'water', 'fertili', 'pest management',
  'bunga', 'leaf', 'ripe', 'unripe', 'yield', 'crop'
];

// Bad words list (basic, add more as needed)
const BAD_WORDS = [
  'hate', 'kill', 'stupid', 'idiot', 'damn', 'hell', 'crap'
];

const validateContent = (content) => {
  if (!content.trim()) {
    return { isValid: false, message: 'Content cannot be empty' };
  }

  // Check for bad words
  const lowerContent = content.toLowerCase();
  const foundBadWords = BAD_WORDS.filter(word => lowerContent.includes(word));
  if (foundBadWords.length > 0) {
    return {
      isValid: false,
      message: `⚠️ Inappropriate language detected. Please keep discussions respectful.`
    };
  }

  // Check for black pepper keywords
  const hasKeywords = BLACK_PEPPER_KEYWORDS.some(keyword =>
    lowerContent.toLowerCase().includes(keyword)
  );
  if (!hasKeywords) {
    return {
      isValid: false,
      message: '⚠️ Post should be related to black pepper farming. Include topics like diseases, practices, harvest, pests, or soil.'
    };
  }

  return { isValid: true, message: '✅ Content looks good!' };
};

export default function ForumScreen({ navigation, route }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' or 'friends'
  const [user, setUser] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [threadDetailVisible, setThreadDetailVisible] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadPosts, setThreadPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadDesc, setNewThreadDesc] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [replyImages, setReplyImages] = useState([]);
  const [newThreadImages, setNewThreadImages] = useState([]);
  const [postingThread, setPostingThread] = useState(false);
  const [postingReply, setPostingReply] = useState(false);
  const [openMenuThreadId, setOpenMenuThreadId] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedThreadForAction, setSelectedThreadForAction] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [interestedThreads, setInterestedThreads] = useState([]);
  const [uninterestedThreads, setUninterestedThreads] = useState([]);
  const [savedThreads, setSavedThreads] = useState([]);
  const [tabLoading, setTabLoading] = useState({
    interested: false,
    uninterested: false,
    saved: false,
    users: false
  });
  const [allUsers, setAllUsers] = useState([]);
  const [sendingFriendRequest, setSendingFriendRequest] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  
  // Restore Main Menu Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;

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
    initializeScreen();
  }, []);

  useEffect(() => {
    if (route?.params?.threadId) {
      const { threadId } = route.params;
      console.log('🔗 Deep linking to thread:', threadId);
      setThreadDetailVisible(true);
      fetchThreadDetail(threadId);
      navigation.setParams({ threadId: null });
    }
  }, [route?.params?.threadId]);

  useEffect(() => {
    fetchFeed();
  }, [filterType]);

  const initializeScreen = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error initializing forum:', error);
    }
  };

  const toggleFabMenu = () => {
    const toValue = fabMenuOpen ? 0 : 1;
    
    Animated.spring(fabAnimation, {
      toValue,
      friction: 6,
      tension: 60,
      useNativeDriver: true
    }).start();
    
    setFabMenuOpen(!fabMenuOpen);
  };

  const handleFabAction = (action) => {
    // Close menu first
    toggleFabMenu();
    
    // Perform action
    switch(action) {
      case 'create':
        setCreateModalVisible(true);
        break;
      case 'feed':
        setActiveTab('feed');
        fetchFeed();
        break;
      case 'interested':
        setActiveTab('interested');
        fetchInterestedThreads();
        break;
      case 'uninterested':
        setActiveTab('uninterested');
        fetchUninterestedThreads();
        break;
      case 'saved':
        setActiveTab('saved');
        fetchSavedThreads();
        break;
      case 'users':
        setActiveTab('users');
        fetchAllUsers();
        break;
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      console.log('📱 Fetching feed (filterType: ' + filterType + ')');
      
      const response = await axios.get('/api/v1/forum/feed', {
        params: { filterType },
        timeout: 10000  // 10 second timeout - faster feedback
      });
      
      console.log('✅ Feed loaded:', response.data?.data?.length, 'items');
      setFeed(response.data?.data || []);
    } catch (error) {
      console.error('❌ Error fetching feed:', error.message);
      if (user) {
        Alert.alert('Error', 'Failed to load feed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetail = async (threadId, retryCount = 0) => {
    try {
      setLoadingPosts(true);
      console.log('📖 Fetching thread details:', threadId);
      const response = await axios.get(`/api/v1/forum/threads/${threadId}`, { 
        timeout: 30000
      });
      console.log('✅ Thread loaded successfully with', response.data?.data?.posts?.length, 'posts');
      
      if (response.data?.data) {
        setSelectedThread(response.data.data.thread);
        setThreadPosts(response.data.data.posts || []);
      }
    } catch (error) {
      console.error('❌ Error fetching thread:', error.message);
      
      // Retry logic
      if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && retryCount < 1) {
        console.warn('⚠️ Timeout - Retrying... (Attempt ' + (retryCount + 2) + '/2)');
        setTimeout(() => {
          fetchThreadDetail(threadId, retryCount + 1);
        }, 1000);
        return;
      }

      if (user) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          Alert.alert('Connection Timeout', 'Failed to load thread details. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to load thread details');
        }
      }
    } finally {
      setLoadingPosts(false);
    }
  };


  const handleCreateThread = async () => {
    try {
      // Validate title
      if (!newThreadTitle.trim()) {
        Alert.alert('Validation', 'Please enter a thread title');
        return;
      }

      // Validate description
      const validation = validateContent(newThreadDesc);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.message);
        return;
      }

      setPostingThread(true);
      let response;
      if (newThreadImages.length > 0) {
        const form = new FormData();
        form.append('title', newThreadTitle);
        form.append('description', newThreadDesc);
        form.append('category', 'General');
        form.append('status', 'published');
        newThreadImages.forEach((img) => {
          form.append('images', {
            uri: img.uri,
            name: img.name || `image_${Date.now()}.jpg`,
            type: img.type || 'image/jpeg',
          });
        });
        response = await axios.post('/api/v1/forum/threads', form, {
          timeout: 20000
        });
      } else {
        response = await axios.post(
          '/api/v1/forum/threads',
          {
            title: newThreadTitle,
            description: newThreadDesc,
            category: 'General',
            status: 'published'
          },
          { timeout: 15000 }
        );
      }

      Alert.alert('Success', '🎉 Thread posted successfully!');
      setCreateModalVisible(false);
      setNewThreadTitle('');
      setNewThreadDesc('');
      setNewThreadImages([]);
      fetchFeed();
    } catch (error) {
      console.error('Error creating thread:', error);
      if (user) {
        const message = error.response?.data?.message || 'Failed to create thread';
        Alert.alert('Error', message);
      }
    } finally {
      setPostingThread(false);
    }
  };

  const pickThreadImagesFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
      let result;
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          quality: 0.8,
          selectionLimit: 10
        });
      } catch (err) {
        console.error('launchImageLibraryAsync (multi) error:', err);
        try {
          result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            quality: 0.8
          });
        } catch (err2) {
          console.error('launchImageLibraryAsync (fallback single) error:', err2);
          result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8
          });
        }
      }
      if (!result.canceled) {
        const assets = result.assets || [];
        const mapped = assets.map((a) => ({
          uri: a.uri,
          name: a.fileName || `image_${Date.now()}.jpg`,
          type: a.mimeType || a.type || 'image/jpeg'
        }));
        setNewThreadImages((prev) => {
          const combined = [...prev, ...mapped];
          return combined.slice(0, 10);
        });
      }
    } catch (e) {
      console.error('pickThreadImagesFromGallery error:', e);
      Alert.alert('Error', e?.message || 'Failed to pick images');
    }
  };

  const pickThreadImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow camera access.');
        return;
      }
      let result;
      try {
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
        });
      } catch (err) {
        console.error('launchCameraAsync error:', err);
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
        });
      }
      if (!result.canceled) {
        const asset = (result.assets && result.assets[0]) || null;
        if (asset) {
          const mapped = {
            uri: asset.uri,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            type: asset.mimeType || asset.type || 'image/jpeg'
          };
          setNewThreadImages((prev) => {
            const combined = [...prev, mapped];
          return combined.slice(0, 10);
          });
        }
      }
    } catch (e) {
      console.error('pickThreadImageFromCamera error:', e);
      Alert.alert('Error', e?.message || 'Failed to capture image');
    }
  };

  const removeThreadImageAt = (idx) => {
    setNewThreadImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateReply = async () => {
    try {
      const validation = validateContent(newPostContent);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.message);
        return;
      }

      setPostingReply(true);
      let response;
      if (replyImages.length > 0) {
        const form = new FormData();
        form.append('content', newPostContent);
        form.append('status', 'published');
        replyImages.forEach((img) => {
          form.append('images', {
            uri: img.uri,
            name: img.name || `image_${Date.now()}.jpg`,
            type: img.type || 'image/jpeg',
          });
        });
        response = await axios.post(
          `/api/v1/forum/threads/${selectedThread._id}/posts`,
          form,
          { timeout: 20000 }
        );
      } else {
        response = await axios.post(
          `/api/v1/forum/threads/${selectedThread._id}/posts`,
          { content: newPostContent, status: 'published' },
          { timeout: 15000 }
        );
      }

      Alert.alert('Success', '✅ Reply posted!');
      setNewPostContent('');
      setReplyImages([]);
      fetchThreadDetail(selectedThread._id);
    } catch (error) {
      console.error('Error creating reply:', error);
      if (user) {
        Alert.alert('Error', 'Failed to post reply');
      }
    } finally {
      setPostingReply(false);
    }
  };

  const pickReplyImagesFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
      let result;
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          quality: 0.8,
          selectionLimit: 10
        });
      } catch (err) {
        console.error('launchImageLibraryAsync (reply multi) error:', err);
        try {
          result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            quality: 0.8
          });
        } catch (err2) {
          console.error('launchImageLibraryAsync (reply fallback single) error:', err2);
          result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8
          });
        }
      }
      if (!result.canceled) {
        const assets = result.assets || [];
        const mapped = assets.map((a) => ({
          uri: a.uri,
          name: a.fileName || `image_${Date.now()}.jpg`,
          type: a.mimeType || a.type || 'image/jpeg'
        }));
        setReplyImages((prev) => {
          const combined = [...prev, ...mapped];
          return combined.slice(0, 10);
        });
      }
    } catch (e) {
      console.error('pickReplyImagesFromGallery error:', e);
      Alert.alert('Error', e?.message || 'Failed to pick images');
    }
  };

  const pickReplyImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow camera access.');
        return;
      }
      let result;
      try {
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
        });
      } catch (err) {
        console.error('launchCameraAsync (reply) error:', err);
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
        });
      }
      if (!result.canceled) {
        const asset = (result.assets && result.assets[0]) || null;
        if (asset) {
          const mapped = {
            uri: asset.uri,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            type: asset.mimeType || asset.type || 'image/jpeg'
          };
          setReplyImages((prev) => {
            const combined = [...prev, mapped];
            return combined.slice(0, 10);
          });
        }
      }
    } catch (e) {
      console.error('pickReplyImageFromCamera error:', e);
      Alert.alert('Error', e?.message || 'Failed to capture image');
    }
  };

  const removeReplyImageAt = (idx) => {
    setReplyImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const renderImageGrid = (images, customWidth) => {
    const arr = Array.isArray(images) ? images : [];
    const urls = arr.map((img) => (img.url ? img.url : img.uri ? img.uri : img));
    if (urls.length === 0) return null;

    // Use customWidth if provided, otherwise default to feed card width
    // Feed card: width - 24 (screen padding) - 32 (card padding) = width - 56
    const availableWidth = customWidth || (width - 56);
    
    // Facebook styles adaptation:
    // We'll use a standard gap of 2.
    const gap = 4;
    
    if (urls.length === 1) {
      // Style 1: 1 image (Ratio 1:1 or original, let's keep it simple rectangular)
      return (
        <View style={styles.imageGridRow}>
          <Image source={{ uri: urls[0] }} style={{ width: availableWidth, height: availableWidth, borderRadius: 8 }} resizeMode="cover" />
        </View>
      );
    }
    
    if (urls.length === 2) {
      // Style 2: 2 images (Side by side, Ratio 1:1 each roughly)
      const itemWidth = (availableWidth - gap) / 2;
      return (
        <View style={[styles.imageGridRow, { flexDirection: 'row', gap }]}>
          <Image source={{ uri: urls[0] }} style={{ width: itemWidth, height: itemWidth, borderRadius: 8 }} resizeMode="cover" />
          <Image source={{ uri: urls[1] }} style={{ width: itemWidth, height: itemWidth, borderRadius: 8 }} resizeMode="cover" />
        </View>
      );
    }
    
    if (urls.length === 3) {
      // Style 6: 3 images (Left big vertical, Right two stacked)
      // Left width approx 2/3 or 1/2? Facebook Style 6 is usually 1 big left, 2 small right.
      // Let's do 50% split for simplicity or 60/40. 
      // Common FB style: Left is vertical rectangle, Right is two squares.
      const colWidth = (availableWidth - gap) / 2;
      return (
        <View style={[styles.imageGridRow, { flexDirection: 'row', gap, height: availableWidth }]}>
          <Image source={{ uri: urls[0] }} style={{ width: colWidth, height: '100%', borderRadius: 8 }} resizeMode="cover" />
          <View style={{ width: colWidth, gap, height: '100%' }}>
            <Image source={{ uri: urls[1] }} style={{ width: '100%', flex: 1, borderRadius: 8 }} resizeMode="cover" />
            <Image source={{ uri: urls[2] }} style={{ width: '100%', flex: 1, borderRadius: 8 }} resizeMode="cover" />
          </View>
        </View>
      );
    }
    
    if (urls.length === 4) {
      // Style 8: 4 images (2x2 Grid)
      const itemWidth = (availableWidth - gap) / 2;
      return (
        <View style={[styles.imageGridRow, { gap }]}>
          <View style={{ flexDirection: 'row', gap }}>
            <Image source={{ uri: urls[0] }} style={{ width: itemWidth, height: itemWidth, borderRadius: 8 }} resizeMode="cover" />
            <Image source={{ uri: urls[1] }} style={{ width: itemWidth, height: itemWidth, borderRadius: 8 }} resizeMode="cover" />
          </View>
          <View style={{ flexDirection: 'row', gap }}>
            <Image source={{ uri: urls[2] }} style={{ width: itemWidth, height: itemWidth, borderRadius: 8 }} resizeMode="cover" />
            <Image source={{ uri: urls[3] }} style={{ width: itemWidth, height: itemWidth, borderRadius: 8 }} resizeMode="cover" />
          </View>
        </View>
      );
    }
    
    // 5 or more images
    // Style: Top half split in 2, Bottom half split in 3? Or 2x2 with last one having overlay.
    // Facebook Style for 5+: Usually 2 top (side by side), 3 bottom (side by side).
    // Or 1 big top, 3 small bottom.
    // Let's go with 2 top (squares), 3 bottom (squares).
    // Wait, the user prompt showed "Style 10 | 4 images" which is 1 top, 3 bottom.
    // Let's stick to a robust 2 top, 3 bottom layout for 5+ images to handle "and so on".
    
    // Actually, common "5+" layout: 
    // Row 1: 2 images (50% w each)
    // Row 2: 3 images (33% w each) - last one has overlay.
    
    const count = urls.length;
    const topRowH = availableWidth * 0.6;
    const botRowH = availableWidth * 0.4; // slightly shorter row
    
    const topItemW = (availableWidth - gap) / 2;
    const botItemW = (availableWidth - gap * 2) / 3;
    
    return (
      <View style={[styles.imageGridRow, { gap }]}>
        <View style={{ flexDirection: 'row', gap, height: topRowH }}>
          <Image source={{ uri: urls[0] }} style={{ width: topItemW, height: '100%', borderRadius: 8 }} resizeMode="cover" />
          <Image source={{ uri: urls[1] }} style={{ width: topItemW, height: '100%', borderRadius: 8 }} resizeMode="cover" />
        </View>
        <View style={{ flexDirection: 'row', gap, height: botItemW }}> 
          <Image source={{ uri: urls[2] }} style={{ width: botItemW, height: '100%', borderRadius: 8 }} resizeMode="cover" />
          <Image source={{ uri: urls[3] }} style={{ width: botItemW, height: '100%', borderRadius: 8 }} resizeMode="cover" />
          <View style={{ width: botItemW, height: '100%' }}>
            <Image source={{ uri: urls[4] }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
            {count > 5 && (
              <View style={[styles.imageOverlay, { borderRadius: 8 }]}>
                <Text style={styles.imageOverlayText}>+{count - 5}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const handleLikeThread = async (threadId) => {
    try {
      await axios.post(
        `/api/v1/forum/threads/${threadId}/like`,
        {},
        { timeout: 15000 }
      );
      fetchFeed();
      if (selectedThread?._id === threadId) {
        fetchThreadDetail(threadId);
      }
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await axios.post(
        `/api/v1/forum/posts/${postId}/like`,
        {},
        { timeout: 15000 }
      );
      if (selectedThread) {
        fetchThreadDetail(selectedThread._id);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Clear interaction (Remove Interest / Restore Interest)
  const handleClearInteraction = async (threadId) => {
    try {
      await axios.delete(
        `/api/v1/forum/threads/${threadId}/interaction`,
        { timeout: 15000 }
      );
      console.log('✅ Interaction cleared for thread', threadId);

      // If in 'interested' tab (Remove Interest), remove from list
      if (activeTab === 'interested') {
        setInterestedThreads(prev => prev.filter(t => t._id !== threadId));
      }
      // If in 'uninterested' tab (Restore Interest), remove from list
      else if (activeTab === 'uninterested') {
        setUninterestedThreads(prev => prev.filter(t => t._id !== threadId));
      }
      
      Alert.alert('Success', '✅ Post status reset');
    } catch (error) {
      console.error('❌ Error clearing interaction:', error.message);
      Alert.alert('Error', 'Failed to update post status');
    }
  };

  const handleMarkInterested = async (threadId) => {
    try {
      await axios.post(
        `/api/v1/forum/threads/${threadId}/interested`,
        {},
        { timeout: 15000 }
      );
      console.log('✅ Thread marked as interested');

      // If in feed, DO NOT remove it (it stays, just marked interested)
      
      Alert.alert('Success', '✅ Post marked as interesting!');
    } catch (error) {
      console.error('❌ Error marking interested:', error.message);
      Alert.alert('Error', 'Failed to mark as interested');
    }
  };

  const handleMarkUninterested = async (threadId) => {
    try {
      await axios.post(
        `/api/v1/forum/threads/${threadId}/uninterested`,
        {},
        { timeout: 15000 }
      );
      console.log('✅ Thread marked as uninterested');

      // If in feed, REMOVE it
      if (activeTab === 'feed') {
        setFeed(prev => prev.filter(t => t._id !== threadId));
      }
      
      Alert.alert('Success', '➖ Post marked as not interesting');
    } catch (error) {
      console.error('❌ Error marking uninterested:', error.message);
      Alert.alert('Error', 'Failed to mark as uninterested');
    }
  };

  const handleSavePost = async (threadId) => {
    try {
      await axios.post(
        `/api/v1/forum/threads/${threadId}/save`,
        {},
        { timeout: 15000 }
      );
      console.log('✅ Thread saved');
      
      // If in saved tab (Unsave), remove it
      if (activeTab === 'saved') {
        setSavedThreads(prev => prev.filter(t => t._id !== threadId));
      }
      // If in feed, keep it there
      
      Alert.alert('Success', '🔖 Post saved/unsaved!');
    } catch (error) {
      console.error('❌ Error saving post:', error.message);
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const handleSubmitReport = async () => {
    try {
      if (!reportReason.trim()) {
        Alert.alert('Required', 'Please provide a reason for the report');
        return;
      }

      setSubmittingReport(true);

      await axios.post(
        `/api/v1/forum/threads/${selectedThreadForAction._id}/report`,
        { reason: reportReason },
        { timeout: 15000 }
      );

      console.log('✅ Report submitted');
      Alert.alert('Success', '🚩 Report submitted successfully!');
      setReportModalVisible(false);
      setReportReason('');
      setSelectedThreadForAction(null);
    } catch (error) {
      console.error('❌ Error submitting report:', error.message);
      const errorMsg = error.response?.data?.message || 'Failed to submit report';
      Alert.alert('Error', errorMsg);
    } finally {
      setSubmittingReport(false);
    }
  };

  // ============ FETCH INTERESTED THREADS ============
  const fetchInterestedThreads = async () => {
    try {
      setTabLoading(prev => ({ ...prev, interested: true }));
      console.log('📌 Fetching interested threads...');
      
      const response = await axios.get('/api/v1/forum/threads/interested/all', {
        timeout: 10000
      });
      
      console.log('✅ Interested threads loaded:', response.data?.data?.length || 0, 'items');
      setInterestedThreads(response.data?.data || []);
    } catch (error) {
      console.error('❌ Error fetching interested threads:', error.message);
      if (user) {
        Alert.alert('Error', 'Failed to load interested posts');
      }
    } finally {
      setTabLoading(prev => ({ ...prev, interested: false }));
    }
  };

  // ============ FETCH UNINTERESTED THREADS ============
  const fetchUninterestedThreads = async () => {
    try {
      setTabLoading(prev => ({ ...prev, uninterested: true }));
      console.log('❌ Fetching uninterested threads...');
      
      const response = await axios.get('/api/v1/forum/threads/uninterested/all', {
        timeout: 10000
      });
      
      console.log('✅ Uninterested threads loaded:', response.data?.data?.length || 0, 'items');
      setUninterestedThreads(response.data?.data || []);
    } catch (error) {
      console.error('❌ Error fetching uninterested threads:', error.message);
      if (user) {
        Alert.alert('Error', 'Failed to load uninterested posts');
      }
    } finally {
      setTabLoading(prev => ({ ...prev, uninterested: false }));
    }
  };

  // ============ FETCH SAVED THREADS ============
  const fetchSavedThreads = async () => {
    try {
      setTabLoading(prev => ({ ...prev, saved: true }));
      console.log('🔖 Fetching saved threads...');
      
      const response = await axios.get('/api/v1/forum/saved-threads', {
        timeout: 10000
      });
      
      console.log('✅ Saved threads loaded:', response.data?.data?.length || 0, 'items');
      setSavedThreads(response.data?.data || []);
    } catch (error) {
      console.error('❌ Error fetching saved threads:', error.message);
      if (user) {
        Alert.alert('Error', 'Failed to load saved posts');
      }
    } finally {
      setTabLoading(prev => ({ ...prev, saved: false }));
    }
  };

  // ============ FETCH ALL USERS ============
  const fetchAllUsers = async (search = '') => {
    try {
      setTabLoading(prev => ({ ...prev, users: true }));
      console.log('👥 Fetching all users with search:', search);
      
      const response = await axios.get('/api/v1/users/all-users', {
        params: { search },
        timeout: 10000
      });
      
      console.log('✅ Users loaded:', response.data?.data?.length || 0, 'users');
      setAllUsers(response.data?.data || []);
    } catch (error) {
      console.error('❌ Error fetching users:', error.message);
      if (user) {
        Alert.alert('Error', 'Failed to load users');
      }
    } finally {
      setTabLoading(prev => ({ ...prev, users: false }));
    }
  };

  // ============ SEND FRIEND REQUEST ============
  const handleSendFriendRequest = async (userId, userName) => {
    try {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: true }));
      
      await axios.post(
        `/api/v1/users/friend-request/${userId}`,
        {},
        { timeout: 15000 }
      );
      
      Alert.alert('Success', `Friend request sent to ${userName}`);
      
      // Update user status in list
      setAllUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, friendStatus: 'pending_sent' } : u
      ));
    } catch (error) {
      console.error('❌ Error sending friend request:', error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send friend request');
    } finally {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  // ============ CANCEL FRIEND REQUEST ============
  const handleCancelFriendRequest = async (userId) => {
    try {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: true }));
      
      await axios.put(
        `/api/v1/users/friend-request/cancel/${userId}`,
        {},
        { timeout: 15000 }
      );
      
      // Update user status in list
      setAllUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, friendStatus: 'none' } : u
      ));
    } catch (error) {
      console.error('❌ Error canceling request:', error.message);
      Alert.alert('Error', 'Failed to cancel request');
    } finally {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  // ============ ACCEPT FRIEND REQUEST ============
  const handleAcceptFriendRequest = async (userId, userName) => {
    try {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: true }));
      
      await axios.put(
        `/api/v1/users/friend-request/accept/${userId}`,
        {},
        { timeout: 15000 }
      );
      
      Alert.alert('Success', `You are now friends with ${userName}`);
      
      // Update user status in list
      setAllUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, friendStatus: 'friends' } : u
      ));
    } catch (error) {
      console.error('❌ Error accepting request:', error.message);
      Alert.alert('Error', 'Failed to accept request');
    } finally {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  // ============ DECLINE FRIEND REQUEST ============
  const handleDeclineFriendRequest = async (userId) => {
    try {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: true }));
      
      await axios.put(
        `/api/v1/users/friend-request/decline/${userId}`,
        {},
        { timeout: 15000 }
      );
      
      // Update user status in list
      setAllUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, friendStatus: 'none' } : u
      ));
    } catch (error) {
      console.error('❌ Error declining request:', error.message);
      Alert.alert('Error', 'Failed to decline request');
    } finally {
      setSendingFriendRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  // ============ REMOVE FRIEND (UNFRIEND) ============
  const handleRemoveFriend = async (userId, userName) => {
    Alert.alert(
      'Unfriend',
      `Are you sure you want to remove ${userName} as a friend?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            try {
              setSendingFriendRequest(prev => ({ ...prev, [userId]: true }));
              
              await axios.delete(
                `/api/v1/users/friend/${userId}`,
                { timeout: 15000 }
              );
              
              setAllUsers(prev => prev.map(u => 
                u._id === userId ? { ...u, friendStatus: 'none' } : u
              ));
            } catch (error) {
              console.error('❌ Error removing friend:', error.message);
              Alert.alert('Error', 'Failed to unfriend');
            } finally {
              setSendingFriendRequest(prev => ({ ...prev, [userId]: false }));
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
            Loading forums...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

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

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: '#F8F9FA' }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="forum" size={32} color="#FFFFFF" />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Community Forum</Text>
            <Text style={styles.headerSubtitle}>Share farming knowledge and tips</Text>
          </View>
        </View>
        <View style={styles.categoriesContainer}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
            <TouchableOpacity
              style={[
                styles.categoryTab,
                {
                  backgroundColor: filterType === 'all' ? colors.primary : '#FFFFFF',
                  borderColor: filterType === 'all' ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[
                styles.categoryTabText,
                { color: filterType === 'all' ? '#FFFFFF' : colors.text }
              ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryTab,
                {
                  backgroundColor: filterType === 'friends' ? colors.primary : '#FFFFFF',
                  borderColor: filterType === 'friends' ? colors.primary : colors.border,
                  marginRight: 0,
                }
              ]}
              onPress={() => setFilterType('friends')}
            >
              <Text style={[
                styles.categoryTabText,
                { color: filterType === 'friends' ? '#FFFFFF' : colors.text }
              ]}>
                Friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter handled via right drawer (All, Friends) */}

        {/* Content: Feed of Threads and Posts */}
        {(() => {
          const isLoading = activeTab === 'feed' ? loading : tabLoading[activeTab];
          let displayData = [];
          
          if (activeTab === 'feed') {
            displayData = feed;
          } else if (activeTab === 'interested') {
            displayData = interestedThreads;
          } else if (activeTab === 'uninterested') {
            displayData = uninterestedThreads;
          } else if (activeTab === 'saved') {
            displayData = savedThreads;
          } else if (activeTab === 'users') {
            displayData = allUsers;
          }

          return (
            <>
              {isLoading ? (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
                    Loading...
                  </Text>
                </View>
              ) : displayData.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name={'forum-outline'}
                    size={60}
                    color={colors.border}
                  />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    No posts yet
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
                    Be the first to start a discussion!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={displayData}
                  renderItem={({ item, index }) => {
                    if (activeTab === 'users') {
                      return (
                        <View
                          style={[styles.userCard, { borderColor: colors.border, backgroundColor: '#FFFFFF' }]}
                        >
                          <Image
                            source={{ uri: item.avatar?.url || 'https://via.placeholder.com/60' }}
                            style={styles.userAvatar}
                          />
                          <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: colors.text }]}>
                              {item.name}
                            </Text>
                            <Text style={[styles.userEmail, { color: colors.textLight }]}>
                              {item.email}
                            </Text>
                            {/* Status Indicator */}
                            {item.friendStatus === 'friends' && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
                                <Text style={{ marginLeft: 4, fontSize: 11, color: colors.success, fontWeight: '600' }}>
                                  Connected
                                </Text>
                              </View>
                            )}
                          </View>
                          
                          {/* Action Buttons */}
                          {item.friendStatus === 'friends' ? (
                            <TouchableOpacity
                              style={[
                                styles.friendButton,
                                {
                                  backgroundColor: '#ECFDF5',
                                  borderWidth: 1,
                                  borderColor: colors.success,
                                  paddingHorizontal: 12
                                }
                              ]}
                              onPress={() => handleRemoveFriend(item._id, item.name)}
                              disabled={sendingFriendRequest[item._id]}
                            >
                              {sendingFriendRequest[item._id] ? (
                                <ActivityIndicator size="small" color={colors.success} />
                              ) : (
                                <Text style={{ color: colors.success, fontWeight: '600', fontSize: 12 }}>Friends</Text>
                              )}
                            </TouchableOpacity>
                          ) : item.friendStatus === 'pending_sent' ? (
                            <TouchableOpacity
                              style={[
                                styles.friendButton,
                                {
                                  backgroundColor: '#F3F4F6',
                                  borderWidth: 1,
                                  borderColor: '#D1D5DB',
                                  paddingHorizontal: 12
                                }
                              ]}
                              onPress={() => handleCancelFriendRequest(item._id)}
                              disabled={sendingFriendRequest[item._id]}
                            >
                              {sendingFriendRequest[item._id] ? (
                                <ActivityIndicator size="small" color="#6B7280" />
                              ) : (
                                <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 12 }}>Cancel</Text>
                              )}
                            </TouchableOpacity>
                          ) : item.friendStatus === 'pending_received' ? (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TouchableOpacity
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 16,
                                  backgroundColor: colors.success,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  elevation: 2
                                }}
                                onPress={() => handleAcceptFriendRequest(item._id, item.name)}
                                disabled={sendingFriendRequest[item._id]}
                              >
                                {sendingFriendRequest[item._id] ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                                )}
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 16,
                                  backgroundColor: colors.danger,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  elevation: 2
                                }}
                                onPress={() => handleDeclineFriendRequest(item._id)}
                                disabled={sendingFriendRequest[item._id]}
                              >
                                <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={[
                                styles.friendButton,
                                {
                                  backgroundColor: colors.primary,
                                  paddingHorizontal: 12
                                }
                              ]}
                              onPress={() => handleSendFriendRequest(item._id, item.name)}
                              disabled={sendingFriendRequest[item._id]}
                            >
                              {sendingFriendRequest[item._id] ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <>
                                  <MaterialCommunityIcons name="plus-circle" size={16} color="#FFFFFF" />
                                  <Text style={styles.friendButtonText}>Add</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    }
                    // Render ThreadCard for other tabs
                    return (
                    <View key={item._id}>
                    <TouchableOpacity
                      style={[styles.threadCard, { borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 4 } }]}
                      onPress={() => {
                        setSelectedThread(item);
                        fetchThreadDetail(item._id);
                        setThreadDetailVisible(true);
                      }}
                    >
                      <View style={styles.threadHeader}>
                        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: 10 }}>
                          <Image 
                            source={{ uri: item.createdBy?.avatar?.url || 'https://via.placeholder.com/40' }} 
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                          />
                          <View>
                            <Text style={[styles.threadAuthor, { color: colors.text }]}>
                              {item.createdBy?.name || 'User'}
                            </Text>
                            <Text style={[styles.threadTime, { color: colors.textLight }]}>
                              {getRelativeTime(item.createdAt)} • 🌎
                            </Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              setOpenMenuThreadId(openMenuThreadId === item._id ? null : item._id);
                            }}
                            style={styles.menuButton}
                          >
                            <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.textLight} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Dropdown Menu Overlay - Rendered conditionally when open */}
                      {openMenuThreadId === item._id && (
                        <View style={{ position: 'absolute', top: 40, right: 10, zIndex: 9999 }}>
                          <View style={[styles.menuDropdown, { backgroundColor: '#FFFFFF', borderColor: colors.border, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, width: 160 }]}>
                            {activeTab !== 'interested' && activeTab !== 'uninterested' && activeTab !== 'saved' && (
                              <>
                                <TouchableOpacity
                                  style={styles.menuOption}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuThreadId(null);
                                    handleMarkInterested(item._id);
                                  }}
                                >
                                  <MaterialCommunityIcons name="heart" size={18} color={colors.success} />
                                  <Text style={[styles.menuOptionText, { color: colors.text }]}>Interested</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.menuOption}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuThreadId(null);
                                    handleMarkUninterested(item._id);
                                  }}
                                >
                                  <MaterialCommunityIcons name="minus-circle" size={18} color={colors.warning} />
                                  <Text style={[styles.menuOptionText, { color: colors.text }]}>Not Interested</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.menuOption}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuThreadId(null);
                                    handleSavePost(item._id);
                                  }}
                                >
                                  <MaterialCommunityIcons name="bookmark" size={18} color={colors.primary} />
                                  <Text style={[styles.menuOptionText, { color: colors.text }]}>Save Post</Text>
                                </TouchableOpacity>
                              </>
                            )}
                            
                            {/* Undo Actions based on active tab */}
                            {activeTab === 'interested' && (
                              <TouchableOpacity
                                style={styles.menuOption}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuThreadId(null);
                                  handleClearInteraction(item._id); // Clear status (remove from interested)
                                }}
                              >
                                <MaterialCommunityIcons name="minus-circle" size={18} color={colors.warning} />
                                <Text style={[styles.menuOptionText, { color: colors.text }]}>Remove Interest</Text>
                              </TouchableOpacity>
                            )}

                            {activeTab === 'uninterested' && (
                              <TouchableOpacity
                                style={styles.menuOption}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuThreadId(null);
                                  handleClearInteraction(item._id); // Clear status (restore to feed)
                                }}
                              >
                                <MaterialCommunityIcons name="heart" size={18} color={colors.success} />
                                <Text style={[styles.menuOptionText, { color: colors.text }]}>Restore Interest</Text>
                              </TouchableOpacity>
                            )}

                            {activeTab === 'saved' && (
                              <TouchableOpacity
                                style={styles.menuOption}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuThreadId(null);
                                  handleSavePost(item._id); // Toggle save (unsave)
                                }}
                              >
                                <MaterialCommunityIcons name="bookmark-off" size={18} color={colors.textLight} />
                                <Text style={[styles.menuOptionText, { color: colors.text }]}>Unsave Post</Text>
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity
                              style={[styles.menuOption, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}
                              onPress={(e) => {
                                e.stopPropagation();
                                setSelectedThreadForAction(item);
                                setOpenMenuThreadId(null);
                                setReportModalVisible(true);
                              }}
                            >
                              <MaterialCommunityIcons name="flag" size={18} color={colors.danger} />
                              <Text style={[styles.menuOptionText, { color: colors.danger }]}>Report</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      <Text style={[styles.threadTitle, { color: colors.text, marginBottom: 4 }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.threadDesc, { color: colors.text }]} numberOfLines={4}>
                        {item.description}
                      </Text>
                      
                      {renderImageGrid(
                        Array.isArray(item?.images) && item.images.length > 0
                          ? item.images
                          : (item?.thumbnail?.url || item?.imageUrl
                              ? [item?.thumbnail?.url || item?.imageUrl]
                              : [])
                      )}

                      <View style={[styles.threadFooter, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 10 }]}>
                        <TouchableOpacity 
                          style={styles.footerAction}
                          onPress={() => handleLikeThread(item._id)}
                        >
                          <MaterialCommunityIcons name="thumb-up-outline" size={20} color={colors.textLight} />
                          <Text style={styles.footerActionText}>Like ({item.likesCount || 0})</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.footerAction}
                          onPress={() => {
                            setSelectedThread(item);
                            fetchThreadDetail(item._id);
                            setThreadDetailVisible(true);
                          }}
                        >
                          <MaterialCommunityIcons name="comment-outline" size={20} color={colors.textLight} />
                          <Text style={styles.footerActionText}>Comment ({item.repliesCount || 0})</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerAction}>
                          <MaterialCommunityIcons name="share-outline" size={20} color={colors.textLight} />
                          <Text style={styles.footerActionText}>Share</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                    </View>
                    );
                  }}
                  keyExtractor={(item) => item._id}
                  ListFooterComponent={null}
                  scrollEnabled={false}
                  nestedScrollEnabled={true}
                />
              )}
            </>
          );
        })()}

        <View style={{ height: 30 }} />
      </ScrollView>
      {/* Floating Action Button with Menu */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        
        {/* Menu Items */}
        <View style={{ alignItems: 'flex-end', marginBottom: 24 }} pointerEvents={fabMenuOpen ? 'box-none' : 'none'}>
            {/* Create Post (Top) - Appears last */}
            <Animated.View style={{ 
              opacity: fabAnimation.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1] }), 
              transform: [
                { translateY: fabAnimation.interpolate({ inputRange: [0.5, 1], outputRange: [20, 0] }) },
                { scale: fabAnimation.interpolate({ inputRange: [0.5, 1], outputRange: [0.8, 1] }) }
              ],
              flexDirection: 'row', alignItems: 'center', marginBottom: 24 
            }}>
              <View style={[styles.fabLabel, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.fabLabelText}>Create a post</Text>
              </View>
              <TouchableOpacity style={[styles.miniFab, { backgroundColor: colors.primary }]} onPress={() => handleFabAction('create')}>
                <Feather name="edit-3" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            {/* Saved Post */}
            <Animated.View style={{ 
              opacity: fabAnimation.interpolate({ inputRange: [0.4, 0.9], outputRange: [0, 1] }), 
              transform: [
                { translateY: fabAnimation.interpolate({ inputRange: [0.4, 0.9], outputRange: [20, 0] }) },
                { scale: fabAnimation.interpolate({ inputRange: [0.4, 0.9], outputRange: [0.8, 1] }) }
              ],
              flexDirection: 'row', alignItems: 'center', marginBottom: 24 
            }}>
              <View style={[styles.fabLabel, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.fabLabelText}>Saved Post</Text>
              </View>
              <TouchableOpacity style={[styles.miniFab, { backgroundColor: '#1B4D3E' }]} onPress={() => handleFabAction('saved')}>
                <MaterialCommunityIcons name="bookmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            {/* Interested */}
            <Animated.View style={{ 
              opacity: fabAnimation.interpolate({ inputRange: [0.3, 0.8], outputRange: [0, 1] }), 
              transform: [
                { translateY: fabAnimation.interpolate({ inputRange: [0.3, 0.8], outputRange: [20, 0] }) },
                { scale: fabAnimation.interpolate({ inputRange: [0.3, 0.8], outputRange: [0.8, 1] }) }
              ],
              flexDirection: 'row', alignItems: 'center', marginBottom: 24 
            }}>
              <View style={[styles.fabLabel, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.fabLabelText}>Interested</Text>
              </View>
              <TouchableOpacity style={[styles.miniFab, { backgroundColor: '#27AE60' }]} onPress={() => handleFabAction('interested')}>
                <MaterialCommunityIcons name="heart" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            {/* Uninterested */}
            <Animated.View style={{ 
              opacity: fabAnimation.interpolate({ inputRange: [0.2, 0.7], outputRange: [0, 1] }), 
              transform: [
                { translateY: fabAnimation.interpolate({ inputRange: [0.2, 0.7], outputRange: [20, 0] }) },
                { scale: fabAnimation.interpolate({ inputRange: [0.2, 0.7], outputRange: [0.8, 1] }) }
              ],
              flexDirection: 'row', alignItems: 'center', marginBottom: 24 
            }}>
              <View style={[styles.fabLabel, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.fabLabelText}>Uninterested</Text>
              </View>
              <TouchableOpacity style={[styles.miniFab, { backgroundColor: '#F39C12' }]} onPress={() => handleFabAction('uninterested')}>
                <MaterialCommunityIcons name="minus-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            {/* Friends/Users */}
            <Animated.View style={{ 
              opacity: fabAnimation.interpolate({ inputRange: [0.1, 0.6], outputRange: [0, 1] }), 
              transform: [
                { translateY: fabAnimation.interpolate({ inputRange: [0.1, 0.6], outputRange: [20, 0] }) },
                { scale: fabAnimation.interpolate({ inputRange: [0.1, 0.6], outputRange: [0.8, 1] }) }
              ],
              flexDirection: 'row', alignItems: 'center', marginBottom: 24 
            }}>
              <View style={[styles.fabLabel, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.fabLabelText}>Friends</Text>
              </View>
              <TouchableOpacity style={[styles.miniFab, { backgroundColor: '#1B4D3E' }]} onPress={() => handleFabAction('users')}>
                <MaterialCommunityIcons name="account-group" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            {/* All Posts (Feed) - Bottom - Appears first */}
            <Animated.View style={{ 
              opacity: fabAnimation.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1] }), 
              transform: [
                { translateY: fabAnimation.interpolate({ inputRange: [0, 0.5], outputRange: [20, 0] }) },
                { scale: fabAnimation.interpolate({ inputRange: [0, 0.5], outputRange: [0.8, 1] }) }
              ],
              flexDirection: 'row', alignItems: 'center', marginBottom: 24 
            }}>
              <View style={[styles.fabLabel, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.fabLabelText}>All Posts</Text>
              </View>
              <TouchableOpacity style={[styles.miniFab, { backgroundColor: colors.primary }]} onPress={() => handleFabAction('feed')}>
                <MaterialCommunityIcons name="home" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>

        {/* Main Toggle Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: fabMenuOpen ? '#FFFFFF' : colors.primary, borderWidth: fabMenuOpen ? 1 : 0, borderColor: colors.border }]}
          activeOpacity={0.9}
          onPress={toggleFabMenu}
        >
          <Animated.View style={{ transform: [{ rotate: fabAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }}>
            <Feather name="plus" size={24} color={fabMenuOpen ? colors.text : "#FFFFFF"} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Create Thread Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCreateModalVisible(false)}
            >
              <Feather name="x" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Discussion</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Discussion title..."
              placeholderTextColor={colors.textLight}
              value={newThreadTitle}
              onChangeText={setNewThreadTitle}
              maxLength={200}
            />
            <Text style={[styles.charCount, { color: colors.textLight }]}>
              {newThreadTitle.length}/200
            </Text>

            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text }]}
              placeholder="Share your knowledge or question about black pepper farming..."
              placeholderTextColor={colors.textLight}
              value={newThreadDesc}
              onChangeText={setNewThreadDesc}
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text style={[styles.charCount, { color: colors.textLight }]}>
              {newThreadDesc.length}/1000
            </Text>

            {newThreadDesc.length > 0 && (
              <View style={[styles.validationBox, {
                backgroundColor: validateContent(newThreadDesc).isValid ? colors.success + '15' : colors.warning + '15',
                borderColor: validateContent(newThreadDesc).isValid ? colors.success : colors.warning
              }]}>
                <Text style={[styles.validationText, {
                  color: validateContent(newThreadDesc).isValid ? colors.success : colors.warning
                }]}>
                  {validateContent(newThreadDesc).message}
                </Text>
              </View>
            )}

            <View style={styles.replyAddButtons}>
              <TouchableOpacity style={[styles.replyAddButton, { backgroundColor: colors.primary }]} onPress={pickThreadImagesFromGallery}>
                <Feather name="image" size={18} color="#FFFFFF" />
                <Text style={styles.replyAddButtonText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.replyAddButton, { backgroundColor: colors.primary }]} onPress={pickThreadImageFromCamera}>
                <Feather name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.replyAddButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
            {newThreadImages.length > 0 && (
              <View style={styles.replyPreviewGrid}>
                {newThreadImages.length === 1 ? (
                  <Image source={{ uri: newThreadImages[0].uri }} style={{ width: width - 24, height: (width - 24) * 0.5, borderRadius: 12 }} />
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {newThreadImages.map((img, idx) => (
                      <View key={idx} style={{ marginRight: 6, marginBottom: 6 }}>
                        <Image source={{ uri: img.uri }} style={{ width: (width - 24 - 12) / 2, height: (width - 24 - 12) / 2, borderRadius: 12 }} />
                        <TouchableOpacity style={styles.removeBadge} onPress={() => removeThreadImageAt(idx)}>
                          <Feather name="x" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateThread}
              disabled={postingThread}
            >
              {postingThread ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Post Discussion</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Thread Detail Modal */}
      <Modal
        visible={threadDetailVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setThreadDetailVisible(false)}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setThreadDetailVisible(false)}
            >
              <Feather name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedThread?.title}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {loadingPosts ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <>
                {/* Thread Info */}
                {selectedThread && (
                  <View style={[styles.threadInfoCard, { borderColor: colors.border }]}>
                    <View style={styles.threadHeader}>
                      <Image
                        source={{ uri: selectedThread.createdBy?.avatar?.url || 'https://via.placeholder.com/40' }}
                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                      />
                      <View>
                        <Text style={[styles.threadAuthor, { color: colors.text }]}>
                          {selectedThread.createdBy?.name || 'User'}
                        </Text>
                        <Text style={[styles.threadTime, { color: colors.textLight }]}>
                          {getRelativeTime(selectedThread.createdAt)} • 🌎
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.threadTitle, { color: colors.text, marginTop: 12 }]}>
                      {selectedThread.title}
                    </Text>
                    <Text style={[styles.threadDesc, { color: colors.textLight, marginTop: 4, marginBottom: 12 }]}>
                      {selectedThread.description}
                    </Text>
                    {renderImageGrid(
                      Array.isArray(selectedThread?.images) && selectedThread.images.length > 0
                        ? selectedThread.images
                        : (selectedThread?.thumbnail?.url || selectedThread?.imageUrl
                            ? [selectedThread?.thumbnail?.url || selectedThread?.imageUrl]
                            : []),
                      width - 64
                    )}
                    <View style={styles.threadActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleLikeThread(selectedThread._id)}
                      >
                        <MaterialCommunityIcons name="thumb-up-outline" size={20} color={colors.textLight} />
                        <Text style={styles.actionText}>
                          Like ({selectedThread.likesCount || 0})
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.actionButton}>
                        <MaterialCommunityIcons name="comment-outline" size={20} color={colors.textLight} />
                        <Text style={styles.actionText}>
                          Comment ({threadPosts?.length || 0})
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Replies */}
                <Text style={[styles.repliesTitle, { color: colors.text }]}>
                  Replies ({threadPosts.length})
                </Text>
                {threadPosts.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textLight }]}>
                      No replies yet. Be the first!
                    </Text>
                  </View>
                ) : (
                  <View>
                    {threadPosts.map((post) => (
                      <View key={post._id} style={[styles.replyCard, { borderColor: colors.border }]}>
                        <View style={styles.replyHeader}>
                          <Text style={[styles.replyAuthor, { color: colors.primary }]}>
                            {post.createdBy?.name || 'User'}
                          </Text>
                          <Text style={[styles.replyDate, { color: colors.textLight }]}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={[styles.replyContent, { color: colors.text }]}>
                          {post.content}
                        </Text>
                        {renderImageGrid(Array.isArray(post?.images) ? post.images : [])}
                        <View style={styles.replyFooter}>
                          <TouchableOpacity
                            style={styles.replyLikeButton}
                            onPress={() => handleLikePost(post._id)}
                          >
                            <MaterialCommunityIcons name="thumb-up-outline" size={16} color={colors.textLight} />
                            <Text style={[styles.replyLikeText, { color: colors.textLight }]}>
                              Like ({post.likesCount || 0})
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.replyLikeButton}
                            onPress={() => {
                              // Mention user in reply input
                              setNewPostContent(`@${post.createdBy?.name || 'User'} `);
                            }}
                          >
                            <Text style={[styles.replyLikeText, { color: colors.textLight }]}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={{ height: 100 }} />
              </>
            )}
          </ScrollView>

          {/* Reply Composer */}
          <View 
            style={[
              styles.replyComposer, 
              { 
                borderTopColor: colors.border, 
                backgroundColor: '#FFFFFF',
                paddingBottom: Platform.OS === 'ios' ? 20 : 0,
                flexDirection: 'column', // Changed to column to stack buttons and input
                alignItems: 'stretch',
              }
            ]}
          >
            {/* Image Previews */}
            {replyImages.length > 0 && (
              <View style={styles.replyPreviewGrid}>
                {replyImages.length === 1 ? (
                  <Image source={{ uri: replyImages[0].uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {replyImages.map((img, idx) => (
                      <View key={idx} style={{ marginRight: 6, marginBottom: 6 }}>
                        <Image source={{ uri: img.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                        <TouchableOpacity style={styles.removeBadge} onPress={() => removeReplyImageAt(idx)}>
                          <Feather name="x" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Camera/Photo Buttons as Icons */}
              <TouchableOpacity onPress={pickReplyImagesFromGallery} style={{ padding: 8 }}>
                <Feather name="image" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={pickReplyImageFromCamera} style={{ padding: 8 }}>
                <Feather name="camera" size={24} color={colors.primary} />
              </TouchableOpacity>

              <TextInput
                style={[styles.replyInput, { borderColor: colors.border, color: colors.text, maxHeight: 100 }]}
                placeholder="Write a reply..."
                placeholderTextColor={colors.textLight}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
              />
              
              <TouchableOpacity
                style={[styles.replySubmitButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateReply}
                disabled={postingReply}
              >
                {postingReply ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.reportModalContent, { backgroundColor: '#FFFFFF' }]}>
            <View style={[styles.reportHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.reportTitle, { color: colors.text }]}>Report Post</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reportBody}>
              <Text style={[styles.reportLabel, { color: colors.text }]}>Reason for report</Text>
              <TextInput
                style={[styles.reportInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Explain why you're reporting this post..."
                placeholderTextColor={colors.textLight}
                value={reportReason}
                onChangeText={setReportReason}
                multiline
                numberOfLines={5}
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: colors.textLight }]}>
                {reportReason.length}/500
              </Text>
            </ScrollView>

            <View style={styles.reportActions}>
              <TouchableOpacity
                style={[styles.reportButton, { backgroundColor: colors.border }]}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={[styles.reportButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reportButton, { backgroundColor: colors.danger }]}
                onPress={handleSubmitReport}
                disabled={submittingReport}
              >
                {submittingReport ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.reportButtonText, { color: '#FFFFFF' }]}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 0,
    alignItems: 'flex-end',
    width: '100%',
    paddingRight: 0,
    zIndex: 9999, // Ensure it's on top
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B4332',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    marginRight: 16
  },
  headerCard: {
    flexDirection: 'row',
    padding: 16,
    margin: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  headerContent: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  threadsList: {
    paddingHorizontal: 12,
  },
  threadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    position: 'relative'
  },
  threadHeader: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Removed this to align left
    alignItems: 'center', // Changed from flex-start to center for better avatar alignment
    marginBottom: 8,
  },
  threadTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  threadAuthor: {
    fontSize: 15, // Increased font size
    fontWeight: '700',
  },
  threadTime: {
    fontSize: 12,
    marginTop: 2,
  },
  threadCategory: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  thumbnailBox: {
    width: '100%',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 0,
    paddingBottom: '56.25%',
    backgroundColor: '#EEF2F7',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  threadDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  threadMeta: {
    fontSize: 11,
  },
  loadMoreButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 12,
  },
  validationBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  threadInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  threadInfoFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  infoText: {
    fontSize: 12,
  },
  threadActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  repliesTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  replyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '700',
  },
  replyDate: {
    fontSize: 11,
  },
  replyContent: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  replyLikeButton: {
    paddingVertical: 4,
  },
  replyLikeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  replyComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    maxHeight: 60,
  },
  replySubmitButton: {
    padding: 10,
    borderRadius: 8,
  },
  imageGridRow: {
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 12
  },
  imageTile: {
    borderRadius: 12
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700'
  },
  replyAddButtons: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8
  },
  replyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20
  },
  replyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  replyPreviewGrid: {
    marginHorizontal: 12,
    marginBottom: 8
  },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 4,
  },
  friendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  friendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  friendRequestsBell: {
    position: 'relative',
    padding: 8,
  },
  requestBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  requestCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuButton: {
    padding: 8,
  },
  menuDropdown: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  miniFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 24, // Added margin to align with main FAB center (56/2 - 40/2 + 16 = 8 + 16 = 24)
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  fabLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fabLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  reportModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  reportBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reportLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  reportInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  reportButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  tabsContainer: {
    marginVertical: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    gap: 12,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  userStatus: {
    fontSize: 11,
  },
  friendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  friendButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rightDrawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.08)',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: -4, height: 0 },
    paddingTop: 12,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  drawerHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1B1B',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
    gap: 12,
  },
  drawerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B1B1B',
  },
  threadAuthor: {
    fontSize: 14,
    fontWeight: '700',
  },
  threadTime: {
    fontSize: 11,
    marginTop: 2,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8
  },
  footerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#65676B'
  }
});
