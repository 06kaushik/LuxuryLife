import React from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native'
import images from "../../../components/images";



const Verification = ({ navigation }) => {


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Verification</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.txt1}>Your Verifications</Text>
            <Text style={styles.txt2}>Verification help keep our members safe and trustworthy.Plus, members who have verifications are proven to get more favorites, and messages! In general, the more verification you have the more popular you'll be with our members!</Text>
            <View style={styles.line} />
            <ScrollView>
                <View style={styles.cont1}>
                    <Text style={styles.txt3}>ID Verification</Text>
                    <Image source={images.id} style={styles.img} />
                    <Text style={styles.txt4}>Having an ID verification badge proves that you are, in fact, who you say you are. It's as simple as taking a quick photo of your government issued ID (front and back) and a selfie, which will be compared to your profile. </Text>
                    <Text style={styles.txt5}>(Note: If you fail the background check, you will not recieve the verification badge. We do not provide refunds for those who fail the background check, as the background check was performed.)</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('VerifyIdentity')}>
                        <View style={styles.cont2}>
                            <Text style={styles.txt6}>Buy ID Verification Badge</Text>
                        </View>
                    </TouchableOpacity>

                </View>
                <View style={styles.line} />

                <View style={styles.cont1}>
                    <Text style={styles.txt3}>Photo Verification</Text>
                    <Image source={images.id1} style={[styles.img, { width: 109 }]} />
                    <Text style={styles.txt4}>You can use this verification to prove that your profile photos are truly photos of you. It's as simple as taking a quick photo mimicking an example photo we'll show you and submitting it to us to compare to your profile.</Text>
                    <Text style={styles.txt5}>(Note: You must have at least one approved photo before verifying photos.)</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('VerifySelfie')}>
                        <View style={[styles.cont2, { marginBottom: 100 }]}>
                            <Text style={styles.txt6}>Verify my photos</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default Verification;

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
    line: {
        borderWidth: 0.5,
        width: '100%',
        borderColor: "#E0E2E9",
        marginTop: 30

    },
    cont1: {
        marginTop: 30
    },
    txt3: {
        textAlign: 'center',
        fontSize: 16,
        color: '#3C4043',
        fontFamily: 'Poppins-Bold'

    },
    img: {
        height: 136,
        width: 207,
        alignSelf: 'center',
        marginTop: 20
    },
    txt4: {
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#3C4043',
        marginTop: 10
    },
    txt5: {
        color: '#7B7B7B',
        fontFamily: 'Poppins-Italic',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 10
    },
    cont2: {
        borderWidth: 1,
        height: 50,
        width: '100%',
        borderRadius: 100,
        alignSelf: 'center',
        marginTop: 20,
        backgroundColor: "#916008",
        borderColor: '#916008',
        justifyContent: 'center'
    },
    txt6: {
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        color: 'white'
    },

})