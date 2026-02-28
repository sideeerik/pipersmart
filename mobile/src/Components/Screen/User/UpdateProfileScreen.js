import React, { useState } from 'react';
import { View, TextInput, Alert, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Animated, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { getToken, updateUser, notifyAuthChange } from '../../utils/helper';
import { BACKEND_URL } from 'react-native-dotenv';
import MobileHeader from '../../shared/MobileHeader';

export default function UpdateProfileScreen({ route, navigation }) {
  const { user } = route.params;

  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.contact || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [barangay, setBarangay] = useState(user?.address?.barangay || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [zipcode, setZipcode] = useState(user?.address?.zipcode || '');
  const [avatar, setAvatar] = useState(user?.avatar?.url || null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSlideAnim] = useState(new Animated.Value(-280));

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    drawerSlideAnim.setValue(-280);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();

      formData.append('name', name.trim());
      formData.append('contact', contact.trim());
      formData.append('city', city.trim());
      formData.append('barangay', barangay.trim());
      formData.append('street', street.trim());
      formData.append('zipcode', zipcode.trim());

      // Append avatar if changed
      if (avatar && avatar !== user?.avatar?.url) {
        const filename = avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('avatar', { uri: avatar, name: filename, type });
      }

      console.log('📤 Updating profile to:', `${BACKEND_URL}/api/v1/users/me/update`);
      const res = await axios.put(`${BACKEND_URL}/api/v1/users/me/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', res.data.message || 'Profile updated successfully');

      // Update AsyncStorage with latest user data (including avatar)
      await updateUser(res.data.user);
      console.log('✅ User data updated in AsyncStorage');
      
      // Explicitly notify header about the change (triggers header refresh)
      console.log('📡 Notifying header about profile update with avatar:', res.data.user.avatar?.url?.substring(0, 50) + '...');
      notifyAuthChange(res.data.user);

      // Pass updated user back to Profile screen
      navigation.navigate('Profile', { updatedUser: res.data.user });
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF7' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#1B4D3E" />
      <MobileHeader navigation={navigation} drawerOpen={drawerOpen} openDrawer={openDrawer} closeDrawer={closeDrawer} drawerSlideAnim={drawerSlideAnim} user={user} />
      <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.placeholderText}>Tap to choose photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Tap to change photo</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Email (Disabled) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email (cannot change)</Text>
          <TextInput
            value={user?.email || ''}
            editable={false}
            style={styles.inputDisabled}
            placeholderTextColor="#999"
          />
        </View>

        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        {/* Contact */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            placeholder="Enter contact number"
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        {/* Address Section */}
        <Text style={styles.sectionLabel}>Address</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Barangay</Text>
          <TextInput
            placeholder="Enter barangay"
            value={barangay}
            onChangeText={setBarangay}
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Street</Text>
          <TextInput
            placeholder="Enter street"
            value={street}
            onChangeText={setStreet}
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Zip Code</Text>
          <TextInput
            placeholder="Enter zip code"
            value={zipcode}
            onChangeText={setZipcode}
            keyboardType="numeric"
            maxLength={4}
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#1B4D3E',
    marginBottom: 20,
  },
  avatarWrapper: {
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  changePhotoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B4D3E',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4D3E',
    marginTop: 15,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#1B4D3E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D4E5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    color: '#1B4D3E',
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: '#D4E5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#E8E8E8',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#1B4D3E',
  },
  cancelButton: {
    backgroundColor: '#E8E8E8',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
