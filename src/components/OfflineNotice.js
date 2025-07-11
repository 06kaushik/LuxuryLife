// src/components/OfflineNotice.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const OfflineNotice = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [isSlow, setIsSlow] = useState(false);
    const [slideAnim] = useState(new Animated.Value(-40));

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                checkNetworkSpeed();
            } else {
                setIsSlow(false);
            }
        });

        return () => unsubscribe();
    }, []);



    const checkNetworkSpeed = async () => {
        try {
            const start = Date.now();
            const response = await fetch('https://www.google.com/generate_204');
            const duration = Date.now() - start;

            if (response.status === 204 && duration > 3000) {
                setIsSlow(true);
            } else {
                setIsSlow(false);
            }
        } catch (err) {
            setIsSlow(true);
        }
    };

    useEffect(() => {
        const shouldShow = !isConnected || isSlow;
        Animated.timing(slideAnim, {
            toValue: shouldShow ? 0 : -40,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isConnected, isSlow]);

    if (isConnected && !isSlow) return null;

    const bannerStyle = !isConnected ? styles.redBanner : styles.orangeBanner;

    return (
        <Animated.View style={[styles.container, bannerStyle, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.text}>
                {!isConnected ? 'You are offline' : 'Slow internet connection'}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    redBanner: {
        backgroundColor: 'red',
    },
    orangeBanner: {
        backgroundColor: 'orange',
    },
    text: {
        color: 'white',
        fontWeight: '600',
    },
});

export default OfflineNotice;
