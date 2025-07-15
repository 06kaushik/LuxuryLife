import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, Dimensions, ScrollView, FlatList, ActivityIndicator, TextInput, TouchableWithoutFeedback } from "react-native";
import images from "../../../components/images";
import Modal from "react-native-modal";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GARAMOND, POPPINSRFONTS } from "../../../components/GlobalStyle";
import ImageViewer from 'react-native-image-zoom-viewer';
import RBSheet from "react-native-raw-bottom-sheet";
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from "../../../components/AuthProvider";
import Toast from 'react-native-simple-toast'
import LottieView from 'lottie-react-native';



const PhotoVideoPermissions = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [userdetails, setUserDetails] = useState(null);
    const [videoanyone, setVideoAnyone] = useState(true)
    const [videomessage, setVideoMessage] = useState(false)
    const [videosubscribe, setVideoSubscribed] = useState(false)
    const [voiceanyone, setVoiceAnyone] = useState(true)
    const [voicemessage, setVoiceMessage] = useState(false)
    const [voicesubscribe, setVoiceSubscribed] = useState(false)
    const [securityeveryone, setSecurityEveryone] = useState(true)
    const [securitysubscribe, setSecuritySubscribe] = useState(false)
    const [privacyprofileview, SetPrivacyProfileView] = useState(false)
    const [privacyfavourite, setPrivacyFavourite] = useState(false)
    const [joindate, setJoinDate] = useState(false)
    const [status, setStatus] = useState(true)
    const [lastactive, setLastActive] = useState(true)
    const [privatememberlist, setPrivateMemberList] = useState([]);
    const [privatesharing, setPrivateSharing] = useState(false);
    const [sharingwith, setSharingWith] = useState(false);
    const [privatePhotos, setPrivatePhotos] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmpassword, setConfirmPassword] = useState('')
    const [confirmpassword1, setConfirmPassword1] = useState('')
    const [question1, setQuestion1] = useState('');
    const [answer1, setAnswer1] = useState('');
    const [otherreason, setOtherReason] = useState('')
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isDeactivated, setIsDeactivated] = useState(false);
    const rbSheetRef = useRef();
    const rbSheetRef1 = useRef();
    const { logout } = useContext(AuthContext);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeactivate, setIsDeactivate] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [userprofiledata, setUserProfileData] = useState();




    const reasonList = [

        { label: 'Found a Match', value: 'q1' },
        { label: 'Taking a break', value: 'q2' },
        { label: 'I did not find the app useful', value: 'q3' },
        { label: 'I experienced technical issues', value: 'q4' },
        { label: 'I had concerns about privacy and safety', value: 'q5' },
        { label: 'The subscription pricing is too high', value: 'q6' },
        { label: 'Other', value: 'q7' },

    ];

    useEffect(() => {
        getUserProfileData()
    }, [])

    const renderDropdownWithInput = (label, selectedValue, setSelectedValue, answerValue, setAnswerValue) => (
        <View style={styles.dropdownContainer}>
            <View style={styles.dropdown}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={(value) => setSelectedValue(value)}
                    style={styles.picker}
                    dropdownIconColor="transparent"
                >
                    <Picker.Item label={label} value="" />
                    {reasonList.map((question) => (
                        <Picker.Item
                            key={question.value}
                            label={question.label}
                            value={question.label}
                        />
                    ))}
                </Picker>
                {/* <Image source={images.dropdown} style={styles.downArrowIcon} /> */}
            </View>

        </View>
    );

    const confirmDeactivate = async () => {
        setIsDeactivate(true)
        await userDeactivateAccount()
        setIsDeactivate(false)

    }

    const confirmPermanentDelete = async () => {
        if (question1 === 'Other' && otherreason.length < 5) {
            Toast.show('Enter Reason', Toast.SHORT)
            return;
        }
        setIsDeleting(true);
        await userPermanentDeleteAccount();
        setIsDeleting(false);
    }

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
        } finally {
            setLoadingProfile(false);
            console.log('loading stoppppp ...... userdarta');

        }
    }


    const userDeactivateAccount = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        let body = {
            status: false,
            password: confirmpassword
        };
        try {
            const resp = await axios.post('auth/deactivate-account', body, { headers });
            console.log('response from the deactivate/reactivate account', resp.data);
            Toast.show(resp?.data?.message, Toast.SHORT)
            rbSheetRef.current?.close();
            logout()
        } catch (error) {
            Toast.show(error.response.data.message, Toast.SHORT)
            rbSheetRef.current?.close();
            console.log('error from the deactivate/reactivate account', error.response.data.message);
        }
    };


    const userPermanentDeleteAccount = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token,
        }
        let body = {
            password: confirmpassword1,
            reason: question1,
            otherReason: otherreason
        }
        console.log('body of permanent delete', body);
        try {
            const resp = await axios.post('auth/delete-account', body, { headers })
            console.log('response from the permanent delete account', resp?.data?.message);
            Toast.show(resp?.data?.message, Toast.SHORT)
            await AsyncStorage.removeItem('permissionData');
            await AsyncStorage.removeItem('notificationData');
            logout()
            rbSheetRef1.current?.close();
        } catch (error) {
            Toast.show(error?.response?.data?.message, Toast.SHORT)
            rbSheetRef1.current?.close();
            console.log('error from the permanent deete account', error?.response?.data?.message);
        }
    }

    useEffect(() => {
        loadSettingsFromStorage();
    }, []);

    const handleVideoMessageToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !securitysubscribe;
            setVideoMessage(newStatus);

            // If enabling "Only subscribed members", disable the "Everyone" toggle
            if (newStatus) {
                setVideoAnyone(false);
            }
        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };

    const handleVideoAnyoneToggle = () => {
        if (!videoanyone) {
            setVideoAnyone(true);
            // If "Anyone" is turned on, disable the other two toggles
            setVideoMessage(false);
            setVideoSubscribed(false);
        } else {
            setVideoAnyone(false);
        }
    };

    const handleSubscribedToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !videosubscribe;
            setVideoSubscribed(newStatus);

            // If enabling "Only subscribed members", disable the first two toggles
            if (newStatus) {
                setVideoAnyone(false);
                setVideoMessage(false);
            }
        } else {
            // Show some message or handle if user is not subscribed
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };

    // Function to handle the "Anyone" toggle behavior for Voice Calls
    const handleVoiceAnyoneToggle = () => {
        if (!voiceanyone) {
            setVoiceAnyone(true);
            // If "Anyone" is turned on, disable the other two toggles
            setVoiceMessage(false);
            setVoiceSubscribed(false);
        } else {
            setVoiceAnyone(false);
        }
    };

    // Function to handle the "Only people you've messaged" toggle behavior for Voice Calls
    const handleVoiceMessageToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !securitysubscribe;
            setVoiceMessage(newStatus);

            // If enabling "Only subscribed members", disable the "Everyone" toggle
            if (newStatus) {
                setVoiceAnyone(false);
            }
        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };

    // Function to handle the "Only subscribed members" toggle behavior for Voice Calls
    const handleVoiceSubscribedToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !voicesubscribe;
            setVoiceSubscribed(newStatus);

            // If enabling "Only subscribed members", disable the first two toggles
            if (newStatus) {
                setVoiceAnyone(false);
                setVoiceMessage(false);
            }
        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };

    // Function to handle the "Everyone" toggle behavior for Security Information
    const handleSecurityEveryoneToggle = () => {
        if (!securityeveryone) {
            setSecurityEveryone(true);
            // If "Everyone" is turned on, disable the other toggle
            setSecuritySubscribe(false);
        } else {
            setSecurityEveryone(false);
        }
    };

    // Function to handle the "Only subscribed members" toggle behavior for Security Information
    const handleSecuritySubscribedToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !securitysubscribe;
            setSecuritySubscribe(newStatus);

            // If enabling "Only subscribed members", disable the "Everyone" toggle
            if (newStatus) {
                setSecurityEveryone(false);
            }
        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };

    const handleFavSubscribedToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !privacyfavourite;
            setPrivacyFavourite(newStatus);

        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };

    const handleJoinDateSubscribedToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !joindate;
            setJoinDate(newStatus);

        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };
    const handleFavouriteSubscribedToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !privacyfavourite;
            setPrivacyFavourite(newStatus);

        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };

    const handleProfileViewSubscribedToggle = () => {
        if (userprofiledata?.isSubscribed) {
            // If the user is subscribed, toggle the "Only subscribed members"
            const newStatus = !privacyprofileview;
            SetPrivacyProfileView(newStatus);

        } else {
            setIsModalVisible(true)
            Toast.show('You need to be subscribed to enable this option.', Toast.SHORT);
        }
    };


    useEffect(() => {
        handlePrivacyPermission()
    }, [videoanyone, videomessage, videosubscribe, voiceanyone, voicemessage, voicesubscribe, securityeveryone, securitysubscribe, privacyprofileview, privacyfavourite, joindate, status, lastactive])

    const handlePrivacyPermission = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            privacyAndSecuritySetting: {
                videoCallSettings: {
                    anyOne: videoanyone,
                    onlyMessaged: videomessage,
                    onlySubscriber: videosubscribe
                },
                voiceCallSettings: {
                    anyOne: voiceanyone,
                    onlyMessaged: voicemessage,
                    onlySubscriber: voicesubscribe
                },
                securityInformation: {
                    anyOne: securityeveryone,
                    onlySubscriber: securitysubscribe,

                },
                privacySettings: {
                    profileViews: privacyprofileview,
                    favorites: privacyfavourite,
                    joinDate: joindate,
                    status: status,
                    lastActive: lastactive
                }
            }
        }
        // console.log('body of handleNotification', body);

        try {
            const resp = await axios.put(`account/update-account-settings/${userdetails?._id}`, body, { headers })
            // console.log('response from handle notification', resp.data.data);
            await AsyncStorage.setItem('permissionData', JSON.stringify(body));

        } catch (error) {
            console.log('error from handle notification', error.response.data.message);
        }
    }


    const loadSettingsFromStorage = async () => {
        try {
            const storedSettings = await AsyncStorage.getItem('permissionData');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);

                const settings = parsedSettings.privacyAndSecuritySetting;

                // Video Call Settings
                setVideoAnyone(settings.videoCallSettings.anyOne);
                setVideoMessage(settings.videoCallSettings.onlyMessaged);
                setVideoSubscribed(settings.videoCallSettings.onlySubscriber);

                // Voice Call Settings
                setVoiceAnyone(settings.voiceCallSettings.anyOne);
                setVoiceMessage(settings.voiceCallSettings.onlyMessaged);
                setVoiceSubscribed(settings.voiceCallSettings.onlySubscriber);

                // Security Settings
                setSecurityEveryone(settings.securityInformation.anyOne);
                setSecuritySubscribe(settings.securityInformation.onlySubscriber);

                // Privacy Settings
                SetPrivacyProfileView(settings.privacySettings.profileViews);
                setPrivacyFavourite(settings.privacySettings.favorites);
                setJoinDate(settings.privacySettings.joinDate);
                setStatus(settings.privacySettings.status);
                setLastActive(settings.privacySettings.lastActive);

            } else {
                fetchAccountSettings();
            }
        } catch (error) {
            console.error('Error loading settings from storage:', error.message);
            fetchAccountSettings();
        }
    };


    const fetchAccountSettings = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const headers = { Authorization: token };
            const resp = await axios.post(
                `account/get-account-settings/${userdetails?._id}`,
                {},
                { headers }
            );
            const parsedSettings = response.data.data;
            const settings = parsedSettings.privacyAndSecuritySetting;

            // Video Call Settings
            setVideoAnyone(settings.videoCallSettings.anyOne);
            setVideoMessage(settings.videoCallSettings.onlyMessaged);
            setVideoSubscribed(settings.videoCallSettings.onlySubscriber);

            // Voice Call Settings
            setVoiceAnyone(settings.voiceCallSettings.anyOne);
            setVoiceMessage(settings.voiceCallSettings.onlyMessaged);
            setVoiceSubscribed(settings.voiceCallSettings.onlySubscriber);

            // Security Settings
            setSecurityEveryone(settings.securityInformation.anyOne);
            setSecuritySubscribe(settings.securityInformation.onlySubscriber);

            // Privacy Settings
            SetPrivacyProfileView(settings.privacySettings.profileViews);
            setPrivacyFavourite(settings.privacySettings.favorites);
            setJoinDate(settings.privacySettings.joinDate);
            setStatus(settings.privacySettings.status);
            setLastActive(settings.privacySettings.lastActive);

            await AsyncStorage.setItem('permissionData', JSON.stringify(parsedSettings));

        } catch (error) {
            console.error('Error fetching account settings:', error.response.data.message);
        }
    }


    const handleImageClick = (images) => {
        setSelectedImages(images);
        setModalVisible(true);
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Show loader
                setLoading(true);

                // Fetch user details
                const userData = await AsyncStorage.getItem('UserData');
                if (!userData) {
                    console.error('User data is missing.');
                    return;
                }

                const parsedData = JSON.parse(userData);
                setUserDetails(parsedData);
                setIsDeactivated(parsedData?.active === false);


                setPrivatePhotos(parsedData.privatePhotos || []);


                if (parsedData?._id) {
                    await getPrivateMember(parsedData._id);
                } else {
                    console.error('User ID is missing. Unable to fetch private members.');
                }
            } catch (error) {
                console.error('Error during initialization:', error.message);
            } finally {
                // Hide loader
                setLoading(false);
            }
        };

        initializeData();
    }, []);


    const handleSharingWithToggle = async (newValue) => {
        setSharingWith(newValue);
        if (newValue === true) {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const headers = {
                    Authorization: token,
                };
                if (!userdetails?._id) {
                    console.error('User ID is missing. Unable to fetch private members.');
                    return;
                }
                const body = {};
                const resp = await axios.put(`account/remove-all-private-pic-access/${userdetails?._id}`, body, { headers });
                console.log('Response from removing all private access:', resp.data);
                await getPrivateMember(userdetails._id);
            } catch (error) {
                console.error('Error from removing all private access:', error?.response?.data?.message || error.message);
            }
        }
    };

    const hidePrivateMember = async (accessId) => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            console.error('Authorization token is missing.');
            return;
        }

        if (!userdetails?._id) {
            console.error('User ID is missing. Unable to fetch private members.');
            return;
        }

        const headers = {
            Authorization: token,
        };
        let body = {
            status: 'Removed'
        }

        try {
            const resp = await axios.put(`account/updated-private-pic-access/${accessId}`, body, { headers });
            console.log('Response from the hide member API:', resp?.data?.data);

            // Call getPrivateMember with the userId
            await getPrivateMember(userdetails._id);
        } catch (error) {
            console.error('Error fetching hide members:', error.response?.data?.message || error.message);
        }
    };


    const getPrivateMember = async (userId) => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            console.error('Authorization token is missing.');
            return;
        }

        const headers = {
            Authorization: token,
        };
        let body = {}

        try {
            const resp = await axios.post(`account/get-private-pic-access/${userId}`, body, { headers });
            // console.log('Response from private member API:', resp?.data?.data);
            setPrivateMemberList(resp?.data?.data || []);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Unknown error';
            console.error(`Error fetching private members: ${message}`);
        }
    };


    const renderMemberList = ({ item: user }) => (
        <View key={user?._id} style={styles.userContainer}>
            <Image
                source={{ uri: user?.targetUserId?.profilePicture }}
                style={{ height: 130, width: 100, borderRadius: 8 }}
            />
            <View>
                <Text style={styles.userName}>{user?.targetUserId?.userName}</Text>
                <Text style={styles.userLocation}>
                    {user?.targetUserId?.city}, {user?.targetUserId?.state}, {user?.targetUserId?.country}
                </Text>

                <View style={styles.photoContainer}>
                    {privatePhotos.slice(0, 2).map((photo, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleImageClick([photo])}
                        >
                            <Image source={{ uri: photo }} style={styles.photo} />
                        </TouchableOpacity>
                    ))}
                    {privatePhotos.length > 1 && (
                        <TouchableOpacity
                            style={styles.imageButton}
                            onPress={() => handleImageClick(privatePhotos)}
                        >
                            <Text style={styles.imageCount}>+{privatePhotos.length - 2}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.hideButton} onPress={() => hidePrivateMember(user?._id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.closeeye} style={{ height: 18, width: 18, marginRight: 5 }} />
                    <Text style={styles.hideText}>Hide</Text>
                </View>
            </TouchableOpacity>
        </View>
    );




    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#916008" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Privacy & Permissions</Text>
                </View>
            </TouchableOpacity>

            <ScrollView style={{}}>
                <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: 'black' }}>Video Call Settings</Text>
                <Text style={{ fontSize: 16, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: '#7A7A7A' }}>Allow video calls from:</Text>

                <View style={[styles.toggleContainer, { marginTop: 10 }]}>
                    <Text style={styles.toggleText}>Anyone</Text>
                    <Switch
                        value={videoanyone}
                        onValueChange={handleVideoAnyoneToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Only people you've messaged</Text>
                    <Switch
                        value={videomessage}
                        onValueChange={handleVideoMessageToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                {!userprofiledata?.isSubscribed ?
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={{ marginLeft: 16, color: '#916008' }}>(Upgrade required)</Text>
                        <Image source={images.lock} style={{ height: 20, width: 20, tintColor: '#916008', position: 'absolute', left: 140 }} />
                    </TouchableOpacity>
                    :
                    null
                }


                <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', marginTop: 20 }} />

                <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: 'black' }}>Voice Call Settings</Text>
                <Text style={{ fontSize: 16, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: '#7A7A7A' }}>Allow voice calls from:</Text>

                <View style={[styles.toggleContainer, { marginTop: 10 }]}>
                    <Text style={styles.toggleText}>Anyone</Text>
                    <Switch
                        value={voiceanyone}
                        onValueChange={handleVoiceAnyoneToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Only people you've messaged</Text>
                    <Switch
                        value={voicemessage}
                        onValueChange={handleVoiceMessageToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                {!userprofiledata?.isSubscribed ?
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={{ marginLeft: 16, color: '#916008' }}>(Upgrade required)</Text>
                        <Image source={images.lock} style={{ height: 20, width: 20, tintColor: '#916008', position: 'absolute', left: 140 }} />
                    </TouchableOpacity>
                    :
                    null}


                <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', marginTop: 20 }} />


                <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: 'black' }}>Security Information</Text>
                <Text style={{ fontSize: 16, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: '#7A7A7A' }}>Show profile in search results:</Text>

                <View style={styles.toggleContainer}>
                    <Text style={[styles.toggleText, { top: 3 }]}>Everyone</Text>
                    <Switch
                        value={securityeveryone}
                        onValueChange={handleSecurityEveryoneToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Only subscribed members</Text>
                    <Switch
                        value={securitysubscribe}
                        onValueChange={handleSecuritySubscribedToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                {!userprofiledata?.isSubscribed ?
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={{ marginLeft: 16, color: '#916008' }}>(Upgrade required)</Text>
                        <Image source={images.lock} style={{ height: 20, width: 20, tintColor: '#916008', position: 'absolute', left: 140 }} />
                    </TouchableOpacity>
                    :
                    null}

                <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', marginTop: 20 }} />

                <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: 'black' }}>Privacy Settings</Text>
                <Text style={{ fontSize: 16, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: '#7A7A7A' }}>Your Activity</Text>

                <Text style={{ marginTop: 10, top: 10, marginLeft: 16, color: 'black', fontFamily: POPPINSRFONTS.bold }}>Profile Views</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Shows when you view someone</Text>
                    <Switch
                        value={privacyprofileview}
                        onValueChange={handleProfileViewSubscribedToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                {!userprofiledata?.isSubscribed ?
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={{ marginLeft: 16, color: '#916008' }}>(Upgrade required)</Text>
                        <Image source={images.lock} style={{ height: 20, width: 20, tintColor: '#916008', position: 'absolute', left: 140 }} />
                    </TouchableOpacity>
                    :
                    null}

                <Text style={{ marginTop: 10, top: 10, marginLeft: 16, color: 'black', fontFamily: POPPINSRFONTS.bold }}>Favorites</Text>
                <View style={styles.toggleContainer}>
                    <Text style={[styles.toggleText, { top: 10 }]}>Hide your profile when you favorite someone</Text>
                    <Switch
                        value={privacyfavourite}
                        onValueChange={handleFavouriteSubscribedToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                {!userprofiledata?.isSubscribed ?
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={{ marginLeft: 16, color: '#916008' }}>(Upgrade required)</Text>
                        <Image source={images.lock} style={{ height: 20, width: 20, tintColor: '#916008', position: 'absolute', left: 140 }} />
                    </TouchableOpacity>
                    :
                    null}


                <Text style={{ fontSize: 16, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: '#7A7A7A' }}>Profile Info</Text>

                <Text style={{ marginTop: 10, top: 10, marginLeft: 16, color: 'black', fontFamily: POPPINSRFONTS.bold }}>Join Date</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Show join date on your profile</Text>
                    <Switch
                        value={joindate}
                        onValueChange={handleJoinDateSubscribedToggle}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                {(!userprofiledata?.isSubscribed || (userprofiledata?.isSubscribed && userprofiledata?.subscriptionType !== 'Luxury')) ? (
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={{ marginLeft: 16, color: '#916008' }}>(Upgrade required)</Text>
                        <Image
                            source={images.lock}
                            style={{
                                height: 20,
                                width: 20,
                                tintColor: '#916008',
                                position: 'absolute',
                                left: 140
                            }}
                        />
                    </TouchableOpacity>
                ) : null}


                <Text style={{ fontSize: 16, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: '#7A7A7A' }}>Online Status</Text>
                <Text style={{ marginTop: 10, top: 10, marginLeft: 16, color: 'black', fontFamily: POPPINSRFONTS.bold }}>Status</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Shows when you're online</Text>
                    <Switch
                        value={status}
                        onValueChange={() => setStatus((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                <Text style={{ marginTop: 10, top: 10, marginLeft: 16, color: 'black', fontFamily: POPPINSRFONTS.bold }}>Last Active</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Show your last active time</Text>
                    <Switch
                        value={lastactive}
                        onValueChange={() => setLastActive((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', marginTop: 20 }} />

                <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20, color: 'black' }}>Account Settings</Text>
                <Text style={[styles.toggleText, { marginTop: 10 }]}>Temporarily disable your account. You can reactivate it anytime.</Text>

                <TouchableOpacity onPress={() => rbSheetRef?.current?.open()} style={{ borderWidth: 1, height: 50, width: '90%', justifyContent: 'center', alignSelf: 'center', borderRadius: 100, borderColor: '#DDDDDD', backgroundColor: 'white', top: 10 }}>
                    <Text style={{ color: 'black', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-Medium' }}>{isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}</Text>
                </TouchableOpacity>

                <Text style={[styles.toggleText, { marginTop: 30 }]}>Permanently delete your account and all related data. This action cannot be undone.</Text>

                <TouchableOpacity onPress={() => rbSheetRef1?.current?.open()} style={{ borderWidth: 1, height: 50, width: '90%', justifyContent: 'center', alignSelf: 'center', borderRadius: 100, borderColor: '#DDDDDD', backgroundColor: 'white', top: 10, marginBottom: 30 }}>
                    <Text style={{ color: 'black', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-Medium' }}>Delete Account</Text>
                </TouchableOpacity>

                <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} />
                <View style={styles.toggleContainer}>
                    <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
                        Sharing Private Photos with
                    </Text>
                    <Switch
                        value={sharingwith}
                        onValueChange={(newValue) => handleSharingWithToggle(newValue)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                {privatememberlist.length === 0 ?
                    <View style={styles.photoSection}>
                        <Image source={images.privacy} style={styles.privacyIcon} />
                        <Text style={styles.emptyText}>You haven't shared any private photos.</Text>
                        <Text style={styles.infoText}>
                            Members that you have shared private photos with will display here.
                        </Text>
                    </View>
                    :
                    <FlatList
                        data={privatememberlist}
                        keyExtractor={(item) => item._id}
                        renderItem={renderMemberList}
                        removeClippedSubviews={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                }


            </ScrollView>

            <RBSheet
                ref={rbSheetRef}
                height={400}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                    draggableIcon: {
                        backgroundColor: "#C4C4C4",
                    },
                }}
            >
                <View style={{ marginLeft: 16, marginRight: 16 }}>
                    <Text style={{ textAlign: 'center', fontSize: 24, color: "black", fontFamily: GARAMOND.bold, marginTop: 10 }}>Are you sure you want to deactivate your account?</Text>
                    <Text style={{ color: '#3C4043', fontSize: 14, fontFamily: POPPINSRFONTS.regular, textAlign: "center", marginTop: 10 }}>Your account will be temporarily disabled. You can log in again anytime using the same credentials to reactivate it.</Text>

                    <View style={styles.inputContainer1}>
                        <TextInput
                            style={[styles.input1, { flex: 1 }]}
                            placeholder="Enter Password"
                            placeholderTextColor="#B0B0B0"
                            secureTextEntry={!isPasswordVisible}
                            value={confirmpassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setPasswordVisible(!isPasswordVisible)}
                            style={styles.eyeIconContainer}
                        >
                            <Image
                                source={isPasswordVisible ? images.openeye : images.closeeye}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => rbSheetRef.current.close()} style={{ top: 40, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#916008', backgroundColor: '#916008' }}>
                        <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={isDeactivate} onPress={confirmDeactivate} style={{ top: 60, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#DDDDDD', backgroundColor: 'white' }}>
                        {isDeactivate ? (
                            <ActivityIndicator size="small" color="#916008" />
                        ) : (
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Confirm Deactivation</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </RBSheet>
            <RBSheet
                ref={rbSheetRef1}
                height={520}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                    draggableIcon: {
                        backgroundColor: "#C4C4C4",
                    },
                }}
            >
                <View style={{ marginRight: 16, marginLeft: 16 }}>
                    <Text style={{ textAlign: 'center', fontSize: 24, color: "black", fontFamily: GARAMOND.bold, marginTop: 10 }}>Are you sure you want to delete your account?</Text>
                    <Text style={{ color: '#3C4043', fontSize: 14, fontFamily: POPPINSRFONTS.regular, textAlign: "center", marginTop: 10 }}>This action is irreversible. All your data will be lost, and you'll need to create a new account to use our services again.</Text>
                    <View style={{ marginTop: 20 }}>
                        {renderDropdownWithInput('Select your reason', question1, setQuestion1, answer1, setAnswer1)}
                    </View>
                    {question1 === 'Other' ?
                        <TextInput
                            placeholder="Enter your reason here "
                            placeholderTextColor='grey'
                            value={otherreason}
                            maxLength={100}
                            onChangeText={setOtherReason}
                            style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', paddingLeft: 20, borderColor: '#DDDDDD', color: 'black', borderRadius: 10, }}

                        />
                        :
                        null}

                    <View style={[styles.inputContainer1, {}]}>
                        <TextInput
                            style={[styles.input1, { flex: 1 }]}
                            placeholder="Enter Password"
                            placeholderTextColor="#B0B0B0"
                            secureTextEntry={!isPasswordVisible}
                            value={confirmpassword1}
                            onChangeText={setConfirmPassword1}
                        />
                        <TouchableOpacity
                            onPress={() => setPasswordVisible(!isPasswordVisible)}
                            style={styles.eyeIconContainer}
                        >
                            <Image
                                source={isPasswordVisible ? images.openeye : images.closeeye}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginTop: question1 !== 'Other' ? 20 : null }}>
                        <TouchableOpacity onPress={() => rbSheetRef1.current.close()} style={{ top: 30, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#916008', backgroundColor: '#916008', }}>
                            <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={isDeleting}
                            onPress={confirmPermanentDelete}
                            style={{
                                top: 50,
                                borderWidth: 1,
                                height: 50,
                                width: '90%',
                                alignSelf: 'center',
                                borderRadius: 100,
                                justifyContent: "center",
                                borderColor: '#DDDDDD',
                                backgroundColor: isDeleting ? '#f0f0f0' : 'white'
                            }}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#916008" />
                            ) : (
                                <Text style={{
                                    textAlign: 'center',
                                    color: 'black',
                                    fontSize: 16,
                                    fontFamily: 'Poppins-SemiBold'
                                }}>
                                    Confirm Deletion
                                </Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </View>
            </RBSheet>


            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={{
                    height: '110%',
                    width: '130%',
                    alignSelf: 'center',
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                }}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                        <Image style={styles.modalCloseText} source={images.cross} />
                    </TouchableOpacity>
                    <ImageViewer
                        imageUrls={selectedImages.map((url) => ({ url }))}
                        enableSwipeDown
                        onSwipeDown={() => setModalVisible(false)}
                        onCancel={() => setModalVisible(false)}
                        backgroundColor="rgba(0,0,0,0.9)"
                        saveToLocalByLongPress={false}
                    />
                </View>
            </Modal>


            <Modal isVisible={isModalVisible} style={styles.modal}>
                <View style={styles.overlay}>
                    <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.closeButton1, { borderColor: 'white' }]}>
                        <Image source={images.cross} style={[styles.closeIcon, { tintColor: 'white' }]} />
                    </TouchableOpacity>
                    {userprofiledata?.country === 'India' ?
                        <TouchableWithoutFeedback onPress={() => {
                            setIsModalVisible(false);
                            navigation.navigate('RazorPay');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableWithoutFeedback>
                        :
                        <TouchableWithoutFeedback onPress={() => {
                            setIsModalVisible(false);
                            navigation.navigate('Paypal');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableWithoutFeedback>}
                </View>
            </Modal>

        </View>
    );
};

export default PhotoVideoPermissions;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 10,
    },
    cont: {
        flexDirection: "row",
        marginTop: 40,
    },
    txt: {
        fontSize: 23,
        fontFamily: POPPINSRFONTS.medium,
        marginLeft: 12,
        top: 3,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 16,
        fontFamily: POPPINSRFONTS.semibold,
        color: "black",
        marginBottom: 10,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // marginTop: 20
    },
    toggleText: {
        fontSize: 16,
        fontFamily: POPPINSRFONTS.regular,
        color: "black",
        marginLeft: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    arrowIcon: {
        width: 20,
        height: 20,
        tintColor: "#916008",
    },
    privacyDescription: {
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: "#5F6368",
        marginTop: 5,
    },

    dropdownContainer: {
        marginBottom: 20,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: 'white',
        height: 50,
        paddingHorizontal: 10,
        position: 'relative',
        width: '90%',
        alignSelf: 'center'
    },
    picker: {
        flex: 1,
        color: '#000',
    },
    downArrowIcon: {
        width: 20,
        height: 20,
        position: 'absolute',
        right: 15,
        tintColor: '#999',
    },
    textInput: {
        marginTop: 10,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        color: '#000',
    },
    inputContainer1: {
        flexDirection: 'row', // Aligns the text input and eye icon horizontally
        alignItems: 'center',
        borderColor: '#DDDDDD',
        borderRadius: 10, // Rounded corners for the container
        borderWidth: 1, // Border for the input container
        height: 50, // Adjust height for consistent input size
        width: '90%', // Take full width
        marginTop: 20, // Add space from the previous element
        position: 'relative',
        alignSelf: 'center'
    },
    input1: {
        flex: 1, // The input takes up the remaining space
        paddingLeft: 20,
        height: '100%',
        borderRadius: 100,
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },

    eyeIconContainer: {
        position: 'absolute',
        right: 10, // Positions the eye icon at the far right of the container
        top: '50%',
        transform: [{ translateY: -10 }], // Centers the icon vertically
    },

    eyeIcon: {
        height: 20,
        width: 20,
    },
    privacyIcon: {
        height: 60,
        width: 60,
        marginTop: 10,
        marginBottom: 10,
    },
    photoSection: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20
    },
    emptyText: {
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        color: "#000",
        textAlign: "center",
    },
    infoText: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#7B7B7B",
        textAlign: "center",
        marginTop: 5,
        paddingHorizontal: 10,
    },
    userContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
    },
    photoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4, marginLeft: 20
    },
    photo: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginRight: 5,
    },
    imageButton: {
        backgroundColor: "#916008",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: "center",
    },
    imageCount: {
        color: "#FFF",
        fontFamily: "Poppins-Bold",
        fontSize: 12,
    },
    userInfoContainer: {
        flex: 1,
        marginLeft: 10,
    },
    userName: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: "black",
        marginLeft: 20
    },
    userLocation: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#7B7B7B",
        marginLeft: 20
    },
    hideButton: {
        borderWidth: 1,
        height: 36,
        width: 90,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#B8B8B8',
        marginTop: 50,
        right: 30

    },
    hideText: {
        color: "#3C4043",
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        textAlign: 'center',
        top: 1
    },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: {
        width: Dimensions.get("window").width, // Full width of the screen
        height: Dimensions.get("window").height * 0.8, // 80% of screen height
        resizeMode: "contain", // Ensures the image fits without distortion
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: "#916008",
        padding: 10,
        borderRadius: 10,
        bottom: 20
        // marginTop: 20,
    },
    closeText: {
        color: "#FFF",
        fontFamily: "Poppins-Bold",
        fontSize: 14,
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
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    modalContent: {
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // Added background color for clarity
    },
    pay: {
        textAlign: 'center',
        color: 'green',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: "#916008",
        borderRadius: 25,
        paddingVertical: 10,
        width: "100%",
        marginTop: 20,
    },
    submitText: {
        fontSize: 16,
        color: "white",
        textAlign: "center",
        fontFamily: "Poppins-Medium",
    },
    overlay: {
        // flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        margin: 0,
    },
    closeButton1: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
        borderWidth: 1,
        height: 30,
        width: 30,
        justifyContent: 'center',
        borderRadius: 100,


    },
    closeIcon: {
        height: 17,
        width: 17,
        alignSelf: 'center',

    },
});

