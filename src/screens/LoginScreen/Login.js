import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, Image, TouchableOpacity, ActivityIndicator, Alert, Linking, AppState } from 'react-native';
import images from '../../components/images';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthContext } from '../../components/AuthProvider';
import axios from 'axios';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessToken, LoginButton } from 'react-native-fbsdk-next';
import messaging from '@react-native-firebase/messaging'
import { PermissionsAndroid } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import * as Clarity from '@microsoft/react-native-clarity';






const { width, height } = Dimensions.get('window'); // Get the screen width and height

const LoginScreen = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [fcmtoken, setFcmToken] = useState('')
    //('fcm token>>>>>', fcmtoken);

    //('fcm token in login with google', fcmtoken);

    const { login } = useContext(AuthContext); // Access the login function


    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                GoogleSignin.signOut()
                    .then(() => {
                        //('Signed out from Google on app active.');
                    })
                    .catch(err => {
                        console.error('Google sign-out error:', err);
                    });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [fcmtoken]);


    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '387779373749-3ikotarkoc8ilie4tqkmstmpuo6kc7tt.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const handleGoogleSignIn = async () => {
        Clarity.sendCustomEvent('login_started')
        await analytics().logEvent('login_started');
        try {
            setIsLoading(true);
            if (!fcmtoken) {
                await getFcmPushToken();
            }

            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data.idToken;

            await login(idToken, fcmtoken); // ← just call context login
        } catch (error) {
            await GoogleSignin.signOut();

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Toast.show('User cancelled the sign-in process.', Toast.SHORT);
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Toast.show('Sign-in is already in progress.', Toast.SHORT);
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Toast.show('Google Play Services not available.', Toast.SHORT);
            } else {
                Toast.show('Something went wrong during sign-in.', Toast.SHORT);
            }
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        getFcmPushToken()
    }, [])

    const getFcmPushToken = async () => {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
            const fcmToken = await messaging().getToken();
            //('FCM TOKEN IN PUSH FUNCTION LOGIN>>>>', fcmToken);

            setFcmToken(fcmToken);
            return { authorized: true, token: fcmToken };
        } else {
            return { authorized: false, token: null };
        }
    };


    return (
        <View style={style.main}>
            <ImageBackground style={style.imageBackground} source={images.banner}>
                <View style={style.container}>
                    <Text style={style.welcomeText}>Welcome to</Text>
                    <Text style={style.titleText}>Luxury Life!</Text>
                    <Text style={style.subtitleText}>Where Ambition Meets Affluence</Text>
                    {/* <Text style={style.termsText}>By Clicking login, you are agree with our<Text style={style.underline}> Terms.
                        </Text> Learn how we process your data in our<Text style={style.underline}> Privacy Policy</Text> and<Text style={style.underline}> Cookies Policy.</Text>
                    </Text> */}
                    <TouchableOpacity onPress={handleGoogleSignIn} disabled={isLoading}>
                        <View style={style.buttonContainer}>
                            <View style={style.buttonContent}>
                                <Image source={images.google} style={style.icon} />
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Text style={style.buttonText}>Login with Google</Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* <LoginButton
                        onLoginFinished={
                            (error, result) => {
                                if (error) {
                                    //("login has error: " + result.error);
                                } else if (result.isCancelled) {
                                    //("login is cancelled.");
                                } else {
                                    AccessToken.getCurrentAccessToken().then(
                                        (data) => {
                                            //('facebook access token', data.accessToken.toString())
                                        }
                                    )
                                }
                            }
                        }
                        onLogoutFinished={() => //("logout.")} /> */}

                    <TouchableOpacity onPress={() => { navigation.navigate('LoginWithEmail'); Clarity.sendCustomEvent('login_started'); }}>
                        <View style={style.buttonContainer}>
                            <View style={style.buttonContent}>
                                {/* <Image source={images.google} style={style.icon} /> */}
                                <Text style={style.buttonText}>Login with Email</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Last two texts at the bottom */}
                <View style={style.bottomContainer}>
                    <Text style={style.bottomText}>You don't have an account?</Text>
                    <TouchableOpacity style={{ borderWidth: 0.5, height: height * 0.065, width: width * 0.85, borderRadius: 100, justifyContent: 'center', borderColor: 'white', top: 15, }} onPress={() => { navigation.navigate('SignUp'); analytics()?.logEvent('signup_starting'); Clarity.sendCustomEvent('signup_starting') }}>
                        <Text style={[style.signupText, { textAlign: 'center' }]}>Signup</Text>
                    </TouchableOpacity>

                    <Text style={style.termsText}>
                        By clicking login, you agree with our
                        <Text
                            style={style.underline}
                            onPress={() => Linking.openURL('https://www.luxurylife.ai/terms-and-conditions')}
                        > Terms.</Text> Learn how we process your data in our
                        <Text
                            style={style.underline}
                            onPress={() => Linking.openURL('https://www.luxurylife.ai/privacy-policy')}
                        > Privacy Policy.</Text>
                        {/* <Text
                            style={style.underline}
                            onPress={() => Linking.openURL('https://www.luxurylife.ai/privacy-policy')}
                        > Cookies Policy.</Text> */}
                    </Text>
                </View>

            </ImageBackground>
        </View>
    );
};

const style = StyleSheet.create({
    main: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // Responsive padding on the sides
        top: 50,
    },
    welcomeText: {
        fontSize: width * 0.08, // Responsive font size based on screen width
        color: 'white',
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
    titleText: {
        fontSize: width * 0.1, // Responsive font size based on screen width
        color: 'white',
        fontFamily: 'Playfair_9pt-BoldItalic',
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: width * 0.05, // Responsive font size based on screen width
        color: 'white',
        fontFamily: 'Poppins-Light',
        textAlign: 'center',
        marginTop: height * 0.03, // Responsive margin for spacing
    },
    termsText: {
        fontSize: width * 0.025, // Responsive font size for small text
        color: 'white',
        fontFamily: 'Poppins-Light',
        textAlign: 'center',
        marginTop: height * 0.05,
        marginLeft: 10,
        marginRight: 10 // Responsive margin from previous text
    },
    underline: {
        textDecorationLine: 'underline',
        textDecorationColor: 'white',
    },
    buttonContainer: {
        borderWidth: 1,
        height: height * 0.065, // Responsive height for the button
        width: width * 0.85, // Responsive width of the button
        borderRadius: 100,
        backgroundColor: 'white',
        marginTop: height * 0.02, // Adds margin to the top of the button
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row', // Aligns the Google icon and text horizontally
        justifyContent: 'center', // Centers them horizontally
        alignItems: 'center', // Centers them vertically
    },
    icon: {
        height: 20,
        width: 20,
        marginRight: 10, // Adds space between the icon and text
    },
    buttonText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: 'black',
        top: 1
    },
    bottomContainer: {
        position: 'absolute', // Absolute positioning to stick at the bottom
        bottom: 20, // Adjust this value to provide some space from the bottom
        alignItems: 'center', // Center the texts horizontally
    },
    bottomText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: 'white',
    },
    signupText: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: 'white',
        marginTop: 5, // Space between the two texts
    },
});

export default LoginScreen;
