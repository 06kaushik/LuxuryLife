import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthProvider from './src/components/AuthProvider';
import AppContent from './src/components/AppContent';
import axios from 'axios';
import { FETCH_URL } from './src/components/FetchApi';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import useSocket from './src/socket/SocketMain';


axios.defaults.baseURL = FETCH_URL;

const App = () => {

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [userdetails, setUserDetails] = useState(null);

  const onSocketConnect = () => {
    console.log('Socket connected!');
  };

  const { emit, on, removeListener } = useSocket(onSocketConnect); 

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await AsyncStorage.getItem('UserData');
        if (data !== null) {
          const parsedData = JSON.parse(data);
          setUserDetails(parsedData);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userdetails) {
      fetchLocationName();
    }
  }, [userdetails]);

  const fetchLocationName = async () => {
    const permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (permission !== RESULTS.GRANTED) {
      return;
    }

    Geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBMSu3-s9hl4tDatsaEcTXC5Ul-IEP5J_E`
        );

        if (response.data.results.length > 0) {
          const addressComponents = response.data.results[0].address_components;
          let city = '';
          let state = '';
          let country = '';

          addressComponents.forEach(component => {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
              state = component.long_name;
            }
            if (component.types.includes("country")) {
              country = component.long_name;
            }
          });
          setCity(city);
          setState(state);
          setCountry(country);
          const token = await AsyncStorage.getItem('authToken');
          const headers = { Authorization: token };
          let body = {
            step: 5,
            accountUpdatePayload: {
              location: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              city: city,
              state: state,
              country: country
            }
          };
          try {
            const apiResponse = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers });
            // console.log('updateddd');
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
            } else {
              console.log('No user data found in AsyncStorage');
            }
          } catch (error) {
            console.error("Error sending data to API:", error.message);
          }
        } else {
          console.log("No location results found.");
        }
      } catch (error) {
        console.error("Error getting location data:", error);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
    });
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
        if (cameraPermission === RESULTS.GRANTED) {
          // console.log('Camera permission granted');
        } else {
          console.log('Camera permission denied or blocked');
        }

        const audioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        if (audioPermission === RESULTS.GRANTED) {
          // console.log('Audio recording permission granted');
        } else {
          console.log('Audio recording permission denied or blocked');
        }

        const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (locationPermission === RESULTS.GRANTED) {
          // console.log('Location permission granted');
        } else {
          console.log('Location permission denied or blocked');
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    };
    requestPermissions();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
