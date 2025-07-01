import React from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import images from "../../../components/images";
import { POPPINSRFONTS } from "../../../components/GlobalStyle";



const HelpCenter = ({ navigation }) => {


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Help Center</Text>
                </View>
            </TouchableOpacity>

            <Text style={{ marginTop: 20, fontSize: 16, fontFamily: POPPINSRFONTS.regular, color: '#7B7B7B' }}>Find quick answers to your queries or get personalized assistance through our comprehensive Help Center.</Text>

            <Text style={styles.txt1}>Help</Text>

            <View style={styles.cont1}>
                <TouchableOpacity style={styles.cont2} onPress={() => Linking.openURL('https://www.luxurylife.ai/faqs')}>
                    <Text style={styles.txt2}>FAQs</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.cont2} onPress={() => Linking.openURL('https://www.luxurylife.ai/safety-and-security')}>
                    <Text style={styles.txt2}>Safety Tips for Dating</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.cont2} onPress={() => Linking.openURL('https://www.luxurylife.ai/anti-sex-trafficking')}>
                    <Text style={styles.txt2}>Anti-Sex Trafficking</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </TouchableOpacity>


                <TouchableOpacity style={styles.cont2} onPress={() => Linking.openURL('https://www.luxurylife.ai/support')}>
                    <Text style={styles.txt2}>Customer Support</Text>
                    <Image source={images.rightarrow} style={styles.img} />
                </TouchableOpacity>
                {/* <Text style={styles.txt3}>Upgrade to Unlock</Text> */}

            </View>
            <View style={styles.line} />
            <Text style={styles.txt1}>Site Information</Text>
            <TouchableOpacity style={styles.cont2} onPress={() => Linking.openURL('https://www.luxurylife.ai/privacy-policy')}>
                <Text style={styles.txt2}>Privacy Policy</Text>
                <Image source={images.rightarrow} style={styles.img} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cont2} onPress={() => Linking.openURL('https://www.luxurylife.ai/terms-and-conditions')}>
                <Text style={styles.txt2}>Terms and Conditions</Text>
                <Image source={images.rightarrow} style={styles.img} />
            </TouchableOpacity>
            <Text style={styles.txt4}>Copyright: © 2025 Luxury Life. All rights reserved.</Text>
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
        fontSize: 23,
        fontFamily: POPPINSRFONTS.medium,
        marginLeft: 12,
        top: 3
    },
    txt1: {
        color: '#3C4043',
        fontFamily: POPPINSRFONTS.semibold,
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
        fontSize: 18,
        color: '#916008',
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