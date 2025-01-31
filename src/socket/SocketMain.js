import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { SocketURL } from '../components/FetchApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSocket = (onConnectCallback) => {
    const socketRef = useRef(null);

    useEffect(() => {
        const initializeSocket = async () => {
            const token = await AsyncStorage.getItem('authToken');

            socketRef.current = io(SocketURL, {
                auth: { token: token },
                transports: ["websocket"],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                randomizationFactor: 0.5,
            });

            // Handle connection
            socketRef.current.on('connect', () => {
                onConnectCallback();
            });

            // Handle disconnection
            socketRef.current.on('disconnect', () => {
                // Handle disconnection if needed
            });

            // Handle errors
            socketRef.current.on('error', (error) => {
                // Handle socket error if needed
            });
        };

        // Initialize socket connection
        initializeSocket();

        // Cleanup the socket connection when the component unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [onConnectCallback]); // Ensure the effect re-runs if onConnectCallback changes

    // Expose socket functions
    const emit = (event, data = {}) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    };

    const on = (event, cb) => {
        if (socketRef.current) {
            socketRef.current.on(event, cb);
        }
    };

    const removeListener = (event, cb) => {
        if (socketRef.current) {
            socketRef.current.removeListener(event, cb);
        }
    };

    return { emit, on, removeListener };
};

export default useSocket;
