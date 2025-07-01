import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import images from "../components/images";
import DashBoardScreen from "../screens/DashBoard/DashBoardScreen";
import InterestTopNavigator from "./LikeTopNavigator";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen/ProfileScreen";
import FileredUsers from "../screens/FilteredUsers.js/FilteredUsers";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotifications } from "../components/NotificationContext";


const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {

    const [userprofiledata, setUserProfileData] = useState();
    const [userdetails, setUserDetails] = useState(null);
    const [messagecount, setMessageCount] = useState(0)
    const [viewlike, setViewCount] = useState(0)
    const [apiMessageCount, setApiMessageCount] = useState(0);  // Store API count separately
    const [apiProfileViewCount, setApiProfileViewCount] = useState(0);
    const {
        messageCount: socketMessageCount,
        profileViewCount: socketProfileViewCount,
        updateMessageCount,
        updateProfileViewCount
    } = useNotifications();



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


    useEffect(() => {
        setMessageCount(apiMessageCount + socketMessageCount);
        setViewCount(apiProfileViewCount + socketProfileViewCount);
    }, [socketMessageCount, socketProfileViewCount, apiMessageCount, apiProfileViewCount]);


    const getUserProfileData = async () => {
        const token = await AsyncStorage.getItem("authToken");
        const headers = {
            Authorization: token,
        };
        try {
            const resp = await axios.get(`auth/user-profile`, { headers });
            setUserProfileData(resp?.data?.data);
            const notificationSetting = resp?.data?.data?.notificationSetting || [];
            const apiMessageCount = notificationSetting.filter((item) => item === "MESSAGE").length;
            const apiProfileViewCount = notificationSetting.filter((item) => item === "PROFILE_VIEW").length;

            // Set the initial counts from the API response
            setApiMessageCount(apiMessageCount);  // Store the API message count
            setApiProfileViewCount(apiProfileViewCount);
        } catch (error) {
            console.log("error from the user profile", error.response.data.message);
        }
    };


    const updateCounter = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            type: 'MESSAGE'
        }
        try {
            const resp = await axios.put('home/notification-counter-update', body, { headers })
            // console.log('response from the update token api', resp.data);
        } catch (error) {
            console.log('error from the update count api', error.response.data.message);
        }
    }

    const updateCounterLike = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            type: 'PROFILE_VIEW'
        }
        try {
            const resp = await axios.put('home/notification-counter-update', body, { headers })
            // console.log('response from the update token api', resp.data);
        } catch (error) {
            console.log('error from the update count api', error.response.data.message);
        }
    }


    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            {/* Gradient Background at the Bottom */}
            <LinearGradient
                colors={["black", "#301F12"]}
                style={styles.gradientBackground}
            />

            {/* Bottom Tab Navigator */}
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => {
                        let iconSource;
                        if (route.name === "Dash") {
                            iconSource = images.cards;
                        } else if (route.name === "Likes") {
                            iconSource = images.heart;
                        } else if (route.name === "Chat") {
                            iconSource = images.chat1;
                        } else if (route.name === 'Search') {
                            iconSource = images.search
                        } else if (route.name === "Profile") {
                            iconSource = images.user;
                        }

                        return (
                            <View style={styles.iconContainer}>
                                <Image
                                    source={iconSource}
                                    style={{
                                        width: 36,
                                        height: 35,
                                        tintColor: focused ? "white" : "#6A513E",
                                        marginTop: 20,
                                    }}
                                />

                                {route.name === 'Chat' && messagecount > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.notificationText}>{messagecount}</Text>
                                    </View>
                                )}
                                {/* Display Profile View Count on Like Icon */}
                                {route.name === 'Likes' && viewlike > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.notificationText}>{viewlike}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                    tabBarActiveTintColor: "white",
                    tabBarInactiveTintColor: "#6A513E",
                    tabBarStyle: styles.tabBarStyle,
                    tabBarButton: (props) => {
                        if (route.name === "Chat") {
                            return (
                                <TouchableOpacity
                                    {...props}
                                    onPress={() => {
                                        updateCounter();
                                        updateMessageCount(0);
                                        setMessageCount(0);
                                        props.onPress?.();
                                    }}
                                />
                            );
                        } if (route.name === "Likes") {
                            return (
                                <TouchableOpacity
                                    {...props}
                                    onPress={() => {
                                        updateCounterLike();
                                        updateProfileViewCount(0);
                                        setViewCount(0);
                                        props.onPress?.();
                                    }}

                                ></TouchableOpacity>
                            )

                        }
                        return <TouchableOpacity {...props} />;
                    },

                })}
            >
                <Tab.Screen name="Dash" component={DashBoardScreen} />
                <Tab.Screen name="Likes" component={InterestTopNavigator} />
                <Tab.Screen name="Chat" component={ChatScreen} />
                <Tab.Screen name="Search" component={FileredUsers} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </View>
    );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
    gradientBackground: {
        position: "absolute",
        bottom: 0,
        height: 80,
        width: width,
        zIndex: -1,
    },
    tabBarStyle: {
        backgroundColor: "#301F12",
        height: 60,
        borderRadius: 100,
        marginHorizontal: 16,
        // marginBottom: 20,
        justifyContent: "center",
        elevation: 0,
        shadowOpacity: 0,
        borderTopWidth: 0,
        marginTop: 8
    },

    iconContainer: {
        alignItems: "center",
        justifyContent: "center",

    },
    notificationBadge: {
        position: "absolute",
        // top: 0,
        right: -5,
        backgroundColor: "red",
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: "center",
        alignItems: "center",
    },

    notificationText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
});
