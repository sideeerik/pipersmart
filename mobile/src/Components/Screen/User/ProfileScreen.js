import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Animated, SafeAreaView, StatusBar } from 'react-native';
import { getUser, getToken } from '../../utils/helper';
import axios from 'axios';
import { BACKEND_URL } from 'react-native-dotenv';
import MobileHeader from '../../shared/MobileHeader';

export default function ProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await getToken();
      if (!token) return navigation.replace('Login');

      try {
        const storedUser = await getUser();

        // If coming from UpdateProfileScreen with updated user
        if (route.params?.updatedUser) {
          setUser(route.params.updatedUser);
        } else {
          const res = await axios.get(`${BACKEND_URL}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user || storedUser);
        }
      } catch (error) {
        console.error('Fetch profile error:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [route.params?.updatedUser]);

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

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF7' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#1B4D3E" />
      <MobileHeader navigation={navigation} drawerOpen={drawerOpen} openDrawer={openDrawer} closeDrawer={closeDrawer} drawerSlideAnim={drawerSlideAnim} user={user} />
      <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar?.url || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || '-'}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Contact:</Text>
          <Text style={styles.value}>{user?.contact || 'Not provided'}</Text>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{user?.address?.city || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Barangay:</Text>
          <Text style={styles.value}>{user?.address?.barangay || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Street:</Text>
          <Text style={styles.value}>{user?.address?.street || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Zip Code:</Text>
          <Text style={styles.value}>{user?.address?.zipcode || 'Not provided'}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => navigation.navigate('UpdateProfile', { user })}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.changePasswordButton]}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAF7',
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#1B4D3E',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1B4D3E',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: '#1B4D3E',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    marginHorizontal: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButton: {
    backgroundColor: '#1B4D3E',
  },
  changePasswordButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
