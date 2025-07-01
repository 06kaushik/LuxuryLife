import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import LottieView from 'lottie-react-native';
import images from "./images";

const { width } = Dimensions.get("window");

const SearchingScreen = ({ navigation }) => {



    return (
        <View style={styles.main}>
            <View style={styles.cont}>
                <Image source={images.dashlogo} style={styles.logo} />
            </View>
            <View style={{ alignSelf: 'center', marginTop: 40 }}>
                <LottieView
                    source={require('../assets/searching.json')}
                    autoPlay
                    loop
                    style={{ width: 260, height: 260, }}
                />
            </View>

            <View>
                <Text style={styles.txt}>We're Out of Matches</Text>
                <Text style={[styles.txt, { fontFamily: 'Poppins-Regular', fontSize: 16 }]}>Try expanding your preferences to discover more extraordinary connections nearby.</Text>
            </View>
            <View>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Preference')} style={[styles.cont1, {}]}>
                <Text style={styles.txt1}>Go to Preferences</Text>
            </TouchableOpacity>

        </View>
    )
}


export default SearchingScreen

const styles = StyleSheet.create({

    main: {
        flex: 1,
        backgroundColor: 'white',

    },
    cont: {
        alignSelf: 'center'
    },
    logo: {
        height: 60,
        width: 128,
        marginTop: 20
    },
    txt: {
        color: 'black',
        fontSize: 24,
        fontFamily: 'Playfair_9pt-Bold',
        textAlign: 'center',
        marginTop: 20,
        marginLeft: 16,
        marginRight: 16

    },
    cont1: {
        // flex:1,
        borderWidth: 1,
        height: 50,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 100,
        justifyContent: 'center',
        bottom: 20,
        position: 'absolute',
        borderColor: '#916008',
        backgroundColor: '#916008'

    },
    txt1: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold'
    },
    sliderLabel: { fontSize: 14, color: "gray", marginVertical: 5, marginLeft: 20 },
    markerStyle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        backgroundColor: '#5F3D23',
        borderWidth: 2,
        borderColor: '#FFF',
    },

})