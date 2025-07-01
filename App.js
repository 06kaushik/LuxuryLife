import React, { useEffect, useState } from 'react';
import { Platform, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthProvider from './src/components/AuthProvider';
import AppContent from './src/components/AppContent';
import axios from 'axios';
import { FETCH_URL } from './src/components/FetchApi';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { NotificationProvider } from './src/components/NotificationContext';
import { ViewLikeProvider } from './src/components/ViewandLikeContext';
import { SocketProvider } from './src/components/SocketContext';
import './src/components/axiosConfig';
import UpdateModal from './src/components/UpdateModal';
import messaging from '@react-native-firebase/messaging';
import IncomingCallHandler from './src/components/IncomingCallHandler';
import IncomingAudioCallHandler from './src/components/IncomingAudioCallHandler';
import { Buffer } from 'buffer';
import { navigationRef } from './src/components/NavigationService';
import OfflineNotice from './src/components/OfflineNotice';
import { UserProvider } from './src/components/UserContext';
import firebase from '@react-native-firebase/app';

axios.defaults.baseURL = FETCH_URL;

const App = () => {
  global.Buffer = Buffer;



  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [userdetails, setUserDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');
  const [userprofiledata, setUserProfileData] = useState();


  useEffect(() => {
    fetchUserProfile();
  }, [userdetails]);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const resp = await axios.get('auth/user-profile', {
        headers: { Authorization: token },
      });
      setUserProfileData(resp?.data?.data);
    } catch (error) {
      console.log('Error fetching profile:', error?.response?.data?.message);
    }
  };


  useEffect(() => {
    if (userdetails) {
      fetchLocationName();
    }
  }, [userdetails]);

  const fetchLocationName = async () => {
    const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    if (permission !== RESULTS.GRANTED) return;

    Geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBMSu3-s9hl4tDatsaEcTXC5Ul-IEP5J_E`
        );

        if (response?.data?.results?.length > 0) {
          const addressComponents = response.data.results[0].address_components;
          let city = '';
          let state = '';
          let country = '';

          addressComponents.forEach(component => {
            if (component.types.includes("locality")) city = component.long_name;
            if (component.types.includes("administrative_area_level_1")) state = component.long_name;
            if (component.types.includes("country")) country = component.long_name;
          });

          setCity(city);
          setState(state);
          setCountry(country);

          const token = await AsyncStorage.getItem('authToken');
          const headers = { Authorization: token };
          const body = {
            step: 5,
            accountUpdatePayload: {
              location: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              city, state, country
            }
          };

          try {
            await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers });
            const storedUserData = await AsyncStorage.getItem('UserData');
            if (storedUserData !== null) {
              const userData = JSON.parse(storedUserData);
              userData.city = city;
              userData.state = state;
              userData.country = country;
              userData.location = {
                type: "Point",
                coordinates: [longitude, latitude]
              };
              await AsyncStorage.setItem('UserData', JSON.stringify(userData));
            }
          } catch (error) {
            console.log("API update error:", error?.message);
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
    });
  };


  useEffect(() => {
    const requestIOSPermissions = async () => {
      try {
        const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
        const micPermission = await request(PERMISSIONS.IOS.MICROPHONE);
        const locationPermission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        // const notificationPermission = await request(PERMISSIONS.IOS.NOTIFICATIONS);

        if (cameraPermission !== RESULTS.GRANTED) console.warn("Camera permission denied on iOS");
        if (micPermission !== RESULTS.GRANTED) console.warn("Microphone permission denied on iOS");
        if (locationPermission !== RESULTS.GRANTED) console.warn("Location permission denied on iOS");
        // if (notificationPermission !== RESULTS.GRANTED) console.warn("Notification permission denied on iOS");

      } catch (error) {
        console.error('iOS permission request error:', error);
      }
    };


    requestIOSPermissions();
  }, []);


  const handleUpdate = () => {
    setIsModalVisible(false);
    Linking.openURL(updateUrl);
  };

  
  return (
    <UserProvider>
      <ViewLikeProvider>
        <NotificationProvider>
          <AuthProvider>
            <SocketProvider>
              <OfflineNotice />
              <NavigationContainer ref={navigationRef}>
                <AppContent />
                <IncomingCallHandler />
                <IncomingAudioCallHandler userId={userdetails?._id} userprofiledata={userprofiledata} />
              </NavigationContainer>
              <UpdateModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onUpdate={handleUpdate}
              />
            </SocketProvider>
          </AuthProvider>
        </NotificationProvider>
      </ViewLikeProvider>
    </UserProvider>
  );
};

export default App;
