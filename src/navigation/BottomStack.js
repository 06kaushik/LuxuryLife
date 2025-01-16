import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, View, StyleSheet, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import images from "../components/images";
import DashBoardScreen from "../screens/DashBoard/DashBoardScreen";
import InterestTopNavigator from "./LikeTopNavigator";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen/ProfileScreen";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
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
                            iconSource = images.chat;
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
                            </View>
                        );
                    },
                    tabBarActiveTintColor: "white",
                    tabBarInactiveTintColor: "#6A513E",
                    tabBarStyle: styles.tabBarStyle,

                })}
            >
                <Tab.Screen name="Dash" component={DashBoardScreen} />
                <Tab.Screen name="Likes" component={InterestTopNavigator} />
                <Tab.Screen name="Chat" component={ChatScreen} />
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
        height: 80, // Adjust height to fill only the bottom white portion
        width: width,
        zIndex: -1, // Push gradient behind other components

    },
    tabBarStyle: {
        backgroundColor: "#301F12",
        height: 60,
        borderRadius: 100,
        marginHorizontal: 16,
        // marginBottom: 20,
        justifyContent: "center",
        elevation: 0, // Removes shadow on Android
        shadowOpacity: 0, // Removes shadow on iOS
        borderTopWidth: 0, // Removes the white border line
        marginTop: 8
    },

    iconContainer: {
        alignItems: "center",
        justifyContent: "center",

    },
});
