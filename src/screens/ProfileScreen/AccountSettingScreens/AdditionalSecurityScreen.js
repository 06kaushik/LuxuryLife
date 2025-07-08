import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import images from "../../../components/images";
import { TextInput } from "react-native-gesture-handler";


const AdditionalSecurity = ({ navigation }) => {
    const [request, setRequest] = useState('')
    const [deletion, setDeletion] = useState('')


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Security Information</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.txt1}>Additional data {'\n'}privacy options</Text>
            <Text style={styles.txt2}>Request an export or the deletion of your personal data</Text>
            <View style={styles.line} />
            <ScrollView>
                <View style={styles.cont1}>
                    <Text style={styles.txt3}>Request for information</Text>
                    <Text style={styles.txt4}>If you would like to request an export of your data from {'\n'}Seeking, you may do so below. This is not instantaneous {'\n'}and you will recieve an email when the export is ready.</Text>
                    <Text style={styles.txt5}>To Confirm request, type "ConfirmRequest" {'\n'}without quotes in the field below.</Text>

                    <TextInput
                        placeholder="Type here"
                        placeholderTextColor={'#ABABAB'}
                        style={styles.input}
                        value={request}
                        onChangeText={setRequest}
                    />
                    <View style={styles.cont2}>
                        <Text style={styles.txt6}>Request Information</Text>
                    </View>
                </View>
                <View style={styles.line} />


                <View style={styles.cont3}>
                    <Text style={styles.txt3}>Request deletion of information</Text>
                    <Text style={styles.txt4}>If you would like to request your Seeking account and{'\n'}associated personal data to be deleted, you may do so {'\n'}below. While this is not instantaneous, it is irreversible.</Text>
                    <Text style={styles.txt7}>Note: If you have submitted an information request above, {'\n'}you should wait to delete your account until that process is {'\n'}completed otherwise your information request may not successfully process.</Text>
                    <Text style={styles.txt5}>To Confirm deletion, type "ConfirmRequest" {'\n'}without qoutes in the field below.</Text>
                    <TextInput
                        placeholder="Type here"
                        placeholderTextColor={'#ABABAB'}
                        style={styles.input}
                        value={deletion}
                        onChangeText={setDeletion}
                    />
                    <View style={[styles.cont2, { marginBottom: 100 }]}>
                        <Text style={styles.txt6}>Delete account and information</Text>
                    </View>
                </View>
            </ScrollView>

        </View>
    )
}

export default AdditionalSecurity;

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
        fontSize: 24,
        color: '#3C4043',
        fontFamily: 'Poppins-Bold',
        //: 16,
        marginTop: 20
    },
    txt2: {
        color: '#3C4043',
        //: 16,
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
    line: {
        borderWidth: 0.5,
        width: '100%',
        borderColor: "#E0E2E9",
        marginTop: 30
    },
    cont1: {
        marginTop: 20
    },
    txt3: {
        //: 16,
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        color: '#3C4043'
    },
    txt4: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#3C4043',
        //: 16,
        marginTop: 5
    },
    txt5: {
        color: '#3C4043',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        //: 16,
        marginTop: 10
    },
    input: {
        borderWidth: 1,
        height: 44,
        borderRadius: 12,
        width: '100%',
        paddingLeft: 20,
        color: 'black',
        borderColor: '#E8E6EA',
        marginTop: 20,
        alignSelf: 'center'
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
    cont3: {
        marginTop: 20

    },
    txt7: {
        fontFamily: 'Poppins-Italic',
        color: "#7A7A7A",
        fontSize: 10,
        marginTop: 10
    }
})