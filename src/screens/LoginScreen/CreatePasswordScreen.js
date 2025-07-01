import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import images from "../../components/images";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-simple-toast';

const CreatePassword = ({ navigation, route }) => {

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isPasswordVisible1, setPasswordVisible1] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { id } = route.params;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const createPassword = async () => {
        setErrorMessage('');
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please re-enter.');
            return;
        }

        if (!passwordRegex.test(password)) {
            setErrorMessage(
                'Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.'
            );
            return;
        }

        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        const body = {
            userId: id,
            password: password,
            confirmPassword: confirmPassword,
        };

        console.log('Create password request body:', body);
        setIsLoading(true);

        try {
            const resp = await axios.post('auth/create-password', body, { headers });
            console.log('Password created successfully:', resp.data);
            Toast.show(resp?.data?.message, Toast.SHORT);
            navigation.navigate('LoginWithEmail');
        } catch (error) {
            console.error('Error creating password:', error.response || error.message);
            setErrorMessage('There was an error creating your password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={images.back} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.txt}>Create Your Password</Text>
            <Text style={styles.subtitle}>
                To ensure your account's security, please choose a new password.
            </Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Create a New Password"
                    placeholderTextColor="#DDDDDD"
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

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Re-Enter New Password"
                    placeholderTextColor="#DDDDDD"
                    secureTextEntry={!isPasswordVisible1}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                    onPress={() => setPasswordVisible1(!isPasswordVisible1)}
                    style={styles.eyeIconContainer}
                >
                    <Image
                        source={isPasswordVisible1 ? images.openeye : images.closeeye}
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Text style={styles.txt1}>
                Your password must be at least 8 characters long and {'\n'} include a mix of letters, numbers, and special {'\n'} characters.
            </Text>

            <View style={styles.cont4}>
                <TouchableOpacity onPress={createPassword}>
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

export default CreatePassword;

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
    txt: {
        color: 'black',
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        marginTop: 20,
    },
    subtitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E6EA',
        borderRadius: 9,
        marginBottom: 20,
        height: 45,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        paddingLeft: 15,
        fontSize: 14,
        color: '#000',
    },
    eyeIconContainer: {
        paddingHorizontal: 10,
    },
    eyeIcon: {
        height: 20,
        width: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10,
    },
    txt1: {
        color: '#7A7A7A',
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginTop: 30,
    },
    cont4: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        borderWidth: 1,
        height: 50,
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: '#916008',
        backgroundColor: '#916008',
        justifyContent: 'center',
    },
    txt12: {
        color: 'white',
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
    },
});
