import React from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import images from "../../../components/images";


const IdentitySuccess = ({ navigation }) => {


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Verification</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.txt1}>Verify Your Identity</Text>
            <Text style={styles.txt2}>We need to confirm it's really you! Follow these quick steps to complete the selfie verification.</Text>
            <View>
                <Image source={images.correct1} style={styles.img} />
                <Text style={styles.txt3}>Your document identity has been submitted</Text>
                <Text style={styles.txt3}>Status</Text>
                <Text style={styles.txt4}>your doucment verification under process</Text>
            </View>
            <TouchableOpacity onPress={() =>
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Verification' }],
                })
            } style={{ borderWidth: 1, height: 50, width: '90%', backgroundColor: '#916008', borderRadius: 100, borderColor: '#916008', justifyContent: 'center', alignSelf: 'center', bottom: 0, position: 'absolute', marginBottom: 20 }}>
                <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Poppins-Medium', fontSize: 16 }}>Finish</Text>
            </TouchableOpacity>
        </View>
    )
}

export default IdentitySuccess;

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
    txt2: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
    },
    img: {
        height: 45,
        width: 45,
        alignSelf: "center",
        marginTop: 40

    },
    txt3: {
        textAlign: 'center',
        fontFamily: 'Poppins-Bold',
        fontSize: 14,
        marginTop: 20,
        color: 'black'
    },
    txt4: {
        color: '#3C4043',
        textAlign: 'center',
        fontFamily: 'Poppins-Italic',
        fontSize: 14

    }

})