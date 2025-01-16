import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import images from "../../../components/images";
import DeviceInfo from 'react-native-device-info';


const AboutScreen = ({ navigation }) => {

    const appVersion = DeviceInfo.getVersion();


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.img} />
                    <Text style={styles.txt}>About</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.cont1}>
                <Text style={styles.txt1}>Luxury Life has faciliated thousands of meaningful Connections across 20 countries.</Text>
                <Text style={styles.txt1}>Inspired by the increasing demand for high-quality, streamlined online dating experiences, we created our platform to help successful individuals find exceptional partners free from the common pitfalls of scams or deceptive practices. Our mission is clear to offer a safe, exclusive space for those seeking genuine connections with like-minded individuals.</Text>
            </View>

            <View style={styles.cont2}>
                <Text style={styles.txt2}>Version</Text>
                <Text style={styles.txt2}>{appVersion}</Text>
            </View>
            <View style={[styles.cont2, { marginTop: 20 }]}>
                <Text style={styles.txt2}>Updated on</Text>
                <Text style={styles.txt2}>15 Dec 2024</Text>

            </View>

        </View>
    )
}


export default AboutScreen;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white'
    },
    cont: {
        flexDirection: 'row',
        marginTop: 30,
        marginLeft: 20
    },
    img: {
        height: 20,
        width: 20,
        marginTop: 8
    },
    txt: {
        color: 'black',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 16,
        fontSize: 24
    },
    txt1: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40
    },
    cont1: {
        marginLeft: 16,
        marginRight: 16,
    },
    cont2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 16,
        marginRight: 16,
        marginTop: 40

    },
    txt2: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    }

})