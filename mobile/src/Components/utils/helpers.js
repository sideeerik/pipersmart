import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Auth change listeners array
let authChangeListeners = [];

// Notify all listeners when auth state changes
export const notifyAuthChange = (user) => {
  authChangeListeners.forEach(listener => listener(user));
};

// Subscribe to auth changes
export const onAuthChange = (callback) => {
  authChangeListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    authChangeListeners = authChangeListeners.filter(cb => cb !== callback);
  };
};

// Save token and user info
export const authenticate = async (data, next) => {
  try {
    const userData = {
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      id: data.user._id,
      avatar: data.user.avatar, // Include avatar object { public_id, url }
    };
    
    await AsyncStorage.setItem('token', data.token);
    console.log('✅ Token saved:', data.token?.substring(0, 20) + '...');
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ User saved:', userData.email);
    console.log('🖼️ Avatar saved:', userData.avatar?.url?.substring(0, 50) + '...');
    
    // Notify listeners about auth change
    notifyAuthChange(userData);
    
    if (next) next();
  } catch (error) {
    console.error('Error storing auth data', error);
  }
};

// Get user info
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user', error);
    return null;
  }
};

// Update user info in AsyncStorage (for profile updates)
export const updateUser = async (updatedUserData) => {
  try {
    const currentUser = await getUser();
    const mergedUser = { ...currentUser, ...updatedUserData };
    await AsyncStorage.setItem('user', JSON.stringify(mergedUser));
    console.log('✅ User updated in AsyncStorage:', mergedUser.email);
    console.log('🖼️ Avatar updated to:', mergedUser.avatar?.url?.substring(0, 50) + '...');
    
    // Notify listeners about auth change
    notifyAuthChange(mergedUser);
    
    return mergedUser;
  } catch (error) {
    console.error('Error updating user', error);
    return null;
  }
};

// Get JWT token
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('🔍 Token retrieved:', token ? token.substring(0, 20) + '...' : 'NULL');
    return token || null;
  } catch (error) {
    console.error('Error getting token', error);
    return null;
  }
};

// Check if admin
export const isAdmin = async () => {
  const user = await getUser();
  return user && user.role === 'admin';
};

// Check if authenticated
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// Logout - Fast logout with background backend cleanup
export const logout = async (navigation) => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('🔑 Starting logout process, token exists:', !!token);
    
    // ⚡ FAST: Clear local storage and notify immediately (don't wait for backend)
    await AsyncStorage.removeItem('token');
    console.log('🚪 Token removed from AsyncStorage');
    await AsyncStorage.removeItem('user');
    console.log('🚪 User removed from AsyncStorage');
    
    // Notify listeners about auth change immediately
    notifyAuthChange(null);
    
    // Navigate to Index screen immediately
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      });
    }
    
    // 🔄 Background: Call backend logout endpoint asynchronously (don't wait)
    if (token) {
      // Fire and forget - don't await this
      axios.post('/api/v1/users/logout', {}, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        console.log('✅ Backend logout successful:', response.data.message);
      })
      .catch(error => {
        console.error('❌ Backend logout notification failed (non-blocking)');
        console.error('  Error:', error.message);
        // This is non-blocking, so we don't care if it fails
      });
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Try to reset navigation anyway
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      });
    }
  }
};