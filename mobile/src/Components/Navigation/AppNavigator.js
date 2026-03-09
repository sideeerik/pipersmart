import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import axios from 'axios';
import { BACKEND_URL } from 'react-native-dotenv';
import UserStack from './UserStack';
import AdminStack from './AdminStack';
import { getUser, getToken, onAuthChange } from '../utils/helpers';

export default function AppNavigator() {
  const [userRole, setUserRole] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [prevRole, setPrevRole] = useState(null);

  useEffect(() => {
    // Setup axios interceptors
    const setupAxiosInterceptors = () => {
      // Response interceptor for handling 401 errors
      axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            console.error('❌ 401 Unauthorized:', error.config?.url);
            console.error('❌ Authorization header:', axios.defaults.headers.common['Authorization']);
            console.error('❌ Error message:', error.response?.data?.message || error.message);
          }
          return Promise.reject(error);
        }
      );
    };

    const setupAxios = async () => {
      // Set base URL for axios from environment variable
      axios.defaults.baseURL = BACKEND_URL;
      
      // Get token and set up axios default header
      const token = await getToken();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Axios authorized with token');
      } else {
        console.warn('⚠️ No token found in AsyncStorage');
      }
      setupAxiosInterceptors();
    };

    const fetchUser = async () => {
      await setupAxios(); // Setup axios first
      const user = await getUser();
      setUserRole(user?.role || null);
      setPrevRole(user?.role || null);
      setInitialized(true);
    };
    fetchUser();

    // Listen for auth changes and update axios header
    const unsubscribe = onAuthChange((user) => {
      const newRole = user?.role || null;
      
      // Update axios header when auth changes
      if (user && user !== null) {
        // User logged in - will have token from authenticate()
        getToken().then(token => {
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('✅ Axios updated with new token');
          }
        });
      } else {
        // User logged out
        delete axios.defaults.headers.common['Authorization'];
        console.log('🚪 Axios authorization header removed');
      }
      
      // Only update if role actually changed
      if (newRole !== prevRole) {
        setUserRole(newRole);
        setPrevRole(newRole);
      }
    });

    return () => unsubscribe();
  }, [prevRole]);

  // Don't render until we know the initial auth state
  if (!initialized) {
    return null;
  }

  const linking = {
    prefixes: [Linking.createURL('/'), 'pipersmart://'],
    config: {
      screens: {
        ResetPassword: 'reset-password/:token',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      {userRole === 'admin' ? <AdminStack /> : <UserStack />}
    </NavigationContainer>
  );
}
