import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthProvider from './src/components/AuthProvider';
import AppContent from './src/components/AppContent';
import axios from 'axios';
import { FETCH_URL } from './src/components/FetchApi';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';




axios.defaults.baseURL = FETCH_URL;

const App = () => {

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result === RESULTS.GRANTED) {
          console.log('Camera permission granted');
        } else if (result === RESULTS.DENIED) {
          console.log('Camera permission denied');
        } else if (result === RESULTS.BLOCKED) {
          console.log('Camera permission blocked');
          Alert.alert(
            'Permission Blocked',
            'Please enable camera permissions in your settings.'
          );
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    };

    requestCameraPermission();
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
