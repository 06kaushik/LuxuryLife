import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-simple-toast';


export const AuthContext = createContext();

const AuthProvider = ({ children, navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false); // Track if the user is new

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

  const login = async (idToken) => {
    try {
      const response = await axios.post('auth/sign-in-google', { idToken });
      if (response?.data?.data?.user?.email) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('UserData', JSON.stringify(response.data.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        setIsAuthenticated(true);
      } else {
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error during login:', error.response?.data || error.message);
      Toast.show('Failed to authenticate. Please try again later.', Toast.SHORT);
    }
  };

  const loginWithEmail = async (email, password, navigation) => {
    try {
      const body = {
        userName: email,
        password: password,
      };
      console.log('body of email sign', body);

      const response = await axios.post('auth/sign-in', body);
      console.log('responseeeeee', response);

      if (response?.data?.data?.token) {

        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('UserData', JSON.stringify(response.data.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        Toast.show('Login Successfull', Toast.SHORT);
        setIsAuthenticated(true);
      } else {
        Toast.show('Failed to sign in', Toast.SHORT);
      }
    } catch (error) {
      console.log('error from the sign In API', error.response.data.message);
      Toast.show(error?.response?.data?.message, Toast.SHORT);
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, loginWithEmail, logout, isNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
