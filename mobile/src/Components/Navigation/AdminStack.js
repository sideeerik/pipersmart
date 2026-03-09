import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../Screen/Admin/DashboardScreen'; // This should be Dashboard.js
import AdminProfileScreen from '../Screen/Admin/AdminProfileScreen';
import AdminUpdateProfileScreen from '../Screen/Admin/AdminUpdateProfileScreen';
import ResetPasswordScreen from '../Screen/User/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminDashboard">
      <Stack.Screen name="AdminDashboard" component={DashboardScreen} />
      <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
      <Stack.Screen name="AdminUpdateProfile" component={AdminUpdateProfileScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
