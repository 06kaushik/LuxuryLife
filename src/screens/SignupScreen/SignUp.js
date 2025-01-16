import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, Button } from 'react-native';
import images from '../../components/images';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-simple-toast';
import { CheckBox } from 'react-native-elements';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthContext } from '../../components/AuthProvider';
import axios, { Axios } from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import LottieView from 'lottie-react-native';


const { width, height } = Dimensions.get('window');

const questionsList = [
    { label: 'What was the name of your first pet?', value: 'q1' },
    { label: 'What is your mother’s maiden name?', value: 'q2' },
    { label: 'What was the name of the street you grew up on?', value: 'q3' },
    { label: 'What is the name of your favorite teacher?', value: 'q4' },
    { label: 'What was your childhood nickname?', value: 'q5' },
    { label: 'What was the name of your first school?', value: 'q6' },
    { label: 'In what city were you born?', value: 'q7' },
    { label: 'What is your father’s middle name?', value: 'q8' },
    { label: 'What is the name of your best friend from childhood?', value: 'q9' },
    { label: 'What is your favorite movie?', value: 'q10' },
];

const SignUp = ({ navigation }) => {


    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerOpen, setDatePickerOpen] = useState(false)
    const [currentField, setCurrentField] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isChecked1, setIsChecked1] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isPasswordVisible1, setPasswordVisible1] = useState(false);
    const [timer, setTimer] = useState(60);
    const [question1, setQuestion1] = useState('');
    const [answer1, setAnswer1] = useState('');
    const [question2, setQuestion2] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [question3, setQuestion3] = useState('');
    const [answer3, setAnswer3] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const [selectedgender, setSelectedGender] = useState(null)
    const [selectinterest, setSelectInterest] = useState([])
    const [email, setEmail] = useState('')
    const [userId, setUserId] = useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [recaptchaVisible, setRecaptchaVisible] = useState(false);
    const inputRefs = [];
    const captchaFormRef = useRef(null);
    const [googletoken, setGoogleToken] = useState('')
    const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);

    const recaptchaSiteKey = '6LfjQ6YqAAAAAGZq85s28C8n5Y_FaMSzdzBsWB9K';
    const recaptchaUrl = 'https://www.google.com/recaptcha/api.js';

    const onMessage = event => {
        console.log('event--->>>>', event);

        if (event && event.nativeEvent.data) {
            if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
                captchaFormRef.current.hide();
                return;
            } else {
                // console.log('Verified code from Google', event.nativeEvent.data);
                setTimeout(() => {
                    captchaFormRef.current.hide();
                    // do whatever you want here
                }, 1500);
            }
        }
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

    /////// HANDLING API /////////

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;  // Basic email regex
        return re.test(email);
    };

    const createSignUp = async () => {

        if (!email) {
            Toast.show('Please enter your email.', Toast.SHORT);
            return;
        }
        if (
            email.length > 10 &&
            isChecked === true &&
            isChecked1 === true &&
            validateEmail(email)
        ) {
            const body = {
                email: email,
                gender: selectedgender,
                lookingFor: selectinterest,
                dateOfBirth: moment(selectedDate).format('YYYY-MM-DD'),
            };
            console.log('Sign-up request body:', body);
            try {
                const response = await axios.post('auth/sign-up', body);
                console.log('Sign-up response:', response.data);
                Toast.show(response.data.message, Toast.SHORT);
                await sendOtp(email);
                setCurrentStep(4);
            } catch (error) {
                console.error('Error during sign-up:', error.response || error.message);
                Toast.show('Sign-up failed. Please try again.', Toast.SHORT);
            }
        } else {
            Toast.show('Please verify you are not a robot,accept terms and condition and check your credentials to proceed', Toast.SHORT);
        }
    };


    const sendOtp = async (userEmail) => {
        const body = {
            email: userEmail,
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

    const verifyOtp = async (body) => {
        try {
            const resp = await axios.put('auth/verify-otp', body);
            console.log('Response from OTP verification:', resp.data);
            const userId = resp.data?.data.user?._id;
            if (!userId) {
                throw new Error('User ID not found in response');
            }
            setUserId(userId);
            return resp.data;
        } catch (error) {
            Toast.show(error?.data?.message, Toast.SHORT);
            throw error;
        }
    };


    const createPassword = async () => {
        const token = await AsyncStorage.getItem('verifcationToken')
        const headers = {
            Authorization: token
        }
        const body = {
            userId: userId,
            password: password,
            confirmPassword: confirmPassword,
        };
        console.log('Create password request body:', body);
        try {
            const resp = await axios.post('auth/create-password', body, { headers });
            console.log('Password created successfully:', resp.data);
            Toast.show('Password created successfully.', Toast.SHORT);
            return resp.data;
        } catch (error) {
            console.error('Error creating password:', error.response || error.message);
            throw error;
        }
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return 'Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.';
        }
        return '';
    };


    const getSecurityQuestion = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        const body = {
            userId: userId,
            questions: [
                {
                    questionId: 1,
                    question: question1,
                    answerHash: answer1,
                },
                {
                    questionId: 2,
                    question: question2,
                    answerHash: answer2,
                },
                {
                    questionId: 3,
                    question: question3,
                    answerHash: answer3,
                },
            ],
        };
        // console.log('Body of security question:', body);

        try {
            const resp = await axios.put(`auth/update-security-questions/${userId}`, body, { headers });
            // console.log('Response from the security questions:', resp);
        } catch (error) {
            console.error('Error from the security question API:', error.response || error.message);
            throw error; // Ensure the calling function can handle the error
        }
    };


    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '387779373749-3ikotarkoc8ilie4tqkmstmpuo6kc7tt.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const handleGoogleSignIn = async () => {
        if (
            isChecked === true &&
            isChecked1 === true
        ) {
            try {
                setIsLoading(true);
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();
                const idToken = userInfo.data.idToken;
                setGoogleToken(idToken)
                const body = {
                    idToken: idToken,
                    gender: selectedgender,
                    lookingFor: selectinterest,
                    dateOfBirth: moment(selectedDate).format('YYYY-MM-DD')
                }
                console.log('body of google signup', body);
                try {
                    const resp = await axios.post('auth/sign-in-google', body)
                    console.log('response from the google signUp', resp.data);
                    await AsyncStorage.setItem('verifcationToken', resp?.data?.data?.token)
                    const userId = resp.data?.data.user?._id;
                    setUserId(userId);
                    Toast.show('User Verified Successfully.', Toast.SHORT);
                    setCurrentStep(6);
                } catch (error) {
                    console.log('error from the google sign up', error.message);

                }
            } catch (error) {
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    Alert.alert('Cancelled', 'User cancelled the sign-in process.');
                } else if (error.code === statusCodes.IN_PROGRESS) {
                    Alert.alert('In Progress', 'Sign-in process is already in progress.');
                } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    Alert.alert('Error', 'Google Play Services are not available.');
                } else {
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            Toast.show('Please verify you are not a robot and accept terms and condition.', Toast.SHORT);
        }
    };

    const handleGenderSelect = (type) => {
        setSelectedGender(type);
    };

    const handleInteretSelect = (type) => {

        if (selectinterest.includes(type)) {
            setSelectInterest(selectinterest.filter((item) => item !== type));
        } else if (selectinterest.length < 4) {
            setSelectInterest([...selectinterest, type]);
        }
    };

    const showDatePicker = () => {
        setDatePickerOpen(true)
    }

    const hideDatePicker = () => {
        setDatePickerOpen(false)
    }

    const handleDateConfirm = (date) => {

        const userAge = calculateAge(date);
        if (userAge >= 18) {
            setSelectedDate(date);
            setDatePickerOpen(false);
        } else {
            Toast.show('You must be atleat 18 years old to use this service.', Toast.SHORT);
            setDatePickerOpen(false);
        }
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const resetTimer = () => {
        createSignUp()
        setTimer(60);
    };

    const handleOtpChange = (value, index) => {
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
        if (value && index < otp.length - 1) {
            const nextInput = index + 1;
            inputRefs[nextInput].focus();
        }
    };


    const renderDropdownWithInput = (label, selectedValue, setSelectedValue, answerValue, setAnswerValue) => (
        <View style={styles.dropdownContainer}>
            <View style={styles.dropdown}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={(value) => setSelectedValue(value)}
                    style={styles.picker}
                    dropdownIconColor="transparent"
                >
                    <Picker.Item label={label} value="" />
                    {questionsList.map((question) => (
                        <Picker.Item
                            key={question.value}
                            label={question.label}
                            value={question.label}
                        />
                    ))}
                </Picker>
                {/* <Image source={images.dropdown} style={styles.downArrowIcon} /> */}
            </View>
            <TextInput
                style={styles.textInput}
                placeholder="Type your answer here"
                placeholderTextColor="#999"
                value={answerValue}
                onChangeText={setAnswerValue}
            />
        </View>
    );

    const handleContinue = async () => {
        if (currentStep === 6) {
            // Validate that all questions are different
            const questionsSet = new Set([question1, question2, question3]);
            if (questionsSet.size !== 3) {
                Toast.show('All security questions must be different.', Toast.SHORT);
                return;
            }

            // Validate that answers are not empty
            if (!answer1 || !answer2 || !answer3) {
                Toast.show('All answers must be provided.', Toast.SHORT);
                return;
            }

            try {
                await getSecurityQuestion(); // Call the function to update security questions
                Toast.show('Security questions updated successfully.', Toast.SHORT);
                navigation.navigate('ProfileSignUp', { userId: userId, password: password, email: email }); // Proceed to the ProfileSignUp screen
            } catch (error) {
                console.error('Error updating security questions:', error.response || error.message);
                Toast.show('Failed to update security questions. Please try again.', Toast.SHORT);
            }
            return;
        }

        if (currentStep === 1 && (selectedgender === null || selectinterest.length === 0)) {
            Toast.show('Select Both The Options To Continue', Toast.SHORT);
            return;
        }

        if (currentStep === 2 && !selectedDate) {
            alert('Please select your date of birth');
            return;
        }

        if (currentStep === 3) {
            try {
                await createSignUp();
            } catch (error) {
                console.error('Error during sign-up or OTP sending:', error);
                return;
            }
            return;
        }

        if (currentStep === 4) {
            const enteredOtp = otp.join('');
            if (!enteredOtp || enteredOtp.length < 4) {
                alert('Please enter a valid 4-digit OTP');
                return;
            }

            try {
                // Verify OTP and move to the next step only if successful
                const body = {
                    email: email,
                    otp: enteredOtp,
                };
                console.log('body of verify otpp', body);

                const resp = await verifyOtp(body);
                // console.log('OTP verified successfully:', resp);
                await AsyncStorage.setItem('verifcationToken', resp?.data?.token)
                Toast.show('OTP verified successfully.', Toast.SHORT);
                setCurrentStep(5); // Proceed to the next step
            } catch (error) {
                // console.error('Error verifying OTP:', error.response || error.message);
                Toast.show('Wrong OTP', Toast.SHORT);
                return; // Do not proceed if OTP verification fails
            }
        }

        if (currentStep === 5) {
            const passwordError = validatePassword(password);
            if (passwordError) {
                setErrorMessage(passwordError);
                return;
            }
            if (!password || !confirmPassword || password.length < 8) {
                setErrorMessage('Password must be at least 8 characters long.');
                return;
            }
            if (password !== confirmPassword) {
                setErrorMessage('Passwords do not match. Please try again.');
                return;
            }
            try {
                await createPassword(); // Call createPassword function
                setCurrentStep(6); // Move to the next step
            } catch (error) {
                console.error('Error creating password:', error.response || error.message);
                Toast.show('Failed to create password. Please try again.', Toast.SHORT);
                return; // Stay on step 5 if password creation fails
            }
        }

        if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
        }
    };



    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getStepNote = () => {
        switch (currentStep) {
            case 1:
                return 'Your preferences help us tailor your matches according to your desires.';
            case 2:
                return 'You must be at least 18 years old to use this service.';
            case 3:
                return 'Linking your account does not grant us permission to post on your behalf without explicit consent.';
            case 4:
                return 'Please check your email and spam folder for the OTP.';
            case 5:
                return 'Choose a strong password to protect your account.';
            case 6:
                return 'This information will be used for account recovery and will remain confidential.'
            default:
                return '';
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ScrollView>
                        <View>
                            <Text style={styles.title}>Where Ambition Meets Affluence</Text>
                            <Text style={styles.subtitle}>
                                Let's get to know you better to create your personalized {'\n'} luxury dating experience.
                            </Text>
                            <Text style={styles.question}>What is your gender?</Text>
                            {['Male', 'Female', 'Non-binary/Other'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[styles.optionContainer, selectedgender === option && styles.selectedBodyTypeButton]}
                                    onPress={() => handleGenderSelect(option)}>
                                    <Text style={[styles.optionText, selectedgender === option && styles.selectedBodyTypeText]}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={styles.question}>Who are you interested in?</Text>
                            {['Male', 'Female', 'Non-binary/Other', 'Both'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[styles.optionContainer, selectinterest.includes(option) && styles.selectedBodyTypeButton]}
                                    onPress={() => handleInteretSelect(option)}>
                                    <Text style={[styles.optionText, selectinterest.includes(option) && styles.selectedBodyTypeText]}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                );
            case 2:
                return (
                    <View>
                        <Text style={styles.txt}>Tell Us Your Date of Birth</Text>
                        <Text style={styles.txt1}>
                            To ensure you meet our platform's age {'\n'} requirements, please enter your date of birth.
                        </Text>
                        <View style={styles.cont}>
                            <TouchableOpacity style={styles.cont1} onPress={showDatePicker}>
                                <Text style={styles.txt2}>
                                    {selectedDate ? selectedDate.getDate().toString().padStart(2, '0') : 'DD'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cont1} onPress={showDatePicker}>
                                <Text style={styles.txt2}>
                                    {selectedDate ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(selectedDate) : 'Month'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cont1} onPress={showDatePicker}>
                                <Text style={styles.txt2}>
                                    {selectedDate ? selectedDate.getFullYear() : 'YYYY'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <DatePicker
                            modal
                            open={isDatePickerOpen}
                            mode='date'
                            date={selectedDate || newDate()}
                            onConfirm={handleDateConfirm}
                            onCancel={hideDatePicker}
                            theme='light'
                        />
                        {selectedDate && calculateAge(selectedDate) >= 18 && (
                            <View>
                                <Text style={styles.txt3}>{selectedDate ? `Age ${calculateAge(selectedDate)} years` : ''}</Text>
                            </View>
                        )}

                    </View>
                );
            case 3:
                return (
                    <ScrollView style={{}}>
                        <View>
                            <Text style={styles.txt4}>Great! Let's Link Your Account</Text>
                            <Text style={styles.txt5}>Connect your account to get started quickly and {'\n'} securely.</Text>
                            <View>
                                <TextInput
                                    placeholder='Enter email'
                                    placeholderTextColor={'#DDDDDD'}
                                    value={email}
                                    onChangeText={setEmail}
                                    style={styles.inputbox} />
                            </View>
                            <Text style={styles.txt6}>or continue with</Text>
                            <TouchableOpacity onPress={handleGoogleSignIn} disabled={isLoading}>
                                <View style={styles.cont2}>
                                    <Image source={images.google} style={{ height: 20, width: 20, alignSelf: 'center' }} />
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#000" />
                                    ) : (
                                        <Text style={styles.txt7}>SignUp with Google</Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', alignSelf: 'center', marginTop: 10 }}>
                                {/* Positioning the checkbox just before the text */}
                                <CheckBox
                                    checked={isChecked1}
                                    onPress={() => setIsChecked1(!isChecked1)}
                                    size={20}
                                    containerStyle={{ margin: 0, padding: 0, left: 5 }}
                                    style={{ marginRight: 10, alignSelf: 'flex-start', }}
                                />

                                <Text style={[styles.txt8, {}]}>
                                    By linking your account, you agree to our
                                    <Text style={styles.underline}> Terms</Text> and
                                    <Text style={styles.underline}> Privacy Policy</Text>
                                </Text>
                            </View>



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
                            <Text></Text>
                        </View>
                    </ScrollView>
                );
            case 4:
                return (
                    <View >
                        <Text style={styles.txt13}>Verify Your Email</Text>
                        <Text style={styles.txt14}>
                            Enter the verification code sent to your email to {'\n'} proceed.
                        </Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs[index] = ref)}
                                    style={styles.otpInput}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                />
                            ))}
                        </View>
                        {timer > 0 ?
                            <Text style={styles.timerText}>
                                This code will expire in
                            </Text>
                            :
                            null
                        }

                        {timer > 0 ?
                            <Text style={styles.txt15}>
                                00:{timer}
                            </Text>
                            :
                            <TouchableOpacity onPress={resetTimer}>
                                <Text style={styles.txt16}>Resend OTP</Text>
                            </TouchableOpacity>
                        }

                    </View>
                );
            case 5:
                return (
                    <View>
                        <Text style={styles.txt13}>Create Your Password</Text>
                        <Text style={styles.txt14}>To ensure your account's security, please choose a {'\n'} new password.</Text>

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
                    </View>
                );

            case 6:
                return (
                    <ScrollView style={{}}>
                        <View>
                            <Text style={styles.txt13}>Set Up Your Security Question</Text>
                            <Text style={styles.txt14}>To help secure your account, please select three {'\n'} security questions and provide answers.This will be{'\n'}used to verify your identity in case you need to reset {'\n'} your password later.</Text>

                            {renderDropdownWithInput('Select Question 1', question1, setQuestion1, answer1, setAnswer1)}
                            {renderDropdownWithInput('Select Question 2', question2, setQuestion2, answer2, setAnswer2)}
                            {renderDropdownWithInput('Select Question 3', question3, setQuestion3, answer3, setAnswer3)}
                        </View>
                    </ScrollView>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.header}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.headerText}>Profile</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.lineContainer}>
                <View
                    style={[
                        styles.line,
                        { width: `${(currentStep / 6) * 100}%` },
                    ]}
                />
            </View>
            <View style={styles.stepContent}>{renderStepContent()}</View>
            <View style={styles.footer}>
                <Text style={styles.note}>{getStepNote()}</Text>

                <View style={styles.footerButtonsContainer}>
                    {currentStep > 1 && (
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            currentStep === 1 ? styles.fullWidthButton : styles.continueButton,
                        ]}
                        onPress={handleContinue}
                    >
                        <Text style={styles.buttonText}>
                            {currentStep === 6 ? 'Continue' : 'Continue'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'flex-start',
    },
    header: {
        flexDirection: 'row',
        marginTop: height * 0.03,
        marginLeft: width * 0.05,
        alignItems: 'center',
    },
    backIcon: {
        height: width * 0.06,
        width: width * 0.06,
        top: height * 0.005,
    },
    headerText: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.06,
        marginLeft: width * 0.04,
        top: 5
    },
    lineContainer: {
        width: '90%',
        height: 5,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 20,
    },
    line: {
        height: '100%',
        backgroundColor: '#5F3D23',
        borderRadius: 5,
    },
    stepContent: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    stepText: {
        fontSize: 16,
        color: '#333',
    },
    footer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: height * 0.03,
    },
    note: {
        fontSize: 10,
        color: '#7A7A7A',
        fontFamily: 'Poppins-Italic',
        textAlign: 'center',
        marginBottom: 10, // Adjust spacing above the buttons
    },
    footerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    backButton: {
        width: '45%',
        height: 50,
        backgroundColor: '#B0BEC5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    continueButton: {
        width: '45%',
        height: 50,
        backgroundColor: '#5F3D23',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    fullWidthButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#5F3D23',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 20,
    },

    stepContentText: {
        fontSize: width * 0.05,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: height * 0.03,
        paddingLeft: 15,
        fontSize: width * 0.05,
    },
    continueButtonContainer: {
        position: 'absolute',
        bottom: height * 0.05,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'center'
    },


    title: {
        fontFamily: 'Poppins-Medium',
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: 'black',
        textAlign: 'center',
    },
    question: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        textAlign: 'center',
        marginTop: 10,
    },
    optionContainer: {
        borderWidth: 1,
        height: 44,
        width: '80%',
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: '#E8E6EA',
        backgroundColor: 'white',
        marginTop: 10,
        justifyContent: 'center',
    },
    optionText: {
        color: '#3C4043',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
    hint: {
        color: '#7A7A7A',
        fontSize: 10,
        fontFamily: 'Poppins-Italic',
        textAlign: 'center',
        marginTop: 40,
    },
    txt: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        textAlign: 'center',
        marginTop: '20'
    },
    txt1: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        textAlign: 'center'

    },
    txt2: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        textAlign: 'center'
    },
    cont: {
        flexDirection: 'row',
        margin: 1,
        alignSelf: 'center',
        marginTop: 40
    },
    cont1: {
        borderWidth: 1,
        height: 44,
        width: 58,
        margin: 10,
        borderRadius: 20,
        justifyContent: 'center',
        borderColor: '#E8E6EA'
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    confirmButton: {
        marginTop: 20,
        backgroundColor: '#5F3D23',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
    },
    txt3: {
        textAlign: 'center',
        color: 'black',
        fontSize: 16,
        fontFamily: 'Poppins-Medium'
    },
    txt4: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        textAlign: 'center',
        marginTop: 20,
    },
    txt5: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 10
    },
    inputbox: {
        height: 44,
        width: '90%',
        borderWidth: 1,
        borderColor: '#E8E6EA',
        borderRadius: 9,
        alignSelf: 'center',
        marginTop: 30,
        paddingLeft: 20,
        color: 'black'
    },
    txt6: {
        textAlign: 'center',
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: 'grey',
        marginTop: 30
    },
    cont2: {
        borderWidth: 1,
        height: 44,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: '#C4C4C4',
        backgroundColor: 'white',
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'center'

    },
    txt7: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        textAlign: 'center',
        alignSelf: 'center',
        left: 10
    },
    underline: {
        textDecorationLine: 'underline',
        textDecorationColor: 'white',
    },
    txt8: {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        // textAlign: 'left',
        textAlign: 'center',
        flexWrap: 'wrap',
        width: '80%',
        marginTop: 20, // Adjust this value for vertical spacing
    },


    cont3: {
        height: 76,
        width: '70%',
        borderWidth: 1,
        backgroundColor: '#F9F9F9',
        alignSelf: 'center',
        borderColor: '#F9F9F9',
        elevation: 2,
        opacity: 2,
        marginTop: 50,
        justifyContent: 'center'
    },
    txt9: {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        fontSize: 12
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        backgroundColor: 'white',
    },
    checkedCheckbox: {
        backgroundColor: '#5F3D23',
    },
    txt10: {
        color: '#7B7B7B',
        fontSize: 10
    },
    txt11: {
        color: '#7B7B7B',
        fontSize: 8
    },
    txt12: {
        color: '#7A7A7A',
        fontFamily: 'Poppins-Italic',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 80
    },
    txt13: {
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        textAlign: 'center',
        color: 'black',
        marginTop: 20
    },
    txt14: {
        ontFamily: 'Poppins-Regular',
        fontSize: 13,
        textAlign: 'center',
        color: '#3C4043',
    },
    txt14: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
        marginLeft: 20,
        marginRight: 20
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 18,
        marginHorizontal: 5,
    },
    timerText: {
        fontSize: 16,
        color: '#3C4043',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular'
    },
    button: {
        width: '80%',
        padding: 15,
        backgroundColor: '#5F3D23',
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    txt15: {
        textAlign: 'center',
        fontFamily: 'Poppins-Bold',
        fontSize: 34,
        color: 'black'
    },
    txt16: {
        color: 'black',
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E6EA',
        borderRadius: 9,
        marginBottom: 20,
        height: 45,
        width: '90%',
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
    txt17: {
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#7A7A7A',
        marginTop: 20
    },
    dropdownContainer: {
        marginBottom: 20,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: 'white',
        height: 50,
        paddingHorizontal: 10,
        position: 'relative',
    },
    picker: {
        flex: 1,
        color: '#000',
    },
    downArrowIcon: {
        width: 20,
        height: 20,
        position: 'absolute',
        right: 15,
        tintColor: '#999',
    },
    textInput: {
        marginTop: 10,
        height: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        color: '#000',
    },
    txt18: {
        color: '#7A7A7A',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 20,
    },
    dropdown: {
        height: 44,
        width: '90%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 10,
        backgroundColor: 'white',
        alignSelf: 'center'
    },
    dropdownText: {
        fontSize: 14,
        color: '#555',
    },
    textInput: {
        marginTop: 10,
        height: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        color: '#000',
        width: '90%',
        alignSelf: 'center'
    },
    arrowIcon: {
        height: 20,
        width: 20,
        right: 20
    },
    txt18: {
        color: '#7A7A7A',
        fontFamily: 'Poppins-Italic',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 20
    },
    selectedBodyTypeButton: {
        backgroundColor: '#5F3D23',
        borderColor: '#5F3D23',
    },
    selectedBodyTypeText: {
        color: '#FFF',
        fontFamily: 'Poppins-Bold',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
        marginLeft: 16,
        marginRight: 16
    },
    buttonContainer: {
        backgroundColor: 'orange',
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 4,
    },
    // txt: {
    //     fontSize: 15,
    //     fontWeight: '600',
    // },

});

export default SignUp;
