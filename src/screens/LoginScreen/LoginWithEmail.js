import React, { useState, useContext, useEffect } from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import images from "../../components/images";
import { CheckBox } from 'react-native-elements';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthContext } from "../../components/AuthProvider";
import axios from "axios";
import Toast from 'react-native-simple-toast';
import LottieView from 'lottie-react-native';
import { ScrollView } from "react-native-gesture-handler";


const LoginWithEmail = ({ navigation }) => {

    const [isChecked, setIsChecked] = useState(false);
    const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const { login, loginWithEmail } = useContext(AuthContext);



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
            console.error('Error during Google Sign-In:', error);
            if (error.response) {
                console.error('Error Response:', error.response.data);
            }
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert('Cancelled', 'User cancelled the sign-in process.');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('In Progress', 'Sign-in process is already in progress.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services are not available.');
            } else {
                Alert.alert('Error', 'Something went wrong during the sign-in process.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async () => {
        if (
            email.length > 10 &&
            password.length > 8 &&
            isChecked === true &&
            validateEmail(email)
        ) {
            const credentials = {
                userName: email,
                password: password,
            };
            loginWithEmail(credentials.userName, credentials.password, navigation);
        } else {
            Toast.show('Please verify you are not a robot and check your credentials to proceed', Toast.SHORT);
        }
    };

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(email);
    };

    const handleCheckboxPress = async () => {
        if (!isChecked) {
            setIsLoadingCaptcha(true);
            setTimeout(() => {
                setIsChecked(true);
                setIsLoadingCaptcha(false);
            }, 2000);
        }
    };

    return (
        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Image source={images.back} style={styles.backIcon} />
            </TouchableOpacity>

            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.titleText}>Luxury Life!</Text>
            <ScrollView style={{ marginBottom: 100 }}>
                <Text style={styles.subtitleText}>
                    Enter your email to continue to Luxury Life
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Email"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <View style={styles.inputContainer1}>
                        <TextInput
                            style={[styles.input1, { flex: 1 }]}
                            placeholder="Enter Password"
                            placeholderTextColor="#B0B0B0"
                            secureTextEntry={!isPasswordVisible}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setPasswordVisible(!isPasswordVisible)}
                            style={styles.eyeIconContainer}
                        >
                            <Image
                                source={isPasswordVisible ? images.openeye : images.closeeye}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>


                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <Text style={styles.orText}>Or continue with</Text>

                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={isLoading}>
                    <View style={styles.googleButtonContent}>
                        <Image source={images.google} style={styles.googleIcon} />
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={styles.cont3}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {isLoadingCaptcha ? (
                                <LottieView
                                    source={require('../../assets/loading.json')}
                                    autoPlay
                                    loop
                                    style={{ width: 40, height: 40 }}
                                />
                            ) : (
                                <CheckBox
                                    checked={isChecked}
                                    onPress={handleCheckboxPress}
                                    size={30}
                                    containerStyle={{ margin: 0, padding: 0 }}
                                />
                            )}
                            <Text style={[styles.txt9, { marginLeft: isLoadingCaptcha ? 20 : null }]}>I'm not a robot</Text>
                        </View>
                        <View style={{ marginRight: 10 }}>
                            <Image source={images.captcha} style={{ height: 40, width: 40, left: 5 }} />
                            <Text style={styles.txt10}>reCAPTCHA</Text>
                            <Text style={styles.txt11}>Privacy-Terms</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <View style={{ marginTop: 80 }}>
                        <Text style={styles.joinText}>Don't have an account?<Text style={{ color: '#916008', fontFamily: 'Poppins-Medium', textDecorationLine: 'underline' }}> Join Today</Text></Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
            <View style={styles.cont4}>
                <TouchableOpacity onPress={handleEmailSignIn}>
                    <Text style={styles.txt12}>Login</Text>
                </TouchableOpacity>
            </View>


        </View>
    );
};

export default LoginWithEmail;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        marginTop: 20,
        color: '#000',
    },
    titleText: {
        fontSize: 36,
        fontFamily: 'Playfair_9pt-BoldItalic',
        textAlign: 'center',
        color: '#000',
    },
    subtitleText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        color: '#7B7B7B',
        marginTop: 20,
    },
    inputContainer: {
        marginTop: 40,
    },
    input: {
        borderWidth: 1,
        height: 44,
        width: '100%',
        color: '#000',
        paddingLeft: 20,
        borderRadius: 100,
        borderColor: '#E8E6EA',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    forgotPasswordText: {
        color: '#7B7B7B',
        fontSize: 12,
        textDecorationLine: 'underline',
        fontFamily: 'Poppins-Regular',
    },
    orText: {
        color: '#7B7B7B',
        textAlign: 'center',
        marginTop: 40,
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
    },
    googleButton: {
        borderWidth: 1,
        height: 50,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: '#C4C4C4',
        marginTop: 20,
        justifyContent: 'center',
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        height: 25,
        width: 25,
        marginRight: 10,
    },
    googleButtonText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#000',
    },
    cont3: {
        height: 76,
        width: '80%',
        borderWidth: 1,
        backgroundColor: '#F9F9F9',
        alignSelf: 'center',
        borderColor: '#F9F9F9',
        elevation: 2,
        marginTop: 50,
        justifyContent: 'center',
    },
    txt9: {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
    },
    txt10: {
        color: '#7B7B7B',
        fontSize: 10,
    },
    txt11: {
        color: '#7B7B7B',
        fontSize: 8,
    },
    cont4: {
        position: 'absolute', // Makes it stick to the bottom
        bottom: 20, // Adjusts the distance from the bottom
        width: '100%',
        borderWidth: 1,
        height: 50,
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: "#916008",
        backgroundColor: '#916008',
        justifyContent: 'center',
    },
    txt12: {
        color: 'white',
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
    },
    joinText: {
        color: 'black',
        fontSize: 14,
        textAlign: 'center',
        // marginTop: 50, // Adjust this value to control spacing
        fontFamily: 'Poppins-SemiBold',
    },
    eyeIcon: {
        height: 20,
        width: 20,
    },
    inputContainer1: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#E8E6EA',
        borderRadius: 9,
        marginBottom: 20,
        height: 45,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: 'white',
    },
    inputContainer1: {
        flexDirection: 'row', // Aligns the text input and eye icon horizontally
        alignItems: 'center',
        borderColor: '#E8E6EA',
        borderRadius: 100, // Rounded corners for the container
        borderWidth: 1, // Border for the input container
        height: 44, // Adjust height for consistent input size
        width: '100%', // Take full width
        marginTop: 20, // Add space from the previous element
        position: 'relative', // Allows absolute positioning of the icon
    },

    input1: {
        flex: 1, // The input takes up the remaining space
        paddingLeft: 20,
        height: '100%',
        borderRadius: 100,
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },

    eyeIconContainer: {
        position: 'absolute',
        right: 10, // Positions the eye icon at the far right of the container
        top: '50%',
        transform: [{ translateY: -10 }], // Centers the icon vertically
    },

    eyeIcon: {
        height: 20,
        width: 20,
    },

});
