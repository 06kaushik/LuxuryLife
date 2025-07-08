import React, { useState, useEffect, useRef } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, RefreshControl, TextInput, ActivityIndicator } from 'react-native'
import images from "../../../components/images";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { POPPINSRFONTS } from "../../../components/GlobalStyle";
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { Modal } from "react-native";
import Toast from 'react-native-simple-toast'
import InstagramBioVerify from "../../../components/instaLoginConfig";
import TwitterVerifier from "../../../components/Twitter";
import LinkedInVerifier from "../../../components/LinkdinLogin";



const Verification = ({ navigation }) => {


    const [userdetails, setUserDetails] = useState(null);
    const [userprofiledata, setUserProfileData] = useState();
    const [refreshing, setRefreshing] = useState(false);
    const [facebooktoken, setFacebookToken] = useState(null)
    const [showInstaModal, setShowInstaModal] = useState(false);
    const [counterattempt, setCounterAttempt] = useState()
    const [photocounter, setPhotoCounter] = useState()


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
        getCounter()
    }, [userdetails])

    const getUserProfileData = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        try {
            const resp = await axios.get(`auth/user-profile`, { headers })
            setUserProfileData(resp?.data?.data)
        } catch (error) {
            console.log('error frm the user profile', error.response.data.message);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await getUserProfileData();
        setRefreshing(false);
    };

    const loginWithFacebook = async () => {
        try {
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
            if (result.isCancelled) {
                console.log('Login cancelled');
                return;
            }

            const data = await AccessToken.getCurrentAccessToken();
            if (!data) {
                console.log('Failed to get access token');
                return;
            }

            const accessToken = data.accessToken.toString();
            setFacebookToken(accessToken);
            sendFaceBookToken(accessToken)

        } catch (error) {
            console.error('Facebook Login Error:', error);
        }
    };

    const sendFaceBookToken = async (ftoken) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        const body = {
            access_token: ftoken,
            userId: userdetails?._id
        }
        console.log('reaponse og body ', body);

        try {
            const resp = await axios.post('auth/facebook-token-verify', body, { headers });
            // console.log('response from facebook token', resp?.data)
        } catch (error) {
            console.log('error from facebook token', error);
        }
    }

    const getCounter = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        try {
            const resp = await axios.post('account/get-verification-attempt', {}, { headers })
            // Assuming you want to show idVerification attempts
            setCounterAttempt(resp?.data?.data?.idVerification || 0)
            setPhotoCounter(resp?.data?.data?.selfieVerification || 0)
            console.log('response from the remaining counter', resp?.data?.data);
        } catch (error) {
            console.log('error from the counter api', error);
        }
    }


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.navigate('AccountSetting')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Verification</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.txt1}>Your Verifications</Text>
            <Text style={styles.txt2}>Verification helps keep our community safe and trustworthy. Plus, members who have verifications are proven to get more favorites, and messages! In general, the more verifications you have the more popular you'll be with our members!</Text>
            <View style={styles.line} />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh} // Trigger the refresh logic
                    />
                }>

                <View style={styles.cont1}>
                    <Text style={styles.txt3}>ID Verification</Text>
                    <Image source={images.id} style={styles.img} />
                    <Text style={styles.txt4}>Having an ID verification badge proves that you are, in fact, who you say you are. It's as simple as taking a quick photo of your government-issued ID (front and back) and a selfie, which will be compared to your profile. </Text>
                    <Text style={styles.txt5}>(Note: If you fail the background check, you will not recieve the verification badge. We do not provide refunds for those who fail the background check, as the background check was performed.)</Text>
                    <Text style={{ textAlign: 'center', fontFamily: 'Poppins-Bold', top: 8 }}>Status: <Text style={{ fontFamily: 'Poppins-Bold', top: 8, color: userprofiledata?.documents?.status === 'Pending' ? '#916008' : userprofiledata?.documents?.status === 'Rejected' ? 'red' : userprofiledata?.documents?.status === 'Approved' ? 'green' : 'black' }}>{userprofiledata?.documents?.status}</Text></Text>
                    {(userprofiledata?.selfieVerificationStatus === 'Rejected' && counterattempt) > 0 ?
                        <Text style={{ textAlign: 'center', color: 'black', fontFamily: 'Poppins-Bold', top: 8 }}>
                            Remaining Attempts: {counterattempt !== undefined ? counterattempt : 0} of 3
                        </Text> : null}

                    {userprofiledata?.documents?.status === 'Unverified' || userprofiledata?.documents?.status === 'Rejected' ? (
                        counterattempt < 3 ? ( // Only show the button if attempts are remaining
                            <TouchableOpacity onPress={() => navigation.navigate('VerifyIdentity')}>
                                <View style={styles.cont2}>
                                    <Text style={styles.txt6}>Initiate Verification</Text>
                                </View>
                            </TouchableOpacity>
                        ) : ( // After 3 attempts, show the status
                            <View style={[styles.cont2, { backgroundColor: '#DDDDDD', borderColor: '#DDDDDD' }]}>
                                <Text style={[styles.txt6, { color: 'red' }]}>Rejected</Text> {/* Show "Rejected" after 3 attempts */}
                            </View>
                        )
                    ) : (
                        <View style={[styles.cont2, { backgroundColor: '#DDDDDD', borderColor: '#DDDDDD' }]}>
                            <Text style={[styles.txt6, {
                                color: userprofiledata?.documents?.status === 'Pending' ? '#916008' :
                                    userprofiledata?.documents?.status === 'Rejected' ? 'red' :
                                        userprofiledata?.documents?.status === 'Approved' ? 'green' :
                                            'black'
                            }]}>
                                {userprofiledata?.documents?.status}
                            </Text>
                        </View>
                    )}

                </View>
                <View style={styles.line} />

                <View style={styles.cont1}>
                    <Text style={styles.txt3}>Photo Verification</Text>
                    <Image source={images.id1} style={[styles.img, { width: 109 }]} />
                    <Text style={styles.txt4}>You can use this verification to prove that your profile photos are truly photos of you. It's as simple as taking a quick photo mimicking an example photo we'll show you and submitting it to us to compare to your profile.</Text>
                    <Text style={styles.txt5}>(Note: You must have at least one approved photo before verifying photos.)</Text>
                    <Text style={{ textAlign: 'center', fontFamily: 'Poppins-Bold', top: 8 }}>Status: <Text style={{ fontFamily: 'Poppins-Bold', top: 8, color: userprofiledata?.selfieVerificationStatus === 'Pending' ? '#916008' : userprofiledata?.selfieVerificationStatus === 'Rejected' ? 'red' : userprofiledata?.selfieVerificationStatus === 'Approved' ? 'green' : 'black' }}>{userprofiledata?.selfieVerificationStatus}</Text></Text>
                    {(userprofiledata?.selfieVerificationStatus === 'Rejected' && photocounter > 0) && (
                        <Text style={{ textAlign: 'center', color: 'black', fontFamily: 'Poppins-Bold', top: 8 }}>
                            Remaining Attempts: {photocounter} of 3
                        </Text>
                    )}
                    {(userprofiledata?.selfieVerificationStatus === 'Unverified' || userprofiledata?.selfieVerificationStatus === 'Rejected') ? (
                        photocounter < 3 ? ( // Only show the button if attempts are remaining
                            <TouchableOpacity onPress={() => navigation.navigate('VerifySelfie')}>
                                <View style={[styles.cont2, { marginBottom: 100 }]}>
                                    <Text style={styles.txt6}>Start Verification</Text>
                                </View>
                            </TouchableOpacity>
                        ) : ( // After 3 attempts, show the status
                            <View style={[styles.cont2, { marginBottom: 100, backgroundColor: '#DDDDDD', borderColor: '#DDDDDD' }]}>
                                <Text style={[styles.txt6, { color: 'red' }]}>Rejected</Text> {/* Show "Rejected" after 3 attempts */}
                            </View>
                        )
                    ) : (
                        <View style={[styles.cont2, { marginBottom: 100, backgroundColor: '#DDDDDD', borderColor: '#DDDDDD' }]}>
                            <Text style={[styles.txt6, {
                                color: userprofiledata?.selfieVerificationStatus === 'Pending' ? '#916008' :
                                    userprofiledata?.selfieVerificationStatus === 'Rejected' ? 'red' :
                                        userprofiledata?.selfieVerificationStatus === 'Approved' ? 'green' :
                                            'black'
                            }]}>
                                {userprofiledata?.selfieVerificationStatus}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={[styles.line, { bottom: 100 }]} />
                <View style={[styles.cont1, { bottom: 100 }]}>
                    <Text style={styles.txt3}>Social Media Verification</Text>
                    <Text style={styles.txt4}>To enhance trust and authenticity, we offer social media verification, Connect your Instagram, LinkedIn, or Facebook account to confirm your identity and establish credibility. This process ensures you're engaging with real, high-value individuals and unlocks exclusive platform features.</Text>
                    {userprofiledata?.isFacebookVerified === false ?
                        <TouchableOpacity onPress={() => loginWithFacebook()} style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 8, justifyContent: 'center', marginTop: 20, backgroundColor: '#1877F2', borderColor: '#1877F2', elevation: 2 }}>
                            <View style={{ flexDirection: 'row', }}>
                                <Image source={images.fb} style={{ height: 30, width: 30, left: 10, }} />
                                <Text style={{ textAlign: 'center', left: 20, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'white', top: 5 }}>Connect your Facebook</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 8, justifyContent: 'center', marginTop: 20, backgroundColor: '#DDDDDD', borderColor: '#DDDDDD', elevation: 2 }}>
                            <View style={{ flexDirection: 'row', }}>
                                <Image source={images.fb} style={{ height: 30, width: 30, left: 10, }} />
                                <Text style={{ textAlign: 'center', left: 20, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'white', top: 5 }}>You are verified</Text>
                            </View>
                        </View>}

                    <TouchableOpacity
                        onPress={() => setShowInstaModal(true)}
                        style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 8, justifyContent: 'center', marginTop: 20, backgroundColor: 'white', borderColor: 'white', elevation: 2 }}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={images.insta} style={{ height: 30, width: 30, left: 10 }} />
                            <Text style={{ textAlign: 'center', left: 20, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'grey', top: 5 }}>
                                Connect your Instagram
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TwitterVerifier userId={userdetails?._id} />
                    {/* <LinkedInVerifier userId={userdetails?._id} /> */}

                </View>
                <Modal
                    visible={showInstaModal}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowInstaModal(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View
                            style={{
                                height: '100%',
                                backgroundColor: 'white',
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                paddingTop: 10,
                            }}
                        >
                            <InstagramBioVerify onClose={() => setShowInstaModal(false)} />
                        </View>
                    </View>
                </Modal>

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
    txt2: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        // textAlign:'center'

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
        fontSize: 14,
        color: '#3C4043',
        marginTop: 10
    },
    txt5: {
        color: '#7B7B7B',
        fontFamily: 'Poppins-Italic',
        fontSize: 12,
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