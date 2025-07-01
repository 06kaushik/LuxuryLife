import React, { useEffect, useContext, useState, useRef } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
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
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { PLAYFAIRFONTS, POPPINSRFONTS, GARAMOND } from "../../components/GlobalStyle";
import ImageCropPicker from 'react-native-image-crop-picker';
import RBSheet from 'react-native-raw-bottom-sheet';



const ProfileScreen = ({ navigation }) => {

    const { logout } = useContext(AuthContext);
    const appVersion = DeviceInfo.getVersion();
    const [selfie, setSelfie] = useState(null);
    const [submitselfie, setSubmitSelfie] = useState(false);
    const [load, setLoad] = useState(false)
    const [userdetails, setUserDetails] = useState(null)
    // console.log('userdetails in profile', userdetails);

    const [selectedImage, setSelectedImage] = useState(null);
    const [isModal, setIsModal] = useState(false)
    const [userprofiledata, setUserProfileData] = useState();

    const [tempSelectedImage, setTempSelectedImage] = useState(null);
    const isFocused = useIsFocused()
    const rbSheetRef = useRef();
    const [isModalVisible, setIsModalVisible] = useState(false);




    useEffect(() => {
        getUserProfileData()
    }, [isFocused])


    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const data = await AsyncStorage.getItem('UserData');
                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    setUserDetails(parsedData);

                }
            } catch (error) {
                //('Error fetching user data:', error);
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
            // //('user profile dataa', resp?.data?.data);
            setUserProfileData(resp?.data?.data)
        } catch (error) {
            //('error frm the user profile', error.response.data.message);
        }
    }

    const handleLogout = () => {
        return Alert.alert(
            "Logout?",
            `Are you sure you want to Logout?`,
            [
                {
                    text: "Yes",
                    onPress: () => {
                        logout()
                    },
                },
                {
                    text: "No",
                },
            ]
        );
    };


    // Updated camera press to open picker first
    const onCameraPress = () => {
        ImageCropPicker.openPicker({
            mediaType: 'photo',
            compressImageQuality: 1,
            cropping: false, // no cropping initially
        })
            .then(image => {
                //('Image selected:', image.path);
                setTempSelectedImage(image.path); // Save temporarily
                rbSheetRef?.current?.open(); // Now open bottom sheet
            })
            .catch(error => {
                //('Image picker error:', error);
            });
    };

    // Option 1: Crop selected image
    const handleCrop = () => {
        if (tempSelectedImage) {
            ImageCropPicker.openCropper({
                path: tempSelectedImage,
                width: 300,
                height: 300,
                cropperCircleOverlay: true,
                compressImageQuality: 1,
            })
                .then(cropped => {
                    rbSheetRef?.current?.close();
                    setSelfie(cropped.path);
                    handleSubmitSelfie(cropped.path);
                })
                .catch(err => {
                    //('Crop error:', err);
                    rbSheetRef?.current?.close();
                });
        }
    };

    // Option 2: Use full-size image

    const handleFullSize = () => {
        if (tempSelectedImage) {
            rbSheetRef?.current?.close();
            setSelfie(tempSelectedImage);
            handleSubmitSelfie(tempSelectedImage);
        }
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
            //('Uploaded selfie URL:', realTimePictureUrl);

            const accountUpdatePayload = {
                step: 20,
                accountUpdatePayload: {
                    profilePicture: realTimePictureUrl,
                },
            };
            //('Payload for account update (selfie):', accountUpdatePayload);
            const response = await axios.put(`auth/update-account/${userdetails?._id}`, accountUpdatePayload, { headers });
            // //('Response from account update:', response.data);
            rbSheetRef?.current?.close()


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
            setLoad(false);
            rbSheetRef?.current?.close()

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
            //(`Response from ${endpoint}:`, response.data);

            // Extract and return the URL of the uploaded photo
            const uploadedUrl = response.data.data.url;
            //('Uploaded photo URL:', uploadedUrl);
            rbSheetRef?.current?.close()

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
            <View>
                <TouchableOpacity style={styles.container} onPress={() => handleImageClick(userdetails?.profilePicture)}>
                    {!userdetails?.profilePicture && (
                        <UserAvatar size={150} name={`${userdetails?.userName}`} bgColor={'grey'} />
                    )}
                    {userdetails?.profilePicture && (
                        <Image source={{ uri: userdetails?.profilePicture }} style={styles.selectedimg1} />
                    )}

                    <TouchableOpacity onPress={onCameraPress} style={styles.cont5}>

                        {load ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Image source={images.camera} style={styles.cam} />
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>


            <ScrollView style={{}}>
                <Text style={styles.txt}>{userdetails?.userName.charAt(0).toUpperCase() + userdetails?.userName.slice(1)}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ViewProfile')}>
                    <Text style={styles.txt1}>Edit Profile</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 30 }}>
                    <Text style={styles.txt3}>{Math.round(userdetails?.profileCompletion)}% Profile Completion</Text>
                </View>
                {userprofiledata?.isProfileVerified === true ?
                    <TouchableOpacity style={styles.cont} onPress={() => navigation.navigate('Verification')}>
                        <View style={styles.cont1}>
                            <Image source={images.bluetick1} style={styles.correct} />
                            <Text style={styles.txt2}>Verified</Text>
                        </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.cont} onPress={() => navigation.navigate('Verification')}>
                        <View style={styles.cont1}>
                            <Image source={images.verify} style={styles.correct} />
                            <Text style={styles.txt2}>Get Your Profile Verified</Text>
                        </View>
                    </TouchableOpacity>
                }

                {
                    userprofiledata?.isSubscribed === undefined ? (
                        // Show loader inside the LinearGradient for the "Upgrade to Luxury" card while data is loading
                        <View style={[styles.cont2, { backgroundColor: '#FF9789' }]}>
                            <Text style={[styles.txt4, { color: 'black' }]}>Get 10x more benefits</Text>
                            <LinearGradient colors={['#ff4a4a', '#B53535']} style={styles.cont3}>
                                <ActivityIndicator size="small" color="#ffffff" />
                            </LinearGradient>
                        </View>
                    ) : userprofiledata?.subscriptionDetails?.subscriptionType === 'Gold' ? (
                        // If subscribed and Gold, show the "Upgrade to Luxury" button
                        <View style={[styles.cont2, { backgroundColor: '#FF9789' }]}>
                            <Text style={[styles.txt4, { color: 'black' }]}>Get 10x more benefits</Text>
                            <LinearGradient colors={['#ff4a4a', '#B53535']} style={styles.cont3}>
                                <TouchableOpacity onPress={() => navigation.navigate('MySubscription')}>
                                    <Text style={styles.txt5}>Upgrade to Luxury</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    ) : !userprofiledata?.isSubscribed ? (
                        // If not subscribed, show "Become A VIP Member" button
                        <View style={styles.cont2}>
                            <Text style={styles.txt4}>Get 3x more benefits</Text>
                            <LinearGradient colors={['#916008', '#CC9933']} style={styles.cont3}>
                                <TouchableOpacity onPress={() => navigation.navigate(userdetails?.country === 'India' ? 'RazorPay' : 'Paypal')}>
                                    <Text style={styles.txt5}>Become A VIP Member Today</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    ) : (
                        // If no subscription or other cases, show fallback content or other options
                        <TouchableOpacity onPress={() => navigation.navigate('MySubscription')}>
                            <View style={{ alignItems: 'center' }}>
                                <Image source={images.lmember} style={{ height: 153, width: 345, marginTop: 20 }} />
                            </View>
                        </TouchableOpacity>
                    )
                }



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

                <View style={{ marginBottom: 100, marginTop: 30 }}>
                    <Text style={styles.txt7}>App Version {appVersion}</Text>
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={[styles.txt7, { color: "#916008", fontSize: 20, marginTop: 10, fontFamily: POPPINSRFONTS.semibold }]}>Logout</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {selectedImage && (
                <Modal visible={isModal} transparent={true} onRequestClose={closeModal} onBackdropPress={closeModal} >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                            <Image style={styles.modalCloseText} source={images.cross} />
                        </TouchableOpacity>
                        {/* <Image source={{ uri: selectedImage }} style={styles.modalImage} /> */}
                        <ImageViewer
                            imageUrls={[{ url: selectedImage }]}
                            enableSwipeDown={true}
                            onSwipeDown={closeModal}
                            backgroundColor="rgba(0, 0, 0, 0.8)"
                        />
                    </View>
                </Modal>
            )}

            <RBSheet
                ref={rbSheetRef}
                height={200}
                closeOnPressMask={true}
                customStyles={{
                    container: {
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                }}
            >
                <View style={{ padding: 20, width: '100%' }}>
                    {/* Title text at the top */}
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 50, textAlign: 'center', textDecorationLine: 'underline' }}>
                        Choose Your Option
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', bottom: 20 }}>

                        {/* Camera Option */}
                        <TouchableOpacity
                            style={{ alignItems: 'center', flex: 1 }}
                            onPress={handleCrop}
                        >
                            <Image source={images.crop} style={{ height: 40, width: 40, marginBottom: 8 }} />
                            <Text>Crop Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ alignItems: 'center', flex: 1 }}
                            onPress={handleFullSize}
                        >
                            <Image source={images.fullimage} style={{ height: 40, width: 40, marginBottom: 8 }} />
                            <Text>Full Image</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </RBSheet>

            <Modal
                transparent={true}
                animationType="slide"
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}

            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Logout</Text>
                        <Text style={styles.message}>
                            Are you sure you want to log out?
                        </Text>
                        <View style={styles.buttons}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'white', borderColor: '#DDDDDD', borderWidth: 1 }]} onPress={() => setIsModalVisible(false)}>
                                <Text style={[styles.buttonText, { color: 'black' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => logout()}>
                                <Text style={styles.buttonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    txt: {
        color: 'black',
        fontFamily: PLAYFAIRFONTS.bold,
        fontSize: 30,
        textAlign: 'center',
        marginTop: 10
    },
    txt1: {
        color: '#3C4043',
        fontSize: 16,
        fontFamily: POPPINSRFONTS.regular,
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
        height: 20,
        width: 20,
        top: 2,
    },
    txt2: {
        color: '#916008',
        fontSize: 16,
        fontFamily: POPPINSRFONTS.medium,
        left: 8,
        top: 1
    },
    txt3: {
        color: '#5F6368',
        fontSize: 16,
        fontFamily: POPPINSRFONTS.regular,
        textAlign: 'center',
        bottom: 10
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
        fontSize: 16,
        fontFamily: 'Poppins-Medium'
    },
    cont4: {
        flexDirection: 'row',
        marginLeft: 20,
        marginTop: 20

    },
    boost: {
        height: 28,
        width: 28,
        top: 5
    },
    txt6: {
        color: '#4285F4',
        fontSize: 18,
        fontFamily: POPPINSRFONTS.medium,
        marginLeft: 10,
        top: 5
    },
    txt7: {
        textAlign: 'center',
        color: '#3C4043',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        marginTop: 10
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
    // overlay: {

    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    //     zIndex: 1, // Ensure it appears on top of the content
    // },
    // blurOverlay: {
    //     backgroundColor: 'white',
    //     padding: 20,
    //     borderRadius: 10,
    // },
    modalBackground: {
        height: '110%',
        width: '130%',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: 320,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignSelf: 'center',
        // height: 460
    },
    title: {
        fontSize: 23,
        marginBottom: 10,
        fontFamily: GARAMOND.bold,
        textAlign: 'center'
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#3C4043',
        fontFamily: POPPINSRFONTS.regular
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    button: {
        height: 40,
        width: 100,
        borderRadius: 5,
        backgroundColor: '#916008',
        borderColor: '#916008',
        marginTop: 30,
        alignSelf: 'center',
        justifyContent: "center"
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
    },
})