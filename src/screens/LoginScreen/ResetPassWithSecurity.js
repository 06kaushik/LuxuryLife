import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native'
import images from "../../components/images";
import Toast from 'react-native-simple-toast';




const ResetPassWithSecurityQstn = ({ navigation }) => {

    const [email, setEmail] = useState('');

    const handleContinue = async () => {
        if (email.length > 10) {
            navigation.navigate('AnswerSecurityQstn', { email: email })
        } else {
            Toast.show('Please enter your registered email', Toast.SHORT)
        }

    }

    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={images.back} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.txt}>Verify Your Identity with Security Questions</Text>
            <Text style={styles.txt1}>Answer the security questions below as an alternate verification method if you can't access your email.</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

            </View>
            <Text style={styles.txt3}>Need help? Contact our support team for assistance.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.txt4}>Back to login <Text style={styles.underline}>Log in</Text></Text>
            </TouchableOpacity>
            <View style={styles.cont4}>
                <TouchableOpacity onPress={handleContinue}>
                    <Text style={styles.txt12}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}


export default ResetPassWithSecurityQstn;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,

    },
    txt: {
        color: 'black',
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        marginTop: 20

    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 20,
    },
    txt1: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center'
    },
    txt2: {
        color: 'black',
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginTop: 20
    },
    inputContainer: {
        marginTop: 40,
    },
    input: {
        borderWidth: 1,
        height: 44,
        width: '100%',
        color: '#000',
        paddingLeft: 20,
        borderRadius: 100,
        borderColor: '#E8E6EA',
    },
    txt3: {
        color: '#916008',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 100
    },
    txt4: {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 30

    },
    underline: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    cont4: {
        position: 'absolute', // Makes it stick to the bottom
        bottom: 20, // Adjusts the distance from the bottom
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
    txt5: {
        color: 'black',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    },
    txt6: {
        color: 'black',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        textDecorationLine: "underline"
    }
})