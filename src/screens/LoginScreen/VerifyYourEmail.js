import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import images from '../../components/images';
import axios from 'axios';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VerifyEmail = ({ navigation, route }) => {
    const [timer, setTimer] = useState(60);
    const [resendVisible, setResendVisible] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const { email } = route.params;

    // Create references for OTP inputs
    const inputRefs = useRef([]);

    const verifyOtp = async () => {
        if (otp.length === 4) {
            let body = {
                email: email,
                otp: otp.join(''),
            };
            console.log('body of otp', body);
            setIsLoading(true);
            try {
                const resp = await axios.put('auth/verify-otp', body);
                console.log('response from the verify otp', resp.data);
                await AsyncStorage.setItem('verifcationToken', resp.data.data.token);
                Toast.show('OTP Verified Successfully', Toast.SHORT);
                navigation.navigate('CreatePassword', { id: resp?.data?.data?.user?._id });
            } catch (error) {
                console.log('error from the verify otp', error.message);
            } finally {
                setIsLoading(false);

            }

        } else {
            Toast.show('Please Enter Valid OTP', Toast.SHORT);
        }
    };

    const sendOtp = async () => {
        const body = {
            email: email,
        };
        console.log('send otp body', body);

        try {
            const response = await axios.post('auth/send-otp', body);
            console.log('OTP sent successfully:', response.data);
            Toast.show(response?.data?.message, Toast.SHORT);
        } catch (error) {
            console.error('Error sending OTP:', error.response || error.message);
            Toast.show('Failed to send OTP. Please try again.', Toast.SHORT);
            throw error;
        }
    };

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setResendVisible(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = () => {
        setTimer(60); // Reset timer
        setResendVisible(false);
        sendOtp();
    };

    const handleInputChange = (text, index) => {
        const updatedOtp = [...otp];
        updatedOtp[index] = text;
        setOtp(updatedOtp);

        // Move to the next input if the user entered a digit
        if (text && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Move to the previous input if the user deletes the character
        if (!text && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={images.back} style={styles.backIcon} />
            </TouchableOpacity>

            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>Enter the verification code sent to your email to proceed.</Text>

            <Text style={styles.emailText}>{email}</Text>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            {/* OTP Boxes */}
            <View style={styles.otpContainer}>
                {otp.map((value, index) => (
                    <TextInput
                        key={index}
                        style={styles.otpInput}
                        keyboardType="numeric"
                        maxLength={1}
                        value={value}
                        onChangeText={(text) => handleInputChange(text, index)}
                        ref={(ref) => inputRefs.current[index] = ref} // Assign ref to each input
                    />
                ))}
            </View>

            {/* Timer */}
            {resendVisible ? (
                <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.timerText}>This code will expire in</Text>
            )}
            <Text style={styles.timer}>{`00:${timer < 10 ? `0${timer}` : timer}`}</Text>

            <Text style={styles.txt3}>Need help? Contact our support team for {'\n'} assistance.</Text>
            <Text style={styles.txt4}>Back to login <Text style={styles.underline}>Log in</Text></Text>
            <View style={{ marginTop: 80 }}>
                <Text style={styles.txt5}>Can't Access Your Email?</Text>
                <Text style={styles.txt6}>Try Another Way</Text>
            </View>

            <View style={styles.cont4}>
                <TouchableOpacity onPress={verifyOtp}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.txt12}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 20,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        fontSize: 32,
        textAlign: 'center',
        marginVertical: 10,
        color: '#000',
    },
    subtitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        marginBottom: 20,
    },
    emailText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        color: '#000',
    },
    editText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        textAlign: 'center',
        color: '#916008',
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        textAlign: 'center',
        fontSize: 24,
        borderRadius: 8,
        color: '#000',
    },
    timerText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        color: '#7B7B7B',
    },
    timer: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        textAlign: 'center',
        color: '#000',
        marginBottom: 10,
    },
    resendText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        textAlign: 'center',
        color: '#916008',
        marginBottom: 10,
    },
    txt3: {
        color: '#916008',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 100,
    },
    txt4: {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 30,
    },
    underline: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    cont4: {
        position: 'absolute',
        bottom: 20,
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
    txt5: {
        color: 'black',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    txt6: {
        color: 'black',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        textDecorationLine: "underline",
    },
});

export default VerifyEmail;
