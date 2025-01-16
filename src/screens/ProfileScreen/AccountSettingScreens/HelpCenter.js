import React from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import images from "../../../components/images";



const HelpCenter = ({ navigation }) => {


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Help Center</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.txt1}>Help</Text>

            <View style={styles.cont1}>
                <View style={styles.cont2}>
                    <Text style={styles.txt2}>Frequently Asked Questions</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </View>

                <View style={styles.cont2}>
                    <Text style={styles.txt2}>Tips for Dating Safely</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </View>

                <View style={styles.cont2}>
                    <Text style={styles.txt2}>Anti-Sex Trafficing</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </View>

                <View style={styles.cont2}>
                    <Text style={styles.txt2}>Submit a Customer Support Ticket</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </View>

                <View style={styles.cont2}>
                    <Text style={styles.txt2}>Call Customer Support</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </View>
                <Text style={styles.txt3}>Upgrade to Unlock</Text>

            </View>
            <View style={styles.line} />
            <Text style={styles.txt1}>Site Information</Text>
            <View style={styles.cont2}>
                <Text style={styles.txt2}>Privacy Policy generator</Text>
                <Image source={images.rightarrow} style={styles.img} />
            </View>
            <View style={styles.cont2}>
                <Text style={styles.txt2}>Terms of Use</Text>
                <Image source={images.rightarrow} style={styles.img} />
            </View>

            <Text style={styles.txt4}>Copyright: © 2024 Luxurylife. All rights reserved.</Text>


        </View>
    )
}

export default HelpCenter;

const styles = StyleSheet.create({

    main: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20
    },
    container: {
        flexDirection: 'row',
        marginTop: 40
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 10

    },
    cont: {
        flexDirection: 'row',
        marginTop: 40
    },
    txt: {
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        marginLeft: 12,
        top: 5
    },
    txt1: {
        color: '#3C4043',
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        marginTop: 40
    },
    cont1: {
        marginTop: 20
    },
    cont2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 10
    },
    img: {
        height: 20,
        width: 20,
        tintColor: '#C4C4C4'

    },
    txt2: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#3C4043',
        textDecorationLine: 'underline'
    },
    txt3: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#916008',
        marginLeft: 12,
        bottom: 10
    },
    line: {
        borderWidth: 0.5,
        borderColor: '#E0E2E9',
        width: '100%',
        marginTop: 30
    },
    txt4: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginLeft: 12,
        marginTop: 10
    }
})