import React from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import images from "../../components/images";



const AccountSetting = ({ navigation }) => {


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack('Home')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Account Settings</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('ManageAccount')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.useredit} style={styles.img} />
                        <Text style={styles.txt1}>Manage your Account</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('Membership')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.membership} style={styles.img} />
                        <Text style={styles.txt1}>Membership and Billing</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationSetting')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.notification} style={styles.img} />
                        <Text style={styles.txt1}>Notifications & Actions</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('HiddenMembers')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.closeeye} style={styles.img} />
                        <Text style={styles.txt1}>Hidden Members</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('BlockedMembers')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.block} style={styles.img} />
                        <Text style={styles.txt1}>Blocked Members</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('PhotoVideoPermission')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.gallery} style={styles.img} />
                        <Text style={styles.txt1}>Photo & Video Permissions</Text>
                    </View>
                </TouchableOpacity>

                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('SecurityInformation')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.security} style={styles.img} />
                        <Text style={styles.txt1}>Security Information</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('Verification')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.verification} style={styles.img} />
                        <Text style={styles.txt1}>Verification</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.help} style={styles.img} />
                        <Text style={styles.txt1}>Help Center</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('About')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.about} style={styles.img} />
                        <Text style={styles.txt1}>About</Text>
                    </View>
                </TouchableOpacity>
                <Image source={images.rightarrow} style={styles.arrow} />
            </View>




        </View>
    )
}


export default AccountSetting;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: 'white'
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
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        marginLeft: 12,
        top: 2
    },
    cont1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        top: 20
    },
    txt1: {
        color: '#3C4043',
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        marginLeft: 16,
        marginTop: 5
    },
    arrow: {
        height: 20,
        width: 20,
        tintColor: '#C4C4C4',
        marginTop: 8
    },
    img: {
        height: 30,
        width: 30
    }
})