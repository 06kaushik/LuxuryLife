import React from "react";
import { Text, View, StyleSheet } from 'react-native'
import LottieView from "lottie-react-native";

const LaodingScreen = ({ navigation }) => {

    return (

        <View style={styles.main}>
            <View style={styles.cont}>
                <LottieView
                    source={require('../assets/reloading.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
                <Text style={styles.txt}>Finding Your Interest ..</Text>
            </View>
        </View>
    )
}


export default LaodingScreen;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white"
    },
    lottie: {
        width: 400,
        height: 400,
        alignSelf: 'center'
    },
    cont: {
        flex: 1,
        justifyContent: 'center'
    },
    txt: {
        fontFamily: 'Playfair_9pt-BlackItalic',
        fontSize: 20,
        textAlign: 'center',
        bottom: 100
    }
})