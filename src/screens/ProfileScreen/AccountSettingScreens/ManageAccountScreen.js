import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image, Switch, ScrollView } from "react-native";
import images from "../../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";



const ManageAccount = ({ navigation }) => {



    const [activityStatus, setActivityStatus] = useState(false);
    const [viewStatus, setViewStatus] = useState(false);
    const [favoriteStatus, setFavoriteStatus] = useState(false);
    const [joinDateStatus, setJoinDateStatus] = useState(false);
    const [locationStatus, setLocationStatus] = useState(false);
    const [googleStatus, setGoogleStatus] = useState(false);
    const [appleStatus, setAppleStatus] = useState(false);
    const [facebookStatus, setFacebookStatus] = useState(false);
    const [instagramStatus, setInstagramStatus] = useState(false);
    const [linkedinStatus, setLinkedinStatus] = useState(false);
    const [ActivityButton, setActivityButton] = useState('Hide')
    const [otherprofileButton, setOtherProfileButton] = useState('Hide')
    const [dashboardButton, setDashBoardButton] = useState('Hide')
    const [measurementButton, setMeasurementButton] = useState('Hide')
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


    ////// API INTEGRATION //////
    useEffect(() => {
        loadSettingsFromStorage();
    }, []);

    useEffect(() => {
        updateAccount()
    }, [dashboardButton, measurementButton, activityStatus, viewStatus, favoriteStatus, joinDateStatus, locationStatus])

    const updateAccount = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            dashboardSearch: dashboardButton === 'Hide' ? false : true,
            preferredMeasurement: measurementButton === 'Hide' ? false : true,
            activityAlert: {
                lastActive: activityStatus,
                viewSomeone: viewStatus,
                favouriteSomeone: favoriteStatus
            },
            otherProfileInfo: {
                joinDate: joinDateStatus,
                recentLoginLocation: locationStatus
            },
        }
        console.log('response from the body of update account', body);
        try {
            const resp = await axios.put(`account/update-account-settings/${userdetails?._id}`, body, { headers })
            console.log('response from the update account token', resp.data);
            await AsyncStorage.setItem('accountSettings', JSON.stringify(body));
        } catch (error) {
            console.log('error from the update account api', error.message);
        }
    } 

    const loadSettingsFromStorage = async () => {
        try {
            const storedSettings = await AsyncStorage.getItem('accountSettings');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                setActivityStatus(parsedSettings.activityAlert.lastActive);
                setViewStatus(parsedSettings.activityAlert.viewSomeone);
                setFavoriteStatus(parsedSettings.activityAlert.favouriteSomeone);
                setJoinDateStatus(parsedSettings.otherProfileInfo.joinDate);
                setLocationStatus(parsedSettings.otherProfileInfo.recentLoginLocation);
                setDashBoardButton(parsedSettings.dashboardSearch ? 'Visible' : 'Hide');
                setMeasurementButton(parsedSettings.preferredMeasurement ? 'Visible' : 'Hide');
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
            setActivityStatus(data?.activityAlert?.lastActive);
            setViewStatus(data?.activityAlert?.viewSomeone);
            setFavoriteStatus(data?.activityAlert?.favouriteSomeone);
            setJoinDateStatus(data?.otherProfileInfo?.joinDate);
            setLocationStatus(data?.otherProfileInfo?.recentLoginLocation);
            setDashBoardButton(data?.dashboardSearch ? 'Visible' : 'Hide');
            setMeasurementButton(data?.preferredMeasurement ? 'Visible' : 'Hide');

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

    const toggleSectionSwitches = (status, setters) => {
        setters.forEach((setter) => setter(status));
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
                <View style={{ marginTop: 10 }}>
                    {/* Email Section */}
                    {/* <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Email</Text>
                        <View style={styles.emailContainer}>
                            <Text style={styles.emailText}>graphics.faiz**@gmail.com</Text>
                            <TouchableOpacity>
                                <Image source={images.edit} style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                    </View> */}

                    {/* Language Section */}
                    {/* <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Language</Text>
                        <View style={styles.languageContainer}>
                            <Text style={styles.languageText}>English</Text>
                            <TouchableOpacity>
                                <Image source={images.dropdown} style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} /> */}

                    {/* Your Activity Section */}

                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Your Activity</Text>
                            <View style={{ height: 45, width: 121, backgroundColor: 'white', borderRadius: 100, justifyContent: 'center', marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        borderTopLeftRadius: 100,
                                        borderBottomLeftRadius: 100,
                                        borderRadius: ActivityButton === 'Hide' ? 100 : null,
                                        backgroundColor: ActivityButton === 'Hide' ? '#916008' : 'white',
                                    }}
                                    onPress={() => {
                                        toggleSectionSwitches(false, [
                                            setActivityStatus,
                                            setViewStatus,
                                            setFavoriteStatus,
                                        ]);
                                    }}
                                >
                                    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Text style={{
                                            color: ActivityButton === 'Hide' ? 'white' : 'black',
                                            fontSize: 14,
                                            fontFamily: 'Poppins-Medium',
                                            textAlign: 'center'
                                        }}>
                                            Hide
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        borderTopRightRadius: 100,
                                        borderBottomRightRadius: 100,
                                        borderRadius: ActivityButton === 'Visible' ? 100 : null,
                                        backgroundColor: ActivityButton === 'Visible' ? '#916008' : 'white',
                                    }}
                                    onPress={() => {
                                        toggleSectionSwitches(true, [
                                            setActivityStatus,
                                            setViewStatus,
                                            setFavoriteStatus,
                                        ]);
                                    }}
                                >
                                    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Text style={{
                                            color: ActivityButton === 'Visible' ? 'white' : 'black',
                                            fontSize: 14,
                                            fontFamily: 'Poppins-Medium',
                                            textAlign: 'center'
                                        }}>
                                            Visible
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                            </View>
                        </View>

                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>Online Status / Last Active Date</Text>
                            <Switch
                                value={activityStatus}
                                onValueChange={setActivityStatus}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>When You View Someone</Text>
                            <Switch
                                value={viewStatus}
                                onValueChange={setViewStatus}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>When You Favorite Someone</Text>
                            <Switch
                                value={favoriteStatus}
                                onValueChange={setFavoriteStatus}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                    </View>

                    <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} />


                    {/* Other Profile Information */}
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Other Profile {'\n'}Information</Text>
                            <View style={{ height: 45, width: 121, backgroundColor: 'white', borderRadius: 100, justifyContent: 'center', marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB', }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        borderTopLeftRadius: 100,
                                        borderBottomLeftRadius: 100,
                                        borderRadius: otherprofileButton === 'Hide' ? 100 : null,
                                        backgroundColor: otherprofileButton === 'Hide' ? '#916008' : 'white',
                                    }}
                                    onPress={() => {
                                        toggleSectionSwitches(false, [
                                            setJoinDateStatus,
                                            setLocationStatus,
                                        ]);
                                    }}
                                >
                                    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Text style={{
                                            color: otherprofileButton === 'Hide' ? 'white' : 'black',
                                            fontSize: 14,
                                            fontFamily: 'Poppins-Medium',
                                            textAlign: 'center'
                                        }}>
                                            Hide
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        borderTopRightRadius: 100,
                                        borderBottomRightRadius: 100,
                                        borderRadius: otherprofileButton === 'Visible' ? 100 : null,
                                        backgroundColor: otherprofileButton === 'Visible' ? '#916008' : 'white',
                                    }}
                                    onPress={() => {
                                        toggleSectionSwitches(true, [
                                            setJoinDateStatus,
                                            setLocationStatus,
                                        ]);
                                    }}
                                >
                                    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Text style={{
                                            color: otherprofileButton === 'Visible' ? 'white' : 'black',
                                            fontSize: 14,
                                            fontFamily: 'Poppins-Medium',
                                            textAlign: 'center'
                                        }}>
                                            Visible
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                            </View>
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>Join Date</Text>
                            <Switch
                                value={joinDateStatus}
                                onValueChange={setJoinDateStatus}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>Recent Login Location</Text>
                            <Switch
                                value={locationStatus}
                                onValueChange={setLocationStatus}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                    </View>

                    <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} />


                    <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 20, marginLeft: 16, marginRight: 16 }}>
                        <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Search and Dashboard</Text>
                        <View style={{ height: 45, width: 121, backgroundColor: 'white', borderRadius: 100, justifyContent: 'center', marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    borderTopLeftRadius: 100,
                                    borderBottomLeftRadius: 100,
                                    borderRadius: dashboardButton === 'Hide' ? 100 : null,
                                    backgroundColor: dashboardButton === 'Hide' ? '#916008' : 'white',
                                }}
                                onPress={() => setDashBoardButton('Hide')}
                            >
                                <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{
                                        color: dashboardButton === 'Hide' ? 'white' : 'black',
                                        fontSize: 14,
                                        fontFamily: 'Poppins-Medium',
                                        textAlign: 'center'
                                    }}>
                                        Hide
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    borderTopRightRadius: 100,
                                    borderBottomRightRadius: 100,
                                    borderRadius: dashboardButton === 'Visible' ? 100 : null,
                                    backgroundColor: dashboardButton === 'Visible' ? '#916008' : 'white',
                                }}
                                onPress={() => setDashBoardButton('Visible')}
                            >
                                <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{
                                        color: dashboardButton === 'Visible' ? 'white' : 'black',
                                        fontSize: 14,
                                        fontFamily: 'Poppins-Medium',
                                        textAlign: 'center'
                                    }}>
                                        Visible
                                    </Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>

                    <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} />

                    <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 20, marginLeft: 16, marginRight: 16 }}>
                        <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Preferred {'\n'}Measurement System</Text>
                        <View style={{ height: 45, width: 121, backgroundColor: 'white', borderRadius: 100, justifyContent: 'center', marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    borderTopLeftRadius: 100,
                                    borderBottomLeftRadius: 100,
                                    borderRadius: measurementButton === 'Hide' ? 100 : null,
                                    backgroundColor: measurementButton === 'Hide' ? '#916008' : 'white',
                                }}
                                onPress={() => setMeasurementButton('Hide')}
                            >
                                <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{
                                        color: measurementButton === 'Hide' ? 'white' : 'black',
                                        fontSize: 14,
                                        fontFamily: 'Poppins-Medium',
                                        textAlign: 'center'
                                    }}>
                                        Hide
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    borderTopRightRadius: 100,
                                    borderBottomRightRadius: 100,
                                    borderRadius: measurementButton === 'Visible' ? 100 : null,
                                    backgroundColor: measurementButton === 'Visible' ? '#916008' : 'white',
                                }}
                                onPress={() => setMeasurementButton('Visible')}
                            >
                                <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{
                                        color: measurementButton === 'Visible' ? 'white' : 'black',
                                        fontSize: 14,
                                        fontFamily: 'Poppins-Medium',
                                        textAlign: 'center'
                                    }}>
                                        Visible
                                    </Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>

                    <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} />


                    {/* Connected Accounts */}
                    <View style={[styles.section, { marginBottom: 100 }]}>
                        <Text style={styles.sectionHeading}>Connected Accounts</Text>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>Google</Text>
                            <Switch
                                value={googleStatus}
                                onValueChange={() => setGoogleStatus((prev) => !prev)}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>Apple ID</Text>
                            <Switch
                                value={appleStatus}
                                onValueChange={() => setAppleStatus((prev) => !prev)}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>Facebook</Text>
                            <Switch
                                value={facebookStatus}
                                onValueChange={() => setFacebookStatus((prev) => !prev)}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>Instagram</Text>
                            <Switch
                                value={instagramStatus}
                                onValueChange={() => setInstagramStatus((prev) => !prev)}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleTitle}>LinkedIn</Text>
                            <Switch
                                value={linkedinStatus}
                                onValueChange={() => setLinkedinStatus((prev) => !prev)}
                                trackColor={{ false: "#C4C4C4", true: "#916008" }}
                                thumbColor={activityStatus ? "#FFF" : "#FFF"}
                            />
                        </View>
                    </View>
                </View>

            </ScrollView>
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
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        marginLeft: 12,
        top: 5
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
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
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
    },
    languageContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    languageText: {
        fontFamily: "Poppins-Regular",
        color: "gray",
    },
    icon: {
        width: 20,
        height: 20,
        tintColor: "#916008",
    },
    sectionHeading: {
        fontFamily: "Poppins-Bold",
        color: "black",
        fontSize: 16,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    toggleTitle: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "black",
    },
});
