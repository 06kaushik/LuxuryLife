import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AuthProvider from './src/components/AuthProvider';
import AppContent from './src/components/AppContent';
import axios from 'axios';
import { FETCH_URL } from './src/components/FetchApi';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import useSocket from './src/socket/SocketMain';
import { PermissionsAndroid, Linking, } from 'react-native';
import { NotificationProvider } from './src/components/NotificationContext';
import { ViewLikeProvider } from './src/components/ViewandLikeContext';
import { SocketProvider } from './src/components/SocketContext';
import './src/components/axiosConfig'
import UpdateModal from './src/components/UpdateModal';
import VersionCheck from 'react-native-version-check';
import messaging from '@react-native-firebase/messaging'
import queryString from 'query-string';
import IncomingCallHandler from './src/components/IncomingCallHandler';
import IncomingAudioCallHandler from './src/components/IncomingAudioCallHandler';
import { Buffer } from 'buffer';
import { navigationRef } from './src/components/NavigationService';
import PushNotification from 'react-native-push-notification';
import OfflineNotice from './src/components/OfflineNotice';
import { UserProvider } from './src/components/UserContext';
import * as Clarity from '@microsoft/react-native-clarity';



axios.defaults.baseURL = FETCH_URL;

const App = () => {


  global.Buffer = Buffer;
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [userdetails, setUserDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');
  const [userprofiledata, setUserProfileData] = useState();

  // const { emit, on, removeListener, socketId } = useSocket(onSocketConnect);
  // const onSocketConnect = () => { };

  useEffect(() => {
    Clarity.initialize('ris6mdtxwu')
  }, []);




  useEffect(() => {
    fetchUserProfile()
  }, [userdetails])

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const resp = await axios.get('auth/user-profile', {
        headers: { Authorization: token },
      });
      setUserProfileData(resp?.data?.data);
    } catch (error) {
      console.log('Error fetching profile:', error?.response?.data?.message);
    }
  };

  useEffect(() => {
    // Create the notification channel when the app initializes
    PushNotification.createChannel(
      {
        channelId: "chat_notification", // Channel ID (used in FCM payload)
        channelName: "Chat Notification", // Name of the channel
        channelDescription: "Notifications for incoming chat messages", // Description
        soundName: "default",             // Use default sound for notifications
        importance: 4,                    // High importance for immediate delivery
        vibrate: true                     // Vibration enabled
      },
      (created) => console.log(`Notification channel created: ${created}`)
    );
  }, []);

  useEffect(() => {
    // Handle foreground notifications
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      // Display notification in the foreground
      PushNotification.localNotification({
        channelId: 'chat_notification', // Channel ID
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        soundName: 'default', // Notification sound
        priority: 'high',     // High priority for immediate display
      });
    });

    return () => {
      unsubscribeOnMessage();
    };
  }, []);



  useEffect(() => {
    // Handle foreground notifications
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      //('Foreground notification received:', remoteMessage);
      // if (remoteMessage.data && remoteMessage.data.userId) {
      //   await getUserProfileData(remoteMessage.data.userId);
      //   // navigationRef.current?.navigate('Chat')
      //   // handleChatPress(remoteMessage.data.userId);  
      // }
    });

    // Handle background and terminated state notifications
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      // //('Notification caused app to open from background state:', remoteMessage);
      // if (remoteMessage.data && remoteMessage.data.userId) {
      //   getUserProfileData(remoteMessage.data.userId);
      //   navigationRef.current?.navigate('Chat')
      //   // handleChatPress(remoteMessage.data.userId);  
      // }
    });

    // Handle app opened from terminated state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && remoteMessage.data && remoteMessage.data.userId) {
          // getUserProfileData(remoteMessage.data.userId);
          navigationRef.current?.navigate('Home', {
            screen: 'Chat'
          })

          // handleChatPress(remoteMessage.data.userId);  

        }
      });

    // Handle background message
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('reomote messages', remoteMessage);
      const { data } = remoteMessage;
      if (data && data.type && data.userId) {
        switch (data.type) {
          case 'text':
            navigationRef.current?.navigate('Home', {
              screen: 'Chat'
            })
            break;
          case 'PROFILE_LIKE':
            navigationRef.current?.navigate('Home', {
              screen: 'Likes'
            })
            break;
          case 'PROFILE_VIEW':
            navigationRef.current?.navigate('Home', {
              screen: 'Likes'
            })
            break;
          case 'call_request':
            navigationRef.current?.navigate('Home', {
              screen: 'Dash'
            })
            break;
          // Add other types if needed
          default:
            break;
        }
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);




  useEffect(() => {
    if (userdetails) {
      fetchLocationName();
    }
  }, [userdetails]);

  const fetchLocationName = async () => {
    const permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (permission !== RESULTS.GRANTED) {
      return;
    }

    Geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBMSu3-s9hl4tDatsaEcTXC5Ul-IEP5J_E`
        );

        if (response?.data?.results?.length > 0) {
          const addressComponents = response.data.results[0].address_components;
          let city = '';
          let state = '';
          let country = '';

          addressComponents.forEach(component => {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
              state = component.long_name;
            }
            if (component.types.includes("country")) {
              country = component.long_name;
            }
          });
          setCity(city);
          setState(state);
          setCountry(country);
          const token = await AsyncStorage.getItem('authToken');
          const headers = { Authorization: token };
          let body = {
            step: 5,
            accountUpdatePayload: {
              location: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              city: city,
              state: state,
              country: country
            }
          };
          try {
            const apiResponse = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers });
            // //('updateddd',apiResponse?.data);
            const storedUserData = await AsyncStorage.getItem('UserData');
            if (storedUserData !== null) {
              const userData = JSON.parse(storedUserData);
              userData.city = city;
              userData.state = state;
              userData.country = country;
              userData.location = {
                type: "Point",
                coordinates: [longitude, latitude]
              };
              await AsyncStorage.setItem('UserData', JSON.stringify(userData));
            } else {
              //('No user data found in AsyncStorage');
            }
          } catch (error) {
            // console.error("Error sending data to API:", error.message);
          }
        } else {
          //("No location results found.");
        }
      } catch (error) {
        console.error("Error getting location data:", error);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
    });
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
        if (cameraPermission === RESULTS.GRANTED) {
          // //('Camera permission granted');
        } else {
          //('Camera permission denied or blocked');
        }

        const notificationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (notificationPermission === PermissionsAndroid.RESULTS.GRANTED) {
          //('Notification permission granted');
        } else {
          //('Notification permission denied or blocked');
        }


        const audioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        if (audioPermission === RESULTS.GRANTED) {
          // //('Audio recording permission granted');
        } else {
          //('Audio recording permission denied or blocked');
        }


        const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (locationPermission === RESULTS.GRANTED) {
          // //('Location permission granted');
        } else {
          //('Location permission denied or blocked');
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {

    const currentVersion = VersionCheck.getCurrentVersion();
    // //(`Current Version: ${currentVersion}`);

    VersionCheck.getLatestVersion({
      provider: 'playStore' // Change to 'appStore' for iOS
    })
      .then(latestVersion => {
        // //(`Latest Version: ${latestVersion}`);

        VersionCheck.needUpdate({ currentVersion, latestVersion })
          .then(updateCheck => {
            // //('Update Check Result:', updateCheck);

            if (updateCheck.isNeeded) {
              // //('Update needed');
              setUpdateUrl('https://play.google.com/store/apps/details?id=com.luxurylife');
              setIsModalVisible(true);
            } else {
              // //('No update needed');
            }
          })
          .catch(err => {
            console.error('Error checking version:', err);
          });
      })
      .catch(err => {
        console.error('Error fetching latest version:', err);
      });

  }, []);

  const handleUpdate = () => {
    setIsModalVisible(false);
    Linking.openURL(updateUrl);
  };

  return (
    <UserProvider>
      <ViewLikeProvider>
        <NotificationProvider>
          <AuthProvider>
            <SocketProvider>
              <OfflineNotice />
              <NavigationContainer ref={navigationRef}>
                <AppContent />
                <IncomingCallHandler />
                <IncomingAudioCallHandler userId={userdetails?._id} userprofiledata={userprofiledata} />
              </NavigationContainer>
              <UpdateModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onUpdate={handleUpdate}
              />
            </SocketProvider>
          </AuthProvider>
        </NotificationProvider>
      </ViewLikeProvider>
    </UserProvider>
  );

};

export default App;
