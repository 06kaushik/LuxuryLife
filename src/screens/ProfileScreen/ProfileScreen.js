import React, { useEffect, useContext, useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import images from "../../components/images";
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from "../../components/AuthProvider";
import DeviceInfo from 'react-native-device-info';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-simple-toast';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserAvatar from 'react-native-user-avatar'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Modal from "react-native-modal";



const ProfileScreen = ({ navigation }) => {

    const { logout } = useContext(AuthContext);
    const appVersion = DeviceInfo.getVersion();
    const [selfie, setSelfie] = useState(null);
    const [submitselfie, setSubmitSelfie] = useState(false);
    const [load, setLoad] = useState(false)
    console.log('loaading loader', load);

    const [userdetails, setUserDetails] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModal, setIsModal] = useState(false)
    const [isloading, setIsLoading] = useState(true)


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



    const handleProfilePicture = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchImageLibrary(options, (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                setSelfie(response.assets[0].uri);
                handleSubmitSelfie(response.assets[0].uri);
            }
        });
    };


    const handleSubmitSelfie = async (uri) => {
        setLoad(true);
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        try {
            if (!uri) {
                Alert.alert('Error', 'Please take a selfie before submitting.');
                setLoad(false);
                return;
            }
            const realTimePictureUrl = await uploadPhoto(uri, false);
            console.log('Uploaded selfie URL:', realTimePictureUrl);

            const accountUpdatePayload = {
                step: 20,
                accountUpdatePayload: {
                    profilePicture: realTimePictureUrl,
                },
            };
            console.log('Payload for account update (selfie):', accountUpdatePayload);
            const response = await axios.put(`auth/update-account/${userdetails?._id}`, accountUpdatePayload, { headers });
            console.log('Response from account update:', response.data);
            Toast.show('profile pic updated successfully', Toast.SHORT)
            setLoad(false);
            if (response.status === 200) {
                Toast.show('Selfie uploaded successfully!', Toast.SHORT);
                const updatedUserData = { ...userdetails, profilePicture: realTimePictureUrl };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                setUserDetails(updatedUserData);
                return true;
            } else {
                Toast.show('Failed to upload selfie. Please try again.', Toast.SHORT);
                return false;
            }
        } catch (error) {
            console.error('Error updating account:', error.response?.data || error.message);
            if (error.message === 'Network Error') {
                Alert.alert('Network Error', 'Failed to upload photos due to a network issue. Please try again.');
                throw new Error('Network Error');
            }

            Alert.alert('Error', 'Failed to upload photos. Please try again.');
        } finally {
            setSubmitSelfie(false);
        }
    };

    const uploadPhoto = async (uri, isPrivate = false) => {
        const token = await AsyncStorage.getItem('authToken');
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            // Determine the correct endpoint based on privacy
            const endpoint = isPrivate ? 'file/upload-private' : 'file/upload';
            setSubmitSelfie(true)
            const response = await axios.post(endpoint, formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
            setSubmitSelfie(false)
            console.log(`Response from ${endpoint}:`, response.data);

            // Extract and return the URL of the uploaded photo
            const uploadedUrl = response.data.data.url;
            console.log('Uploaded photo URL:', uploadedUrl);
            return uploadedUrl;
        } catch (error) {
            setSubmitSelfie(false)
            console.error(`Error uploading to ${isPrivate ? 'private' : 'public'} endpoint:`, error.response?.data || error.message);
            throw error;
        }
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModal(true);
    };

    const closeModal = () => {
        setIsModal(false)
    };


    return (

        <View style={styles.main}>
            {load && (
                <View style={styles.demoOverlay}>
                    <ActivityIndicator
                        size="large"
                        color="#916008"
                        style={styles.loader}
                    />
                </View>
            )}

            <TouchableOpacity onPress={() => handleImageClick(userdetails?.profilePicture)}>
                <View style={styles.container}>
                    {!userdetails?.profilePicture && (<UserAvatar size={150} name={`${userdetails?.userName}`} bgColor={'grey'} />)}
                    {userdetails?.profilePicture && (<Image source={{ uri: userdetails?.profilePicture }} style={styles.selectedimg1} />)}
                    <TouchableOpacity onPress={handleProfilePicture} style={styles.cont5}>
                        <Image source={images.camera} style={styles.cam} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            <ScrollView style={{}}>

                <Text style={styles.txt}>{userdetails?.userName}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ViewProfile')}>
                    <Text style={styles.txt1}>View & Edit Profile</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={() => navigation.navigate('ViewProfile')}>
                    <Text style={[styles.txt1, { bottom: 5 }]}>Edit</Text>
                </TouchableOpacity> */}

                <TouchableOpacity style={styles.cont} onPress={() => navigation.navigate('VerifyIdentity')}>
                    <View style={styles.cont1}>
                        <Image source={images.correct} style={styles.correct} />
                        <Text style={styles.txt2}>Get ID Verified</Text>
                    </View>
                </TouchableOpacity>
                <View style={{
                    flexDirection: 'row',
                    marginTop: 30,
                    marginLeft: 16,
                    alignSelf: 'center'
                }}>
                    <View style={{ top: 3 }}>
                        <AnimatedCircularProgress
                            size={20}
                            width={4}
                            fill={userdetails?.profileCompletion}
                            tintColor="#916008"
                            backgroundColor="#ffffff"
                            rotation={0}
                            lineCap="round"
                            strokeCap="round"
                        />
                    </View>
                    <Text style={styles.txt3}>{Math.round(userdetails?.profileCompletion)}% Profile Completion</Text>
                </View>

                <View style={styles.cont2}>
                    <Text style={styles.txt4}>Get 3x more benefits</Text>
                    <LinearGradient colors={['#916008', '#CC9933']} style={styles.cont3}>
                        <TouchableOpacity onPress={() => navigation.navigate('Membership')}>
                            <Text style={styles.txt5}>Upgrade to premium</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* <View style={styles.cont4}>
                    <Image source={images.boost} style={styles.boost} />
                    <Text style={styles.txt6}>Boost your profile</Text>
                </View> */}
                <TouchableOpacity onPress={() => navigation.navigate('AccountSetting')}>
                    <View style={styles.cont4}>
                        <Image source={images.setting} style={styles.boost} />
                        <Text style={[styles.txt6, { color: 'black' }]}>Account Settings</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.cont4}>
                    <Image source={images.help} style={styles.boost} />
                    <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
                        <Text style={[styles.txt6, { color: 'black' }]}>Help Center</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginBottom: 100, marginTop: 20 }}>
                    <Text style={styles.txt7}>App Version {appVersion}</Text>
                    <TouchableOpacity onPress={logout}>
                        <Text style={[styles.txt7, { color: "#916008", fontSize: 16, marginTop: 20, fontFamily: 'Poppins-SemiBold' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {selectedImage && (
                <Modal visible={isModal} transparent={true} onRequestClose={closeModal} onBackdropPress={closeModal} >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                            <Image style={styles.modalCloseText} source={images.cross} />
                        </TouchableOpacity>
                        <Image source={{ uri: selectedImage }} style={styles.modalImage} />
                    </View>
                </Modal>
            )}
        </View>
    )
}


export default ProfileScreen;

const styles = StyleSheet.create({

    main: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },

    container: {
        borderRadius: 100,
        height: 150,
        width: 150,
        alignSelf: 'center',
        marginTop: 50,
        position: 'relative'
    },
    txt: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 24,
        textAlign: 'center',
        marginTop: 10
    },
    txt1: {
        color: '#3C4043',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginTop: 10,
        textDecorationLine: 'underline'
    },
    cont: {
        borderWidth: 1,
        borderRadius: 100,
        height: 40,
        width: '70%',
        alignSelf: 'center',
        marginTop: 20,
        justifyContent: 'center',
        borderColor: "#E1E1E1",
        backgroundColor: 'white'
    },
    cont1: {
        flexDirection: 'row',
        alignSelf: 'center'
    },
    correct: {
        height: 15,
        width: 15,
        top: 2
    },
    txt2: {
        color: '#916008',
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        left: 8
    },
    txt3: {
        color: '#5F6368',
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        textAlign: 'center',
        left: 10
        // marginTop: 20
    },
    cont2: {
        borderWidth: 1,
        borderRadius: 9,
        height: 100,
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
        backgroundColor: '#ebd8ad',
        borderColor: '#ebd8ad'
    },
    txt4: {
        textAlign: 'center',
        color: '#916008',
        fontSize: 16,
        fontFamily: 'Poppins-regular',
        top: 10
    },
    cont3: {
        // borderWidth: 1,
        height: 45,
        width: '90%',
        alignSelf: 'center',
        top: 20,
        borderRadius: 8,
        borderColor: '#CC9933',
        justifyContent: 'center'
    },
    txt5: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        fontFamily: 'Poppins-Medium'
    },
    cont4: {
        flexDirection: 'row',
        marginLeft: 20,
        marginTop: 20

    },
    boost: {
        height: 25,
        width: 25,
    },
    txt6: {
        color: '#4285F4',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        marginLeft: 10,
        top: 3
    },
    txt7: {
        textAlign: 'center',
        color: '#3C4043',
        fontSize: 12,
        fontFamily: 'Poppins-Regular'
    },
    selectedimg1: {
        height: 150,
        width: 150,
        alignSelf: 'center',
        borderRadius: 100,
    },
    cont5: {
        position: 'absolute',
        left: 110,
        top: 115,
        borderWidth: 1,
        height: 30,
        width: 30,
        borderRadius: 100,
        backgroundColor: "#916008",
        borderColor: '#916008',
        justifyContent: 'center'
    },
    cam: {
        height: 20,
        width: 20,
        alignSelf: 'center',
        tintColor: 'white'
    },
    modalOverlay: {
        height: '110%',
        width: '130%',
        alignSelf: 'center',
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        // flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        // backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalCloseButton: {
        position: "absolute",
        top: 40,
        right: 50,
        backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent button
        padding: 10,
        borderRadius: 20,
        zIndex: 1, // Ensure it stays above the image
    },
    modalCloseText: {
        height: 20,
        width: 20
    },
    modalImage: {
        width: "100%", // Make the image take up the full width
        height: "100%", // Make the image take up the full height
        resizeMode: "contain", // Ensure the image maintains its aspect ratio
    },
    loader: {
        position: 'absolute',
        top: '50%', // Vertically center the loader inside the profile picture
        left: '50%', // Horizontally center the loader inside the profile picture
        marginLeft: -20, // Adjust for proper centering (half of loader size)
        marginTop: -20, // Adjust for proper centering (half of loader size)
        zIndex: 10, // Make sure the loader is on top of the profile image
    },
    demoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
})