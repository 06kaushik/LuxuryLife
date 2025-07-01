import React, { useContext, useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from './AuthProvider';
import AuthStack from '../navigation/AuthStack';
import SplashScreen from './SplashScreen';
import HomeStack from '../navigation/HomeStack';



const AppContent = () => {
    const { isAuthenticated, isLoading, isNewUser } = useContext(AuthContext);
    // console.log('isAuthenticate',is);

    const [isSplashVisible, setIsSplashVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSplashVisible(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isSplashVisible) {
        return <SplashScreen />;
    }
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return isAuthenticated ? <HomeStack /> : <AuthStack />;
};

export default AppContent;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
