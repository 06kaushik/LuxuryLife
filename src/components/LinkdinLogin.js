import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from './images'; // Ensure LinkedIn icon is in this

const CLIENT_ID = '86k70kvua5lj7a';
const CLIENT_SECRET = 'WPL_AP1.TyZZyP0Xv1bvVIO8.KxN7iQ==';
const REDIRECT_URI = 'https://www.luxurylife.ai/callback';
const SCOPE = 'r_liteprofile%20r_emailaddress';

const LinkedInVerifier = ({ userId }) => {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    const checkVerified = async () => {
      const flag = await AsyncStorage.getItem('isLinkedInVerified');
      if (flag === 'true') setVerified(true);
    };
    checkVerified();

    const sub = Linking.addEventListener('url', handleDeepLink);
    return () => sub.remove();
  }, []);

  const startLinkedInLogin = async () => {
    setLoading(true);

    const url =
      `https://www.linkedin.com/oauth/v2/authorization` +
      `?response_type=code` +
      `&client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${SCOPE}` +
      `&state=verifyLinkedIn123`;

    setAuthUrl(url);
    setModalVisible(true);
  };

  const handleDeepLink = async ({ url }) => {
    try {
      if (url.startsWith('luxurylife://linkedin-auth')) {
        const codeMatch = url.match(/[?&]code=([^&]+)/);
        const code = codeMatch?.[1];

        if (code) {
          setModalVisible(false);
          setLoading(false);
          await exchangeCodeForToken(code);
        } else {
          console.warn('⚠️ Code not found in deep link');
        }
      }
    } catch (error) {
      console.error('❌ Error handling LinkedIn deep link:', error);
      setLoading(false);
    }
  };

  const exchangeCodeForToken = async (code) => {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const result = await response.json();
      if (result.access_token) {
        console.log('✅ LinkedIn access token:', result.access_token);
        await AsyncStorage.setItem('isLinkedInVerified', 'true');
        setVerified(true);
      } else {
        console.error('❌ LinkedIn token exchange failed:', result);
      }
    } catch (err) {
      console.error('❌ LinkedIn token exchange error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {verified ? (
        <View style={styles.verifiedContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Image source={images.linkedin} style={{ height: 30, width: 30, left: 10 }} />
            <Text style={styles.verifiedText}>You are verified</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={startLinkedInLogin} style={styles.button} disabled={loading}>
          <View style={{ flexDirection: 'row' }}>
            <Image source={images.linkedin} style={{ height: 30, width: 30, left: 10 }} />
            <Text style={styles.buttonText}>Connect your LinkedIn</Text>
          </View>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <Modal visible={modalVisible} animationType="slide">
        <WebView
          source={{ uri: authUrl }}
          onNavigationStateChange={({ url }) => {
            if (url.startsWith('https://www.luxurylife.ai/redirect.html')) {
              const deepLink = url.replace(
                'https://www.luxurylife.ai/redirect.html',
                'luxurylife://linkedin-auth'
              );
              Linking.openURL(deepLink);
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
    backgroundColor: '#0077B5',
    borderColor: '#0077B5',
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

export default LinkedInVerifier;
