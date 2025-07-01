// src/components/axiosConfig.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FETCH_URL } from './FetchApi';

axios.defaults.baseURL = FETCH_URL;

// Request interceptor 
axios.interceptors.response.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        // console.log('Interceptor token:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Optional: Retry logic on 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Optional: refresh token logic or force logout
            await AsyncStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];

            // Redirect to login screen or set auth to false if context available
            console.log('Session expired. Logging out...');
        }

        return Promise.reject(error);
    }
);
