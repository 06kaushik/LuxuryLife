import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import images from '../../components/images';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthContext } from '../../components/AuthProvider';
import axios from 'axios';
import Toast from 'react-native-simple-toast';


const { width, height } = Dimensions.get('window'); // Get the screen width and height

const LoginScreen = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(false); // Loading state
    const { login } = useContext(AuthContext); // Access the login function

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '387779373749-3ikotarkoc8ilie4tqkmstmpuo6kc7tt.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const handleGoogleSignIn = async () => {
        console.log('inside handle google sign in function');
        try {
            setIsLoading(true);
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data.idToken;
            try {
                const response = await axios.post('auth/sign-in-google', { idToken });
                console.log('response from the google sign in', response?.data);
                Toast.show(response?.data?.message, Toast.SHORT);
                if (response?.data?.data?.user?.email) {
                    login(idToken);
                } else {
                }
            } catch (error) {
                console.log('error from google signIn', error.message);
                Toast.show('SignUp To Get Registered Yourself', Toast.SHORT)
            }

        } catch (error) {
            // console.error('Error during Google Sign-In:', error);
            if (error.response) {
                // console.error('Error Response:', error.response.data);
            }
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Toast.show('User cancelled the sign-in process.', Toast.SHORT)
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Toast.show('Sign-in process is already in progress.', Toast.SHORT)
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Toast.show('Google Play Services are not available.', Toast.SHORT)
            } else {
                // Toast.show('Something went wrong during the sign-in process.', Toast.SHORT)
            }
        } finally {
            setIsLoading(false);
        }
    };




    return (
        <View style={style.main}>
            <ImageBackground style={style.imageBackground} source={images.banner}>
                <View style={style.container}>
                    <Text style={style.welcomeText}>Welcome to</Text>
                    <Text style={style.titleText}>Luxury Life!</Text>
                    <Text style={style.subtitleText}>Where Ambition Meets Affluence</Text>
                    <Text style={style.termsText}>By Clicking login, you are agree with our<Text style={style.underline}> Terms.</Text> Learn how we process your data in our<Text style={style.underline}> Privacy Policy</Text> and<Text style={style.underline}> Cookies Policy.</Text>
                    </Text>
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
                    <TouchableOpacity onPress={() => navigation.navigate('LoginWithEmail')}>
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
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={style.signupText}>Signup</Text>
                    </TouchableOpacity>
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
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // Responsive padding on the sides
        top: 80,
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
        fontSize: width * 0.035, // Responsive font size for small text
        color: 'white',
        fontFamily: 'Poppins-Light',
        textAlign: 'center',
        marginTop: height * 0.05, // Responsive margin from previous text
    },
    underline: {
        textDecorationLine: 'underline',
        textDecorationColor: 'white',
    },
    buttonContainer: {
        borderWidth: 1,
        height: height * 0.065, // Responsive height for the button
        width: width * 0.85, // Responsive width of the button
        borderRadius: 20,
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
        fontSize: 12,
        color: 'black',
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
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: 'white',
        marginTop: 5, // Space between the two texts
    },
});

export default LoginScreen;
