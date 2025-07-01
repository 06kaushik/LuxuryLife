import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import images from "../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from "../../components/GlobalStyle";


const AccountSetting = ({ navigation }) => {

    const [userdetails, setUserDetails] = useState(null)
    const [userprofiledata, setUserProfileData] = useState();




    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const data = await AsyncStorage.getItem('UserData');
                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    setUserDetails(parsedData);

                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };
        fetchUserDetails();
    }, []);

    useEffect(() => {
        getUserProfileData()
    }, [userdetails])

    const getUserProfileData = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        try {
            const resp = await axios.get(`auth/user-profile`, { headers })
            // console.log('user profile dataa', resp?.data?.data);
            setUserProfileData(resp?.data?.data)
        } catch (error) {
            console.log('error frm the user profile', error.response.data.message);
        }
    }

    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
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
                <TouchableOpacity onPress={() => navigation.navigate('ManageAccount')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View>

            {userprofiledata?.isSubscribed ? (
                <View style={styles.cont1}>
                    <TouchableOpacity onPress={() => navigation.navigate('MySubscription')}>
                        <View style={{ flexDirection: 'row', }}>
                            <Image source={images.crown1} style={[styles.img]} />
                            <Text style={styles.txt1}>Membership</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('MySubscription')}>
                        <Image source={images.rightarrow} style={styles.arrow} />
                    </TouchableOpacity>
                </View>
            ) : (
                userdetails?.country === 'India' ? (
                    <View style={styles.cont1}>
                        <TouchableOpacity onPress={() => navigation.navigate('RazorPay')}>
                            <View style={{ flexDirection: 'row', }}>
                                <Image source={images.crown1} style={[styles.img]} />
                                <Text style={styles.txt1}>Membership</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('RazorPay')}>
                            <Image source={images.rightarrow} style={styles.arrow} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.cont1}>
                        <TouchableOpacity onPress={() => navigation.navigate('Paypal')}>
                            <View style={{ flexDirection: 'row', }}>
                                <Image source={images.crown1} style={[styles.img]} />
                                <Text style={styles.txt1}>Membership</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Paypal')}>
                            <Image source={images.rightarrow} style={styles.arrow} />
                        </TouchableOpacity>
                    </View>
                )
            )
            }



            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationSetting')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.bell} style={[styles.img, {}]} />
                        <Text style={styles.txt1}>Notifications & Actions</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationSetting')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('HiddenMembers')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.hidden1} style={styles.img} />
                        <Text style={styles.txt1}>Hidden Members</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('HiddenMembers')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('BlockedMembers')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.block} style={styles.img} />
                        <Text style={styles.txt1}>Blocked Members</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('BlockedMembers')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('PhotoVideoPermission')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.gallery} style={styles.img} />
                        <Text style={styles.txt1}>Privacy & Permissions</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('PhotoVideoPermission')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View>

            {/* <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('SecurityInformation')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.security} style={styles.img} />
                        <Text style={styles.txt1}>Privacy & Security Information</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SecurityInformation')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View> */}

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('Verification')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.verification} style={styles.img} />
                        <Text style={styles.txt1}>Verification</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Verification')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.help} style={styles.img} />
                        <Text style={styles.txt1}>Help Center</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
            </View>

            <View style={styles.cont1}>
                <TouchableOpacity onPress={() => navigation.navigate('About')}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.about} style={styles.img} />
                        <Text style={styles.txt1}>About</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('About')}>
                    <Image source={images.rightarrow} style={styles.arrow} />
                </TouchableOpacity>
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
        fontFamily: POPPINSRFONTS.semibold,
        marginLeft: 12,
        top: 2
    },
    cont1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        // top: 30,
        // margin:10
    },
    txt1: {
        color: '#3C4043',
        fontFamily: GARAMOND.semibold,
        fontSize: 20,
        marginLeft: 16,
        marginTop: 2
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