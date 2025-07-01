import React, { createContext, useEffect, useRef, useState, useContext } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthProvider';
import { SocketURL } from './FetchApi';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socketId, setSocketId] = useState(null);
    const { isAuthenticated } = useContext(AuthContext);
    const [userDetails, setUserDetails] = useState(null);
    const [connected, setConnected] = useState(false);
    // console.log('connected from socket ', connected);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = await AsyncStorage.getItem('UserData');
            if (user) setUserDetails(JSON.parse(user));
        };
        fetchUserData();
    }, [isAuthenticated]);

    useEffect(() => {
        const connectSocket = async () => {
            const token = await AsyncStorage.getItem('authToken');
            if (!token || !userDetails?._id) return;

            if (!socketRef.current) {
                socketRef.current = io(SocketURL, {
                    auth: { token },
                    transports: ['websocket'],
                    reconnection: true,
                });

                socketRef.current.on('connect', () => {
                    setSocketId(socketRef.current.id);
                    // console.log('🟢 Socket connected:', socketRef.current.id);
                    setConnected(true);
                    socketRef.current.emit('userOnline', { userId: userDetails._id });
                });

                socketRef.current.on('disconnect', () => {
                    // console.log('🔴 Socket disconnected');
                    setConnected(false);
                });
            }
        };

        if (isAuthenticated) {
            connectSocket();
        } else if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocketId(null);
        }
    }, [isAuthenticated, userDetails]);

    const emit = (event, data) => {
        if (socketRef.current) socketRef.current.emit(event, data);
    };

    const on = (event, handler) => {
        if (socketRef.current) socketRef.current.on(event, handler);
    };

    const removeListener = (event, handler) => {
        if (socketRef.current) socketRef.current.off(event, handler);
    };

    const once = (event, callback) => socketRef.current?.once(event, callback);

    return (
        <SocketContext.Provider value={{ socketId, emit, on, removeListener, connected, once }}>
            {children}
        </SocketContext.Provider>
    );
};
