import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-simple-toast';
import analytics from '@react-native-firebase/analytics';
import { navigationRef } from './NavigationService';
import * as Clarity from '@microsoft/react-native-clarity';



export const AuthContext = createContext();

const AuthProvider = ({ children, navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);


  useEffect(() => {
    // Configure Google Sign-in
    const configureGoogleSignin = () => {
      GoogleSignin.configure({
        webClientId: '387779373749-3ikotarkoc8ilie4tqkmstmpuo6kc7tt.apps.googleusercontent.com',
        offlineAccess: true,
      });
    };

    configureGoogleSignin();

    // Check auth status and setup Axios
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);


  const login = async (idToken, fcmtoken) => {
    try {
      const response = await axios.post('auth/sign-in-google', { idToken, fcm_token: fcmtoken });
      const user = response?.data?.data?.user;
      const token = response?.data?.data?.token;

      if (user?.email && user?.profileCompleted === true) {
        await analytics().logEvent('Signup_complete', {
          UserId: user?._id,
          EmailId: user?.email,
          Age: user?.age,
          Gender: user?.gender,
          Country: user?.country,
          City: user?.city
        });
        await Clarity.sendCustomEvent('Signup_complete')

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('verifcationToken', token);
        await AsyncStorage.setItem('UserData', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
        Toast.show(response?.data?.message || 'Login Successful', Toast.SHORT);
      } else {
        // Save token temporarily in case you need it later
        await AsyncStorage.setItem('verifcationToken', token);

        // Incomplete profile → navigate accordingly
        if (user?.step > 6) {
          navigationRef.current?.navigate('ProfileSignUp', {
            step: user.step,
            email: user.email,
            idToken: idToken,
          });
        } else {
          navigationRef.current?.navigate('SignUp', { step: user.step });
          await GoogleSignin.signOut();
        }

        Toast.show('Complete Your Profile', Toast.SHORT);
        // Toast.show(response?.data?.message, Toast.SHORT);
      }
    } catch (error) {
      await GoogleSignin.signOut();
      Toast.show(
        error?.response?.data?.message || 'SignUp to get registered yourself',
        Toast.SHORT
      );
    }
  };

  const loginWithEmail = async (email, password, fcmtoken, navigation) => {
    try {
      const body = {
        userName: email,
        password: password,
        fcm_token: fcmtoken
      };
      console.log('body of email sign', body);
      const response = await axios.post('auth/sign-in', body);
      // console.log('response from email', response);

      if (response?.data?.data?.token || response?.data.data?.user?.profileCompleted === true) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('verifcationToken', response.data.data.token);
        await AsyncStorage.setItem('UserData', JSON.stringify(response.data.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        setIsAuthenticated(true);
        Toast.show('Login Successful', Toast.SHORT);
      } else {
        // Toast.show('Failed to sign in', Toast.SHORT);
      }
    } catch (error) {
      console.log('error from the sign In API', error.response.data.message);
      Toast.show(error?.response?.data?.message, Toast.SHORT);
    }
  };

  const loginWithDoItLater = async (token) => {
    console.log('indide the do it later',);

    try {
      const response = await axios.get('auth/user-profile', {
        headers: {
          Authorization: token,
        }
      });

      console.log('repsonse from api do it later', response.data);
      await analytics().logEvent('Signup_complete', {
        UserId: response?.data?.data?.user?._id,
        EmailId: response?.data?.data?.user?.email,
        Age: response?.data?.data?.user?.age,
        Gender: response?.data?.data?.user?.gender,
        Country: response?.data?.data?.user?.country,
        City: response?.data?.data?.user?.city
      });
      await Clarity.sendCustomEvent('Signup_complete')
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('verifcationToken', token);
      await AsyncStorage.setItem('UserData', JSON.stringify(response.data.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      Toast.show('Login Successful', Toast.SHORT);
    } catch (error) {
      console.error('Error during login>>>>>> form do it later:', error.response?.data || error.message);
      // Toast.show(error.response?.data?.message, Toast.SHORT);
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      // Try calling logout API if token exists
      if (token) {
        await axios.post('auth/logout/single/device', {}, {
          headers: {
            Authorization: token,
          }
        });
        Toast.show('Logout Successful', Toast.SHORT);
        console.log('Logout successfully called on backend.');
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Token expired or invalid during logout. Proceeding with cleanup...');
      } else {
        console.error('Error during logout:', error?.response?.data?.message || error.message);
      }
    } finally {
      // Cleanup regardless of whether API call failed
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('verifcationToken');
      await AsyncStorage.removeItem('hasSeenHideModal');
      await AsyncStorage.removeItem('UserData');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, loginWithEmail, loginWithDoItLater, logout, isNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
