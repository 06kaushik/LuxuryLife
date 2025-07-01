import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from './images';
import Toast from 'react-native-simple-toast'


const InstagramBioVerify = ({ onClose }) => {

  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [startWebview, setStartWebview] = useState(false);
  const webviewRef = useRef(null);

  useEffect(() => {
    const generateOrLoadCode = async () => {
      const existingCode = await AsyncStorage.getItem('insta_verify_code');
      if (existingCode) {
        setCode(existingCode);
      } else {
        const newCode = 'IG-' + Math.floor(1000 + Math.random() * 9000);
        setCode(newCode);
        await AsyncStorage.setItem('insta_verify_code', newCode);
      }
    };
    generateOrLoadCode();
  }, []);

  const injectedJS = ` 
    setTimeout(() => {
      const meta = document.querySelector('meta[name="description"]');
      window.ReactNativeWebView.postMessage(meta ? meta.content : "NO_META_TAG");
    }, 2000);
    true;
  `;

  const handleWebViewMessage = (event) => {
    const bio = event.nativeEvent.data;
    if (bio.includes(code)) {
      setIsVerified(true);

      Alert.alert('✅ Verified', 'Code found in Instagram bio!');
    } else {
      Alert.alert('❌ Not Verified', 'Code not found. Please check your bio.');
    }
    setStartWebview(false);
  };

  const startVerification = () => {
    if (!username) {
      Toast.show('Please Enter Your Instagram Username To Proceed', Toast.SHORT)
      return;
    }
    setStartWebview(true);
  };


  return (
    <View style={styles.container}>
      <Image source={images.insta} style={{ height: 80, width: 80, alignSelf: 'center', bottom: 100 }} />
      {!startWebview ? (
        <>
          <Text style={styles.title}>Instagram Verification</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Instagram username"
            placeholderTextColor={'grey'}
            value={username}
            onChangeText={setUsername}
          />
          <Text style={styles.instructions}>Add this code to your Instagram bio:</Text>
          <Text style={styles.code}>{code}</Text>
          <TouchableOpacity style={styles.button} onPress={startVerification}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#ccc', marginTop: 30 }]} onPress={onClose}>
            <Text style={[styles.buttonText, { color: 'black' }]}>Close</Text>
          </TouchableOpacity>
          {isVerified && <Text style={styles.verified}>✅ Verified</Text>}
        </>
      ) : (
        <WebView
          ref={webviewRef}
          source={{ uri: `https://www.instagram.com/${username}/` }}
          injectedJavaScript={injectedJS}
          onMessage={handleWebViewMessage}
          startInLoadingState
          renderLoading={() => <ActivityIndicator size="large" color="#000" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 16 },
  instructions: { fontSize: 16, marginBottom: 8 },
  code: { fontSize: 20, fontWeight: 'bold', color: 'green', marginBottom: 16 },
  button: { backgroundColor: '#4267B2', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16 },
  verified: { marginTop: 20, fontSize: 18, color: 'green' },
});

export default InstagramBioVerify;
