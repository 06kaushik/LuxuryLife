import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { SocketURL } from '../components/FetchApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSocket = (onConnectCallback, userdetails) => {
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
                console.log('connected');
                onConnectCallback();
                // Emit 'userOnline' when the socket is connected
                if (userdetails?._id) {
                    socketRef.current.emit("userOnline", { userId: userdetails._id });
                }
            });

            // Handle disconnection
            socketRef.current.on('disconnect', () => {
                console.log('disconnected');
                // Emit 'userOnline' on reconnection
                if (userdetails?._id) {
                    socketRef.current.emit("userOnline", { userId: userdetails._id });
                }
            });

            // Handle errors
            socketRef.current.on('error', (error) => {
                console.log('Socket error:', error);
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
    }, [onConnectCallback, userdetails]);

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

    const once = (event, cb) => {
        if (socketRef.current) {
            socketRef.current.once(event, cb);
        }
    };

    const removeListener = (event, cb) => {
        if (socketRef.current) {
            socketRef.current.removeListener(event, cb);
        }
    };

    return { emit, on, removeListener, once };
};

export default useSocket;
