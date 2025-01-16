import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from "react-native";
import images from "../../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const SecurityInformation = ({ navigation }) => {

    const [securityQuestions, setSecurityQuestions] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [userdetails, setUserDetails] = useState(null)


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
        loadSettingsFromStorage();
    }, []);

    useEffect(() => {
        handleSecurity()
    }, [securityQuestions, twoFactorAuth])


    const handleSecurity = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            securituySetting: {
                securityQuestion: securityQuestions,
                toFactorAuth: twoFactorAuth
            },
        }
        console.log('body of handle security', body);

        try {
            const resp = await axios.put(`account/update-account-settings/${userdetails?._id}`, body, { headers })
            console.log('response from handle security', resp.data.data);
            await AsyncStorage.setItem('accountSecurity', JSON.stringify(body));

        } catch (error) {
            console.log('error from handle security', error.message);
        }
    }

    const loadSettingsFromStorage = async () => {
        try {
            const storedSettings = await AsyncStorage.getItem('accountSecurity');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                setSecurityQuestions(parsedSettings.securituySetting.securityQuestion);
                setTwoFactorAuth(parsedSettings.securituySetting.toFactorAuth);

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
            const data = response.data.data;
            setSecurityQuestions(data.securituySetting.securityQuestion);
            setTwoFactorAuth(data.securituySetting.toFactorAuth);
            await AsyncStorage.setItem('accountSecurity', JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching account settings:', error.message);

        }
    }


    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={images.back} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Security Information</Text>
            </View>

            {/* Security Information Section */}
            <Text style={styles.sectionTitle}>Security Information</Text>
            <Text style={styles.sectionDescription}>
                Here are our options to give your account some additional security:
            </Text>

            {/* Security Questions */}
            <View style={styles.sectionContainer}>
                <View style={styles.toggleContainer}>
                    <Text style={styles.subHeader}>Security questions</Text>
                    <Switch
                        value={securityQuestions}
                        onValueChange={() => setSecurityQuestions((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <Text style={styles.descriptionText}>
                    Security questions will be used for password recovery if you forget your password and
                    cannot access your email.
                </Text>
            </View>

            {/* Two-Factor Authentication */}
            <View style={styles.sectionContainer}>
                <View style={styles.toggleContainer}>
                    <Text style={styles.subHeader}>Two-Factor Authentication</Text>
                    <Switch
                        value={twoFactorAuth}
                        onValueChange={() => setTwoFactorAuth((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <Text style={styles.descriptionText}>
                    Two-Factor authentication adds an extra layer of security to your account. The first time
                    you log in from any device (or when you reset your password) you will be sent a text
                    message with a unique code. This code will be required to log in, meaning someone would
                    need both your password and access to your phone to log into your account.
                </Text>
            </View>

            {/* Additional Data Privacy Options */}
            <TouchableOpacity onPress={() => navigation.navigate('AdditionalSecurity')} style={styles.privacyContainer}>
                <Text style={styles.subHeader}>Additional data privacy options</Text>
                <Image source={images.rightarrow} style={styles.arrowIcon} />
            </TouchableOpacity>
            <Text style={styles.privacyDescription}>
                Request an export or the deletion of your personal data
            </Text>
        </View>
    );
};

export default SecurityInformation;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    headerText: {
        fontSize: 20,
        fontFamily: "Poppins-Medium",
        color: "black",
        top: 3
    },
    sectionTitle: {
        fontSize: 24,
        fontFamily: "Poppins-Bold",
        color: "black",
        marginBottom: 10,
    },
    sectionDescription: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "#5F6368",
        marginBottom: 20,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: "black",
    },
    descriptionText: {
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: "#5F6368",
        marginTop: 5,
    },
    privacyContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
    },
    arrowIcon: {
        width: 20,
        height: 20,
        tintColor: "#916008",
    },
    privacyDescription: {
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: "#5F6368",
        marginTop: 5,
    },
});
