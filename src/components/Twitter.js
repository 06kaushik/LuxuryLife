import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Modal,
    Linking,
    StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { generateChallenge } from 'pkce-challenge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from './images';
import axios from 'axios';

const CLIENT_ID = 'Q1I5MWZCQkkyeUxOOXFfYUd3Ykw6MTpjaQ';
const REDIRECT_URI = 'https://www.luxurylife.ai/redirect.html';
// '12345678-asd98f798asdf79asdfa9sdfs9df7a9sdf7'

const TwitterVerifier = ({ userId }) => {


    const [verified, setVerified] = useState(false);
    console.log('is verified twittrt', verified);

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [authUrl, setAuthUrl] = useState('');
    const codeVerifierRef = useRef('');

    useEffect(() => {
        const checkVerified = async () => {
            const flag = await AsyncStorage.getItem('isTwitterVerified');
            if (flag === 'true') setVerified(true);
        };
        checkVerified();

        const sub = Linking.addEventListener('url', handleDeepLink);
        return () => sub.remove();
    }, []);

    const startTwitterLogin = async () => {
        setLoading(true);
        const { code_challenge, code_verifier } = generateChallenge();
        codeVerifierRef.current = code_verifier;

        const url =
            `https://twitter.com/i/oauth2/authorize?response_type=code` +
            `&client_id=${CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&scope=tweet.read%20users.read%20offline.access` +
            `&state=verify123` +
            `&code_challenge=${code_challenge}` +
            `&code_challenge_method=S256`;

        setAuthUrl(url);
        setModalVisible(true);
    };


    // const sendTwitterToken = async (ftoken) => {
    //     const token = await AsyncStorage.getItem('authToken')
    //     const headers = {
    //         Authorization: token
    //     }
    //     const body = {
    //         accessToken: ftoken,
    //         userId: '684423f9a7f1ba4250273c36'
    //     }
    //     console.log('reaponse og body ', body);
    //     try {
    //         const resp = await axios.post('auth/verifyXAuthToken', body, { headers });
    //         // console.log('response from facebook token', resp?.data)
    //     } catch (error) {
    //         console.log('error from facebook token', error?.data?.response?.message);
    //     }
    // }


    const handleDeepLink = async ({ url }) => {
        try {
            if (url.startsWith('luxurylife://twitter-auth')) {
                console.log('📥 Deep link received:', url);

                const codeMatch = url.match(/[?&]code=([^&]+)/);
                const code = codeMatch?.[1];

                if (code) {
                    console.log('✅ Extracted code:', code);
                    setModalVisible(false);
                    setLoading(false);
                    setVerified(true); // this is all you want now
                    await AsyncStorage.setItem('isTwitterVerified', 'true');
                } else {
                    console.warn('⚠️ Code not found in deep link');
                }
            }
        } catch (error) {
            console.error('❌ Error handling deep link:', error);
            setLoading(false);
        }
    };


    const exchangeCodeForToken = async (code) => {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifierRef.current,
        });

        try {
            const response = await fetch('https://api.twitter.com/2/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });

            const result = await response.json();
            if (result.access_token) {
                await AsyncStorage.setItem('isTwitterVerified', 'true');
                console.log('Twitter access token:', result.access_token);
                setVerified(true);
            }
        } catch (err) {
            console.error('Token exchange failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {verified ? (
                <View style={styles.verifiedContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={images.twitter} style={{ height: 30, width: 30, left: 10 }} />
                        <Text style={styles.verifiedText}>You are verified</Text>
                    </View>
                </View>
            ) : (
                <TouchableOpacity onPress={startTwitterLogin} style={styles.button} disabled={loading}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={images.twitter} style={{ height: 30, width: 30, left: 10 }} />
                        <Text style={styles.buttonText}>Connect your X</Text>
                    </View>
                </TouchableOpacity>
            )}

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

            <Modal visible={modalVisible} animationType="slide">
                <WebView
                    source={{ uri: authUrl }}
                    onNavigationStateChange={({ url }) => {
                        // Intercept redirect.html and rewrite it as deep link
                        if (url.startsWith('https://www.luxurylife.ai/redirect.html')) {
                            const deepLink = url.replace('https://www.luxurylife.ai/redirect.html', 'luxurylife://twitter-auth');
                            console.log('🟢 Redirecting to:', deepLink);
                            Linking.openURL(deepLink); // triggers app's deep link handler
                            setModalVisible(false);
                        }
                    }}
                />
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        borderWidth: 1,
        height: 50,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 20,
        backgroundColor: 'white',
        borderColor: 'white',
        elevation: 2,
    },
    buttonText: {
        textAlign: 'center',
        left: 20,
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: 'grey',
        top: 5,
    },
    verifiedContainer: {
        borderWidth: 1,
        height: 50,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 20,
        backgroundColor: '#DDDDDD',
        borderColor: '#DDDDDD',
        elevation: 2,
    },
    verifiedText: {
        textAlign: 'center',
        left: 20,
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: 'white',
        top: 5,
    },
});

export default TwitterVerifier;
