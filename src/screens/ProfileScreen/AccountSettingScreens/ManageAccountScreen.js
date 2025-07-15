import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image, Switch, ScrollView, TextInput, Linking } from "react-native";
import images from "../../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from 'react-native-simple-toast';
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from "../../../components/GlobalStyle";
import Modal from "react-native-modal";
import moment from 'moment'


const ManageAccount = ({ navigation }) => {

    const [activityStatus, setActivityStatus] = useState(false);
    const [viewStatus, setViewStatus] = useState(false);
    const [favoriteStatus, setFavoriteStatus] = useState(false);
    const [joinDateStatus, setJoinDateStatus] = useState(false);
    const [locationStatus, setLocationStatus] = useState(false);
    const [googleStatus, setGoogleStatus] = useState(true);
    const [appleStatus, setAppleStatus] = useState(false);
    const [ActivityButton, setActivityButton] = useState('Hide')
    const [otherprofileButton, setOtherProfileButton] = useState('Hide')
    const [dashboardButton, setDashBoardButton] = useState('Hide')
    const [measurementButton, setMeasurementButton] = useState('Metric System')
    const [userdetails, setUserDetails] = useState(null)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isPasswordVisible1, setPasswordVisible1] = useState(false);
    const [currentpassword, setCurrentPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [showtoggle, setShowToggle] = useState(false)
    const [showtoggle1, setShowToggle1] = useState(false)
    const [searchresult, setSearchResult] = useState(false)
    const [userprofiledata, setUserProfileData] = useState();
    const [isModalVisible, setModalVisible] = useState(false);
    const [isModalVisible1, setModalVisible1] = useState(false);
    const [plandetails, setPlanDetails] = useState(null)


    useEffect(() => {
        getSubscriptionDetail()
    }, [userdetails])

    const getSubscriptionDetail = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
        }
        try {
            const resp = await axios.post('payment/get-user-subscription-details', body, { headers })
            setPlanDetails(resp?.data?.data)
        } catch (error) {
            console.log('error from get details subscripiton', error.message.data.message);
        }
    }

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const data = await AsyncStorage.getItem('UserData');
                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    setUserDetails(parsedData);
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };
        fetchUserDetails();
    }, []);

    useEffect(() => {
        getUserProfileData()
    }, [userdetails])

    const getUserProfileData = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        try {
            const resp = await axios.get(`auth/user-profile`, { headers })
            // console.log('user profile dataa', resp?.data?.data);
            setUserProfileData(resp?.data?.data)
        } catch (error) {
            console.log('error frm the user profile', error.response.data.message);
        }
    }


    ////// API INTEGRATION //////
    useEffect(() => {
        loadSettingsFromStorage();
    }, []);

    useEffect(() => {
        updateAccount()
    }, [measurementButton, activityStatus, viewStatus, favoriteStatus, joinDateStatus, locationStatus, searchresult, googleStatus])

    const updateAccount = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            dashboardSearch: searchresult,
            preferredMeasurement: measurementButton === 'Metric System' ? false : true,
            activityAlert: {
                lastActive: activityStatus,
                viewSomeone: viewStatus,
                favouriteSomeone: favoriteStatus
            },
            otherProfileInfo: {
                joinDate: joinDateStatus,
                recentLoginLocation: locationStatus
            },
            connectAccount: {
                google: googleStatus
            }
        }
        console.log('response from the body of update account', body);
        try {
            const resp = await axios.put(`account/update-account-settings/${userdetails?._id}`, body, { headers })
            // console.log('response from the update account token', resp.data);
            await AsyncStorage.setItem('accountSettings', JSON.stringify(body));
        } catch (error) {
            console.log('error from the update account api', error.response.data.message);
        }
    }

    const loadSettingsFromStorage = async () => {
        try {
            const storedSettings = await AsyncStorage.getItem('accountSettings');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                setSearchResult(parsedSettings.dashboardSearch)
                setActivityStatus(parsedSettings.activityAlert.lastActive);
                setViewStatus(parsedSettings.activityAlert.viewSomeone);
                setFavoriteStatus(parsedSettings.activityAlert.favouriteSomeone);
                setJoinDateStatus(parsedSettings.otherProfileInfo.joinDate);
                setLocationStatus(parsedSettings.otherProfileInfo.recentLoginLocation);
                setMeasurementButton(parsedSettings.preferredMeasurement ? 'Imperial System' : 'Metric System');
                setGoogleStatus(parsedSettings.connectAccount.google)
            } else {
                fetchAccountSettings();
            }
        } catch (error) {
            console.error('Error loading settings from storage:', error.message);
            fetchAccountSettings();
        }
    };

    const fetchAccountSettings = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const headers = { Authorization: token };
            const response = await axios.get(`account/get-account-settings/${userdetails?._id}`, { headers });
            const data = response?.data?.data;
            setSearchResult(data.dashboardSearch)
            setActivityStatus(data?.activityAlert?.lastActive);
            setViewStatus(data?.activityAlert?.viewSomeone);
            setFavoriteStatus(data?.activityAlert?.favouriteSomeone);
            setJoinDateStatus(data?.otherProfileInfo?.joinDate);
            setLocationStatus(data?.otherProfileInfo?.recentLoginLocation);
            setMeasurementButton(data?.preferredMeasurement ? 'Imperial System' : 'Metric System');
            setGoogleStatus(data?.connectAccount?.google)

            // Save fetched settings to AsyncStorage
            await AsyncStorage.setItem('accountSettings', JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching account settings:', error.message);
        }
    };

    useEffect(() => {
        const switches = [activityStatus, viewStatus, favoriteStatus];
        const allTrue = switches.every((sw) => sw);
        setActivityButton(allTrue ? 'Visible' : 'Hide');
    }, [activityStatus, viewStatus, favoriteStatus]);

    useEffect(() => {
        const switches = [joinDateStatus, locationStatus];
        const allTrue = switches.every((sw) => sw);
        setOtherProfileButton(allTrue ? 'Visible' : 'Hide');
    }, [joinDateStatus, locationStatus]);


    const toggleChangePassword = () => {
        setShowToggle((prev) => !prev)
    }

    const toggleBilling = () => {
        setShowToggle1((prev) => !prev)
    }


    //// TO CHANGE PASSWORD ////
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const changeUserPassword = async () => {
        setErrorMessage('');

        // Validate if passwords match
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please re-enter.');
            return; // Stop further execution
        }

        // Validate if the new password is different from the current password
        if (currentpassword === password) {
            setErrorMessage('New Password should be different from Current Password');
            return; // Stop further execution
        }

        // Validate password format
        if (!passwordRegex.test(password)) {
            setErrorMessage('Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.');
            return; // Stop further execution
        }

        // Proceed with API call if all validations pass
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        let body = {
            confirmPassword: confirmPassword,
            newPassword: password,
            oldPassword: currentpassword
        };

        console.log('body of the change passw', body);

        try {
            const resp = await axios.post('auth/change-password', body, { headers });
            console.log('response from the change password api', resp.data);
            Toast.show(resp?.data?.message, Toast.SHORT);
            setCurrentPassword('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            Toast.show(error?.response?.data?.message, Toast.SHORT);
            console.log('error from the change password api', error?.response?.data?.message);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalVisible1(false)
    };


    return (
        <View style={styles.mainContainer}>

            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Manage your Account</Text>
                </View>
            </TouchableOpacity>

            <ScrollView>
                <View style={{ marginTop: 20 }}>
                    {/* Email Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Registered Email Address</Text>
                        <View style={styles.emailContainer}>
                            <Text style={styles.emailText}>{userdetails?.email}</Text>
                        </View>
                    </View>

                    {/* Language Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferred Language</Text>
                        <View style={styles.languageContainer}>
                            <Text style={styles.languageText}>English</Text>
                        </View>
                    </View>




                    <View>
                        <View style={styles.section}>
                            <View style={styles.languageContainer}>
                                <Text style={styles.sectionTitle}>Change Password</Text>
                                <TouchableOpacity onPress={toggleChangePassword}>
                                    <Image source={showtoggle ? images.dropdown : images.rightarrow} style={styles.icon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showtoggle ?
                            <View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Current Password"
                                        placeholderTextColor="#DDDDDD"
                                        value={currentpassword}
                                        onChangeText={setCurrentPassword}
                                    />
                                </View>

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

                                <TouchableOpacity onPress={changeUserPassword} style={{ borderWidth: 1, height: 40, width: '50%', justifyContent: 'center', alignSelf: 'center', borderRadius: 100, borderColor: '#916008', backgroundColor: '#916008', marginTop: 20 }}>
                                    <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Poppins-Medium', fontSize: 14 }}>Change Password</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            null}

                    </View>

                    <View style={styles.section}>
                        <View style={styles.languageContainer}>
                            <Text style={styles.sectionTitle}>Billing</Text>
                            <TouchableOpacity onPress={toggleBilling}>
                                <Image source={showtoggle1 ? images.dropdown : images.rightarrow} style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                        {showtoggle1 ?
                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 16, marginTop: 20 }} onPress={() => {
                                if (userprofiledata?.isSubscribed) {
                                    setModalVisible(true);
                                }
                            }} >
                                <Text>Subscription</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ borderWidth: 1, height: 10, width: 10, borderColor: userprofiledata?.isSubscribed ? 'green' : 'red', backgroundColor: userprofiledata?.isSubscribed ? 'green' : 'red', borderRadius: 100, top: 6, right: 5 }} />
                                    <Text style={{ color: '#3C4043', fontSize: 14, }}>{userprofiledata?.isSubscribed ? 'Active' : 'Inactive'}</Text>

                                </View>
                            </TouchableOpacity>
                            :
                            null}
                    </View>


                    {/* <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} /> */}

                    <View style={{ marginTop: 20, marginLeft: 16, marginRight: 16 }}>
                        <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Preferred Measurement System</Text>
                        <View style={{ height: 45, width: 300, backgroundColor: 'white', borderRadius: 100, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB', alignSelf: 'center', marginTop: 30 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    borderTopLeftRadius: 100,
                                    borderBottomLeftRadius: 100,
                                    borderRadius: measurementButton === 'Metric System' ? 100 : null,
                                    backgroundColor: measurementButton === 'Metric System' ? '#916008' : 'white',
                                }}
                                onPress={() => setMeasurementButton('Metric System')}
                            >
                                <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{
                                        color: measurementButton === 'Metric System' ? 'white' : 'black',
                                        fontSize: 14,
                                        fontFamily: 'Poppins-Medium',
                                        textAlign: 'center'
                                    }}>
                                        Metric System
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    borderTopRightRadius: 100,
                                    borderBottomRightRadius: 100,
                                    borderRadius: measurementButton === 'Imperial System' ? 100 : null,
                                    backgroundColor: measurementButton === 'Imperial System' ? '#916008' : 'white',
                                }}
                                onPress={() => setMeasurementButton('Imperial System')}
                            >
                                <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{
                                        color: measurementButton === 'Imperial System' ? 'white' : 'black',
                                        fontSize: 14,
                                        fontFamily: 'Poppins-Medium',
                                        textAlign: 'center'
                                    }}>
                                        Imperial System
                                    </Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </ScrollView>
            <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.cont4}>
                        <Text style={styles.txt13}>Current Active Plan</Text>
                        <View style={styles.cont5}>
                            <Image style={styles.img} source={images.tick1} />
                        </View>
                    </View>
                    <View style={styles.cont1}>
                        <Image source={images.stars} style={{ height: 40, width: 40 }} />
                        <Text style={styles.txt4}>{plandetails?.subscriptionPlanId?.name}</Text>
                        <Text style={[styles.txt4, { left: 5 }]}>{plandetails?.subscriptionPlanId?.price}</Text>
                        <Text style={[styles.txt4, { left: 8 }]}>{plandetails?.subscriptionPlanId?.currency.toUpperCase()}/{plandetails?.duration === 'Monthly' ? 'month' : plandetails?.duration === 'Quarterly' ? 'quarter' : plandetails?.duration === 'Annually' ? 'year' : null}</Text>
                    </View>
                    <View style={styles.cont2}>
                        <Text style={styles.txt5}>Next Payment:  <Text style={styles.txt7}>{moment(plandetails?.endDate).format('MMMM Do, YYYY')}</Text></Text>
                    </View>
                    <View style={{ marginLeft: 20, marginTop: 20 }}>
                        <Text style={styles.txt6}>Current Benefits</Text>
                        {plandetails?.subscriptionPlanId?.features?.map((feature, index) => (
                            <View key={index} style={styles.txt10}>
                                <Image source={images.tick1} style={styles.txt8} />
                                <Text style={styles.txt9}>{feature}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity onPress={() => { setModalVisible1(true); setModalVisible(false) }} style={{ marginTop: 30 }}>
                        <Text style={{ color: '#3C4043', fontSize: 16, textDecorationLine: 'underline' }}>Cancel Subscription</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={{ borderWidth: 1, height: 40, width: 80, marginTop: 30, alignSelf: "center", justifyContent: 'center', borderRadius: 5, borderColor: '#DDDDDD' }}>
                        <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', fontFamily: POPPINSRFONTS.medium }}>Back</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal isVisible={isModalVisible1} onBackdropPress={closeModal}>
                <View style={[styles.modalContainer, { padding: 24, borderRadius: 12, backgroundColor: 'white', height: 380 }]}>
                    <Text style={{
                        fontSize: 24,
                        fontFamily: PLAYFAIRFONTS.bold,
                        textAlign: 'center',
                        color: 'black'
                    }}>
                        Cancel Subscription?
                    </Text>

                    <Text style={{
                        fontSize: 16,
                        fontFamily: POPPINSRFONTS.regular,
                        textAlign: 'center',
                        color: 'black',
                        marginTop: 24
                    }}>
                        To cancel your subscription, please visit LuxuryLife through a web browser. Account cancellations cannot be processed in the app for security reasons.
                    </Text>

                    <Text style={{
                        fontSize: 16,
                        fontFamily: POPPINSRFONTS.regular,
                        textAlign: 'center',
                        color: 'black',
                        marginTop: 24
                    }}>
                        Visit{' '}
                        <Text
                            onPress={() => Linking.openURL('https://luxurylife.ai')}
                            style={{ color: '#916008', textDecorationLine: 'underline' }}
                        >
                            luxurylife.ai
                        </Text>{' '}
                        on your browser to complete your cancellation.
                    </Text>

                    <TouchableOpacity
                        onPress={() => setModalVisible1(false)}
                        style={{
                            marginTop: 32,
                            alignSelf: 'center',
                            paddingHorizontal: 24,
                            paddingVertical: 10,
                            borderRadius: 8,
                            borderColor: '#DDDDDD',
                            borderWidth: 1,
                        }}
                    >
                        <Text style={{
                            color: 'black',
                            fontSize: 14,
                            fontFamily: POPPINSRFONTS.medium,
                            textAlign: 'center'
                        }}>
                            Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>
    );
};

export default ManageAccount;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        // paddingHorizontal: 20,

    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 10

    },
    cont: {
        flexDirection: 'row',
        marginTop: 40,
        marginLeft: 16
    },
    txt: {
        fontSize: 23,
        fontFamily: POPPINSRFONTS.medium,
        marginLeft: 12,
        top: 3
    },
    headerText: {
        fontSize: 20,
        fontFamily: "Poppins-Bold",
        color: "black",
        marginVertical: 10,
    },
    section: {
        marginTop: 20,
        marginLeft: 16,
        marginRight: 16
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: POPPINSRFONTS.semibold,
        color: "black",
    },
    emailContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    emailText: {
        fontFamily: "Poppins-Regular",
        color: "gray",
        fontSize: 16
    },
    languageContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        marginRight: 10
    },
    languageText: {
        fontFamily: "Poppins-Regular",
        color: "gray",
        fontSize: 16

    },
    icon: {
        width: 20,
        height: 20,
        tintColor: "#916008",
    },
    sectionHeading: {
        fontFamily: POPPINSRFONTS.semibold,
        color: "black",
        fontSize: 16,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        // marginVertical: 10,
    },
    toggleTitle: {
        fontFamily: "Poppins-Regular",
        fontSize: 16,
        color: "black",
        marginTop: 10
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
        top: 20
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
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        // height: 440,
        width: "100%",
    },
    txt13: {
        color: '#3C4043',
        fontFamily: "Poppins-Regular",
        fontSize: 14,
    },
    cont4: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    cont5: {
        borderWidth: 1,
        height: 20,
        width: 20,
        borderRadius: 100,
        justifyContent: 'center',
        backgroundColor: 'black'
    },
    img: {
        height: 13,
        width: 13,
        tintColor: 'white',
        alignSelf: 'center'
    },
    cont1: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        // marginLeft: 20,
        elevation: 2
    },
    txt4: {
        color: 'black',
        fontFamily: 'Poppins-Bold',
        fontSize: 20,
        top: 2
    },
    cont2: {
        borderWidth: 1,
        height: 30,
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: '#ebd8ad',
        backgroundColor: '#ebd8ad',
        marginTop: 20
    },
    txt5: {
        color: 'black',
        fontFamily: 'Poppins-Bold',
        fontSize: 14,
        textAlign: 'center'
    },
    txt6: {
        color: 'black',
        fontSize: 14,
        fontFamily: "Poppins-SemiBold"
    },
    txt7: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    },
    txt8: {
        height: 15,
        width: 15,
        right: 5,
        top: 3
    },
    txt9: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular'
    },
    txt10: {
        flexDirection: 'row',
        margin: 5
    },
});
