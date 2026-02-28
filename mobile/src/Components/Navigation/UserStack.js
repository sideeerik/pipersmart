// UserStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IndexScreen from '../Screen/User/IndexScreen';
import LoginScreen from '../Screen/User/LoginScreen'; // This is correct
import RegisterScreen from '../Screen/User/RegisterScreen';
import HomeScreen from '../Screen/User/HomeScreen';
import AboutScreen from '../Screen/User/AboutScreen';
import ContactScreen from '../Screen/User/ContactScreen';
import ProfileScreen from '../Screen/User/ProfileScreen';
import UpdateProfileScreen from '../Screen/User/UpdateProfileScreen';
import ForgotPassword from '../Screen/User/ForgotPassword';
import ChangePassword from '../Screen/User/ChangePassword';
import WeatherScreen from '../Screen/User/WeatherScreen';
import MacromappingScreen from '../Screen/User/MacromappingScreen';
import LeafAnalysisScreen from '../Screen/User/LeafAnalysisScreen';
import BungaRipenessScreen from '../Screen/User/BungaRipenessScreen';
import ForumScreen from '../Screen/User/ForumScreen';
import MessengerScreen from '../Screen/User/MessengerScreen';
import KnowledgeScreen from '../Screen/User/KnowledgeScreen';

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator initialRouteName="Index">
      <Stack.Screen 
        name="Index" 
        component={IndexScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserHome" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Contact" 
        component={ContactScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PiperKnowledge" 
        component={KnowledgeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UpdateProfile" 
        component={UpdateProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Weather" 
        component={WeatherScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Macromapping" 
        component={MacromappingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LeafAnalysis" 
        component={LeafAnalysisScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BungaRipeness" 
        component={BungaRipenessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Forum" 
        component={ForumScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Messenger" 
        component={MessengerScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
