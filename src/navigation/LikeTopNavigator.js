import React, { useState, useEffect } from "react";
import { StatusBar, Text, View, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, } from 'react-native'
import images from "../components/images";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ViewedMe from "../screens/LikeScreen/ViewedMeScreen";
import FavouriteScreen from "../screens/LikeScreen/FavouriteScreen";
import FavouriteMeScreen from "../screens/LikeScreen/FavouritedMeScreen";


const Tab = createMaterialTopTabNavigator();

const InterestTopNavigator = ({ navigation }) => {

    return (
        <>
            <View style={styles.main}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <View style={styles.header}>
                        <Image source={images.back} style={styles.backIcon} />
                        <Text style={styles.headerText}>Interested</Text>
                    </View>
                </TouchableOpacity>

            </View>
            <Tab.Navigator screenOptions={{
                tabBarLabelStyle: { fontFamily: 'Poppins-Medium' },
                tabBarActiveTintColor: '#916008',
                tabBarInactiveTintColor: 'black',
                tabBarStyle: { elevation: 4, },
                tabBarIndicatorStyle: {
                    backgroundColor: '#916008', // Color of the line indicator
                    height: 3, // Optional: Adjust thickness of the line
                },
            }}>
                <Tab.Screen name="VIEWED ME" component={ViewedMe} />
                <Tab.Screen name="FAVORITES" component={FavouriteScreen} />
                <Tab.Screen name="FAVORITED ME" component={FavouriteMeScreen} />
            </Tab.Navigator>
        </>
    )
}

export default InterestTopNavigator;

const styles = StyleSheet.create({

    main: {
        // flex:1,
        backgroundColor: 'white',
        paddingHorizontal: 20
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 60,


    },
    backIcon: {
        height: 20,
        width: 20,
        bottom: 30
    },
    headerText: {
        fontSize: 20,
        fontFamily: "Poppins-Medium",
        marginLeft: 10,
        bottom: 27
    },
})