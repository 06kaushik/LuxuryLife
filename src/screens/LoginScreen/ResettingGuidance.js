import React from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import images from "../../components/images";


const PasswordResttingGudance = ({ navigation }) => {


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={images.back} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.txt}>Trouble Resetting {'\n'} Your Password?</Text>
            <Text style={styles.txt1}>If you didn't recieve the password reset {'\n'} link or are having trouble, try one of the {'\n'} following options:</Text>
            <Image source={images.setting1} style={styles.img} />

            <View style={styles.cont2}>
                <View style={styles.cont3}>
                    <Text style={{ textAlign: 'center' }}>1</Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                    <Text style={styles.txt8}>Check Your Spam/Junk Folder</Text>
                    <Text style={styles.txt9}>Sometimes, our emails can end up in your spam folder. Make sure to check there!</Text>
                </View>
            </View>

            <View style={styles.cont2}>
                <View style={styles.cont3}>
                    <Text style={{ textAlign: 'center' }}>2</Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                    <Text style={styles.txt8}>Resend the Reset Link</Text>
                    <Text style={styles.txt9}>If you still haven't recieved the email, click below to resend the password reset link to your inbox. <Text style={{ textDecorationLine: 'underline' }}>Resend Link</Text></Text>
                </View>
            </View>

            <View style={styles.cont2}>
                <View style={styles.cont3}>
                    <Text style={{ textAlign: 'center' }}>3</Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                    <Text style={styles.txt8}>Contact Support</Text>
                    <Text style={styles.txt9}>If you're still experiencing issues, feel free to contact our support team for further assistance.{'\n'}<Text style={{ textDecorationLine: 'underline' }}>support@luxurylife.ai</Text></Text>
                </View>
            </View>



            <View style={styles.cont4}>
                <TouchableOpacity onPress={() => navigation.navigate('PasswordResettingGudance')}>
                    <Text style={styles.txt12}>Continue</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}


export default PasswordResttingGudance;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 20
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 20,
    },
    txt: {
        fontFamily: 'Poppins-Bold',
        fontSize: 32,
        color: 'black',
        textAlign: 'center',
        marginTop: 20

    },
    txt1: {
        color: 'black',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        textAlign: 'center',
    },
    img: {
        alignSelf: 'center',
        marginTop: 50,
        height: 65,
        width: 65
    },
    cont4: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        borderWidth: 1,
        height: 50,
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: "#916008",
        backgroundColor: '#916008',
        justifyContent: 'center',
    },
    txt12: {
        color: 'white',
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
    },
    cont1: {
        flexDirection: 'row',
        padding: 20,
        marginTop: 30,

    },
    cont: {
        backgroundColor: '#f0ebe2',
        borderWidth: 1,
        height: 30,
        width: 30,
        borderRadius: 100,
        borderColor: '#f0ebe2',
        justifyContent: 'center',
        marginTop: 20
    },
    txt2: {
        color: '#916008',
        textAlign: 'center'
    },
    txt3: {
        color: 'black',
        fontFamily: 'Poppins-Bold',
        fontSize: 12,
        marginLeft: 30,
        // marginTop:10
    },
    txt4: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginLeft: 30
    },
    cont2: {
        flexDirection: 'row',
        marginLeft: 16,
        marginTop: 40
    },
    cont3: {
        borderWidth: 1,
        justifyContent: 'center',
        backgroundColor: '#f0ebe2',
        height: 31,
        width: 31,
        borderRadius: 100,
        borderColor: '#f0ebe2'
    },
    txt8: {
        fontFamily: 'Poppins-Bold',
        fontSize: 12,
        color: '#3C4043'
    },
    txt9: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#3C4043'
    },


})