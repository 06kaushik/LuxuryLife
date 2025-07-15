import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Image,
    ImageBackground,
    TextInput,
    TouchableWithoutFeedback
} from "react-native";
import FastImage from "react-native-fast-image";
import images from "./images";
import RBSheet from "react-native-raw-bottom-sheet";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from "moment";
import Toast from 'react-native-simple-toast'
import useSocket from "../socket/SocketMain";
import ImageViewer from 'react-native-image-zoom-viewer';
import { POPPINSRFONTS, PLAYFAIRFONTS, GARAMOND } from "./GlobalStyle";
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import LottieView from "lottie-react-native";
import { Dropdown } from 'react-native-element-dropdown';
import analytics from '@react-native-firebase/analytics';
import * as Clarity from '@microsoft/react-native-clarity';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';


const { width } = Dimensions.get("window");

const UserProfileDetails = ({ navigation, route }) => {

    const { item, dashScreen, profilePicture } = route.params


    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const [userdetails, setUserDetails] = useState(null);
    const [modalContent, setModalContent] = useState({ title: "", description: "", action: "" });
    const rbSheetRef = useRef();
    const rbSheetRef1 = useRef();
    const [userprofiledata, setUserProfileData] = useState();
    const isFocused = useIsFocused()
    const [userprofiledata1, setUserProfileData1] = useState();
    const [isModal, setIsModal] = useState(false);
    const [isModal1, setIsModal1] = useState(false);
    const [privatepicrequest, setPrivatePicRequest] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedImageIndex1, setSelectedImageIndex1] = useState(0);
    const [imagesToShow, setImagesToShow] = useState([]);
    const [imagesToShow1, setImagesToShow1] = useState([]);
    const { emit, on, once, removeListener } = useSocket(onSocketConnect);
    const [isLiked, setIsLiked] = useState(userprofiledata?.isLiked);
    const [ispremiumuser, setIsPremiumUser] = useState(userprofiledata?.isSubscribed || (userprofiledata?.gender === 'Female' && userprofiledata?.preferences?.gender[0] !== 'Female'))
    const [question1, setQuestion1] = useState('');
    const [answer1, setAnswer1] = useState('');
    const [otherreason, setOtherReason] = useState('')
    const [isLoading, setIsLoading] = useState(true);
    const isSwiping = useRef(false);
    const [likesetting, setManageLikeSetting] = useState()
    const [profileview, setProfileViewSetting] = useState()
    const [hidejoindate, setHideJoinDate] = useState()
    const [isModalVisible1, setIsModalVisible1] = useState(false);



    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };

    useEffect(() => {
        analytics().logEvent('first_profile_visit', {
            UserId: userdetails?._id,
            EmailId: userdetails?.email,
            Age: userdetails?.age,
            Gender: userdetails?.gender,
            Country: userdetails?.country,
            City: userdetails?.city,
            Profile_UserId: userprofiledata?._id
        });
        Clarity.sendCustomEvent('first_profile_visit')
    }, [userdetails, userprofiledata])


    useEffect(() => {
        getPhotoVideoSettings()
    }, [userdetails?._id])


    const getPhotoVideoSettings = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };

        try {
            const resp = await axios.post(
                `account/get-account-settings/${userdetails?._id}`,
                {},
                { headers }
            );
            // console.log('response from account settings in userdetails', resp.data);
            const parsedSettings = resp?.data?.data;
            const settings = parsedSettings?.privacyAndSecuritySetting;
            setManageLikeSetting(settings?.privacySettings?.favorites)
            setProfileViewSetting(settings?.privacySettings?.profileViews)
            setHideJoinDate(settings?.privacySettings?.joinDate)
        } catch (error) {
            // console.log(
            //     'error from account settings in userdetails',
            //     error.response?.data?.message || error.message
            // );
        }
    };


    const reasonList = [

        { label: 'Inappropriate Messages or Harassment', value: 'q1' },
        { label: 'Inappropriate Photos or Content', value: 'q2' },
        { label: 'Fake Profile / Impersonation', value: 'q3' },
        { label: 'Scam or Fraudulent Behaviour', value: 'q4' },
        { label: 'Hate Speech or Descrimination', value: 'q5' },
        { label: 'Underage User', value: 'q6' },
        { label: 'Spamming or Self-Promotion', value: 'q7' },
        { label: 'Unwanted Contact After Blocking', value: 'q8' },
        { label: 'Violent or Threatening Behaviour', value: 'q9' },
        { label: 'Other', value: 'q10' },

    ];


    const renderDropdownWithInput = (label, selectedValue, setSelectedValue, answerValue, setAnswerValue) => (
        <View style={styles.dropdownContainer}>
            <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownBox}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={reasonList}
                search
                maxHeight={300}
                labelField="label"
                valueField="label"
                placeholder={label}
                searchPlaceholder="Search..."
                value={selectedValue}
                onChange={item => {
                    setSelectedValue(item.label);
                }}
            />
        </View>
    );


    useEffect(() => {
        setIsPremiumUser(userprofiledata?.isSubscribed || (userprofiledata?.gender === 'Female' && userprofiledata?.preferences?.gender[0] !== 'Female'))
    }, [userprofiledata])


    useEffect(() => {
        setIsLiked(userprofiledata?.isLiked);
    }, [userprofiledata]);

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
    }, [isFocused])

    useEffect(() => {
        if (item) getUserProfileData();
        fetchUserProfile()

    }, [item]);

    const getUserProfileData = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        try {
            const resp = await axios.get(`home/get-user-profile/${item}`, { headers });
            setUserProfileData(resp?.data?.data);

        } catch (error) {
            console.log('error frm the user profile', error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userprofiledata) {
            emit('profileActivity', {
                action: 'view',
                targetUserId: item,
                userId: userdetails?._id,
            });
        }
    }, [userprofiledata])

    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const resp = await axios.get('auth/user-profile', {
                headers: { Authorization: token },
            });
            setUserProfileData1(resp?.data?.data);
        } catch (error) {
            console.log('Error fetching profile:', error?.response?.data?.message);
        }
    };


    const userLike = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: "LIKE"
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the like button', resp.data.data);
            if (likesetting !== true) {
                emit('profileActivity', {
                    action: 'like',
                    targetUserId: id,
                    userId: userdetails?._id,
                });
            }
            navigation.navigate('Home')
            //    Toast.show('User Liked Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the like ', error);
        }
    }

    const userLikeButton = async (id) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const body = {
            targetUserId: id,
            action: "LIKE"
        };

        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers });
            console.log('response from LIKE', resp.data.data);
            setIsLiked(true); // update local state
            if (likesetting !== true) {
                emit('profileActivity', {
                    action: 'like',
                    targetUserId: id,
                    userId: userdetails?._id,
                });
            }
        } catch (error) {
            console.log('error from LIKE', error);
        }
    };

    const userDisLikeButton = async (id) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const body = {
            targetUserId: id,
            action: "UNLIKE"
        };

        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers });
            console.log('response from DISLIKE', resp.data);
            setIsLiked(false); // update local state
            // navigation.goBack();
            // Toast.show('User Blocked Successfully', Toast.SHORT)
        } catch (error) {
            console.log('error from DISLIKE', error);
        }
    };

    const userDisLike = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: "DISLIKE"
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the DISLIKE button', resp.data);
            navigation.goBack('Home')
            // Toast.show('User Blocked Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the DISLIKE ', error);
        }
    }
    const hasLiked = item?.activity_logs?.some(log => log.action === "LIKE" && log.userId === userdetails?._id);

    const userBlock = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: "BLOCK"
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the BLOCK button', resp.data);
            navigation.goBack('')
            Toast.show('User Blocked Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the BLOCK ', error);
        }
    }

    const userHide = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: "HIDE"
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the hide button', resp.data);
            navigation.goBack('')
            Toast.show('User Hidden Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the hide ', error);
        }
    }

    const userReport = async (id) => {
        if (question1 === 'Other' && otherreason.length < 5) {
            Toast.show('Enter Reason', Toast.SHORT)
            return;
        }
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: "REPORT"
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the report button', resp.data);
            navigation.goBack('')
            Toast.show('User Reported Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the report ', error);
        }
    }

    const handlePicRequest = async (id) => {
        emit('privatePicRequest', {
            receiverId: id,
            targetUserId: userdetails?._id,
        });
        await requestPrivatePhoto(id)
    };

    const requestPrivatePhoto = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: userdetails?._id,
            receiverId: id
        }
        console.log('body of request ', body);
        try {
            const resp = await axios.post('home/request-private-pic-access', body, { headers })
            console.log('response from the request', resp?.data);
            getUserProfileData()
            if (resp?.data?.message === 'Private profile access requested successfully') {
                setPrivatePicRequest(true)
            }
            Toast.show('Private Photo Requested', Toast.SHORT)
        } catch (error) {
            console.log('error from the request photo', error?.response?.data?.message);
            Toast.show('Something went wrong', Toast.SHORT)
        }
    }

    const openBottomSheet = () => {
        rbSheetRef.current?.open();
    };

    const openModal = (type) => {
        switch (type) {
            case "Hide":
                setModalContent({
                    title: "Are you sure you want to Hide this member?",
                    description:
                        "This member will be hidden. You can undo this anytime.",
                    action: "Hide",
                });
                break;
            case "Block":
                setModalContent({
                    title: "Are you sure you want to Block this member?",
                    description:
                        "You can unblock this member whenever you want.",
                    action: "Block",
                });
                break;
            // case "Report":
            //     setModalContent({
            //         title: "Are you sure you want to Report this user?",
            //         description:
            //             "Please provide details about your report. Our team will review it and take appropriate action.",
            //         action: "Report",
            //     });
            //     break;
            default:
                break;
        }
        setModalVisible(true);
    };

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
        setIsModal(true);
        setImagesToShow(allImages);
    };
    const handleImageClick1 = (index) => {
        setSelectedImageIndex1(index);
        setIsModal1(true);
        setImagesToShow1(allImages1);
    };

    const closeModal = () => {
        setModalVisible(false);
        setIsModal(false)
        setIsModal1(false)
    };

    const handleAction = () => {
        if (modalContent.action === "Block") {
            userBlock(item);
        }
        if (modalContent.action === "Hide") {
            userHide(item);
        }
        // if (modalContent.action === "Report") {
        //     userReport(item);
        // }
        closeModal();
    };

    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setActiveIndex(index);
    };

    const handleChatPress = () => {

        try {
            emit("checkRoom", { users: { participantId: userprofiledata?._id, userId: userdetails?._id } });
            removeListener('roomResponse');
            once('roomResponse', (response) => {
                const roomId = response?.roomId;
                emit('initialMessages', { userId: userdetails?._id, roomId });
                removeListener('initialMessagesResponse');
                once('initialMessagesResponse', (response) => {
                    const messages = response?.initialMessages || [];
                    navigation.navigate('OneToOneChat', { roomId: roomId, initialMessages: messages, userName: userprofiledata?.userName, profilepic: userprofiledata?.profilePicture, id: userprofiledata?._id, otheruserprofiledata: userprofiledata, userprofiledata: userprofiledata1 });
                });
            });

        } catch (error) {
            console.log('error from navigatuo to one to one ', error);
        }
    };
    const allImages = useMemo(() => (
        [
            ...(userprofiledata?.profilePicture ? [{ url: userprofiledata?.profilePicture }] : []),
            ...(userprofiledata?.publicPhotos?.map(photo => ({ url: photo })) || []),
            ...(userprofiledata?.privatePhotos?.map(photo => ({ url: photo })) || []),
        ]
    ), [userprofiledata]);

    const allImages1 = useMemo(() => (
        [
            ...(userprofiledata?.privatePhotos?.map(photo => ({ url: photo })) || []),
        ]
    ), [userprofiledata]);


    return (
        <View style={styles.main}>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LottieView
                        source={require('../assets/loaderr.json')}
                        autoPlay
                        loop
                        style={{ width: 100, height: 100 }}
                    />
                </View>
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false} contentContainerStyle={{
                            flexGrow: 1, // Makes sure ScrollView content grows to fill available space
                            paddingBottom: 80, // Adds space at the bottom so it doesn’t overlap with the floating buttons
                        }}
                        style={{ flex: 1 }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => navigation.goBack()}
                            >
                                <FastImage source={images.back} style={styles.icon} />
                            </TouchableOpacity>
                            <View style={styles.dotsContainer}>
                                {userprofiledata?.publicPhotos?.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            activeIndex === index ? styles.activeDot : {},
                                        ]}
                                    />
                                ))}
                            </View>
                            <TouchableOpacity style={styles.iconButton} onPress={openBottomSheet}>
                                <FastImage source={images.dots} style={[styles.icon, { height: 20 }]} />
                                <RBSheet
                                    ref={rbSheetRef}
                                    height={180}
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
                                    <View style={{ marginTop: 20, }}>
                                        <TouchableOpacity onPress={() => openModal("Hide")}>
                                            <Text style={{ color: '#3C4043', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-SemiBold', margin: 10 }}>Hide</Text>
                                        </TouchableOpacity>
                                        <View style={{ borderWidth: 0.7, borderColor: '#EBEBEB', width: '80%', alignSelf: 'center' }} />
                                        <TouchableOpacity onPress={() => openModal("Block")}>
                                            <Text style={{ color: '#3C4043', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-SemiBold', margin: 10 }}>Block</Text>
                                        </TouchableOpacity>
                                        <View style={{ borderWidth: 0.7, borderColor: '#EBEBEB', width: '80%', alignSelf: 'center' }} />
                                        <TouchableOpacity onPress={() => rbSheetRef1.current.open()}>
                                            <Text style={{ color: '#3C4043', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-SemiBold', margin: 10 }}>Report</Text>
                                        </TouchableOpacity>
                                    </View>


                                </RBSheet>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.imageWrapper}>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={onScroll}
                                scrollEventThrottle={16}
                            >
                                {allImages.map((image, index) => (
                                    <TouchableWithoutFeedback
                                        key={index}
                                        onPress={() => {
                                            if (!isSwiping.current) handleImageClick(index);
                                        }}
                                    >
                                        <View style={styles.imageContainer}>
                                            <FastImage
                                                source={{ uri: image.url }}
                                                style={styles.img}
                                                resizeMode="cover"
                                            />
                                            <LinearGradient
                                                colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
                                                locations={[0.1, 0.6, 1]}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 200,
                                                    zIndex: 1,
                                                }}
                                            />
                                            {index === 0 && (
                                                <View style={styles.overlayContent}>
                                                    {/* Premium Badge, Name, Age, etc. (only once for main profile pic) */}
                                                    {userprofiledata?.subscriptionType && (
                                                        <LinearGradient
                                                            colors={
                                                                userprofiledata?.subscriptionType === 'Gold'
                                                                    ? ['#BF8500', '#604300', '#F2D28C', '#6A513E']
                                                                    : ['#FF4A4A', '#B53535']
                                                            }
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{
                                                                borderRadius: 100,
                                                                alignSelf: 'flex-start',
                                                                height: 25,
                                                                width: 100,
                                                                justifyContent: 'center',
                                                                top: 5,
                                                            }}
                                                        >
                                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                                                                {userprofiledata?.subscriptionType}
                                                            </Text>
                                                        </LinearGradient>
                                                    )}

                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                                                        <Text style={[styles.txt1, { color: 'white' }]}>
                                                            {userprofiledata?.userName?.charAt(0).toUpperCase() + userprofiledata?.userName?.slice(1)}, {userprofiledata?.age || 'N/A'}
                                                        </Text>
                                                        {userprofiledata?.isOnLine && (
                                                            <View style={{ borderWidth: 1, height: 15, width: 15, borderRadius: 100, top: 10, borderColor: 'green', backgroundColor: 'green', left: 5 }} />
                                                        )}
                                                        {userprofiledata?.isProfileVerified ?
                                                            <Image source={images.verify} style={[styles.img1, { left: 10, height: 30, width: 30, marginTop: 10 }]} />
                                                            :
                                                            null}
                                                    </View>

                                                    <Text style={[styles.txt2, { color: 'white', marginTop: 5 }]}>
                                                        {userprofiledata?.city || 'N/A'}, {userprofiledata?.country || 'N/A'}, {userprofiledata?.distance || 1} mile away
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableWithoutFeedback>
                                ))}
                            </ScrollView>

                        </View>
                        {dashScreen === undefined && (
                            <TouchableOpacity
                                onPress={() =>
                                    isLiked
                                        ? userDisLikeButton(userprofiledata?._id)
                                        : userLikeButton(userprofiledata?._id)
                                }
                                style={{
                                    alignSelf: 'flex-end',
                                    position: 'absolute',
                                    borderWidth: 1,
                                    height: 50,
                                    width: 50,
                                    justifyContent: 'center',
                                    borderRadius: 100,
                                    borderColor: 'white',
                                    top: 490,
                                    right: 30,
                                    backgroundColor: 'white',
                                    elevation: 4
                                }}
                            >
                                <Image
                                    source={isLiked ? images.redheart : images.heart}
                                    style={{ height: 30, width: 30, alignSelf: 'center' }}
                                />
                            </TouchableOpacity>

                        )}


                        <Text style={[styles.txt2, { fontFamily: POPPINSRFONTS.regular, fontSize: 16, marginLeft: 16, marginTop: 40, marginRight: 20 }]}>{userprofiledata?.myHeading || ''}</Text>

                        <View style={styles.cont4}>
                            <View style={styles.cont5}>
                                <View style={{ flexDirection: 'row', }}>
                                    <Image source={images.gender} style={styles.icon1} />
                                    <Text style={styles.txt3}>Gender</Text>
                                </View>
                                <Text style={styles.txt4}>{userprofiledata?.gender}</Text>
                            </View>

                            <View style={styles.cont5}>
                                <View style={{ flexDirection: 'row', }}>
                                    <Image source={images.star} style={styles.icon1} />
                                    <Text style={styles.txt3}>Member Since</Text>
                                </View>
                                <Text style={styles.txt4}>{moment(userprofiledata?.createdAt)?.fromNow() || NaN}</Text>
                            </View>
                            {userprofiledata?.currentRelationshipStatus && userprofiledata?.currentRelationshipStatus?.length > 0 ? (
                                <View style={styles.cont5}>
                                    <View style={{ flexDirection: 'row', }}>
                                        <Image source={images.heart} style={styles.icon1} />
                                        <Text style={styles.txt3}>Relationship</Text>
                                    </View>
                                    <Text style={styles.txt4}>{userprofiledata?.currentRelationshipStatus || ''}</Text>
                                </View>) : null}

                            <View style={styles.cont5}>
                                <View style={{ flexDirection: 'row', }}>
                                    <Image source={images.body} style={styles.icon1} />
                                    <Text style={styles.txt3}>Body</Text>
                                </View>
                                <Text style={styles.txt4}>{userprofiledata?.bodyType || NaN}</Text>
                            </View>

                            <View style={styles.cont5}>
                                <View style={{ flexDirection: 'row', }}>
                                    <Image source={images.height} style={styles.icon1} />
                                    <Text style={styles.txt3}>Height</Text>
                                </View>
                                <Text style={styles.txt4}>{Math.round(userprofiledata?.tall?.cm) || 'NaN'} cm</Text>
                            </View>
                        </View>

                        <View style={{
                            marginLeft: 16,
                            marginRight: 16,
                            marginTop: 20
                        }}>
                            <Text style={styles.txt5}>Verification</Text>
                            <View>
                                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={images.insta} style={{ height: 25, width: 25 }} />
                                        <Text style={{ fontSize: 18, marginLeft: 16, fontFamily: 'Poppins-Regular', color: '#3C4043' }}>Instagram</Text>
                                    </View>
                                    {userprofiledata?.isInstagramVerified ?
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 105,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={images.verified} style={{ height: 20, width: 20 }} />
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Verified</Text>
                                            </View>
                                        </View>
                                        :
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 120,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {/* <Image source={images.verified} style={{ height: 20, width: 20 }} /> */}
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Not Verified</Text>
                                            </View>
                                        </View>
                                    }
                                </View>

                                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={images.fb} style={{ height: 25, width: 25 }} />
                                        <Text style={{ fontSize: 18, marginLeft: 16, fontFamily: 'Poppins-Regular', color: '#3C4043' }}>Facebook</Text>
                                    </View>
                                    {userprofiledata?.isFacebookVerified === true ?
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 105,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={images.verified} style={{ height: 20, width: 20 }} />
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Verified</Text>
                                            </View>
                                        </View>
                                        :
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 120,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {/* <Image source={images.verified} style={{ height: 20, width: 20 }} /> */}
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Not Verified</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={images.twitter} style={{ height: 25, width: 25 }} />
                                        <Text style={{ fontSize: 18, marginLeft: 16, fontFamily: 'Poppins-Regular', color: '#3C4043' }}>Twitter</Text>
                                    </View>
                                    {userprofiledata?.isTwitterVerified ?
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 105,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={images.verified} style={{ height: 20, width: 20 }} />
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Verified</Text>
                                            </View>
                                        </View>
                                        :
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 120,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {/* <Image source={images.verified} style={{ height: 20, width: 20 }} /> */}
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Not Verified</Text>
                                            </View>
                                        </View>
                                    }
                                </View>

                                {/* <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={images.linkedin} style={{ height: 25, width: 25 }} />
                                        <Text style={{ fontSize: 18, marginLeft: 16, fontFamily: 'Poppins-Regular', color: '#3C4043' }}>LinkedIn</Text>
                                    </View>
                                    <Text style={{ fontSize: 16, fontFamily: 'Poppins-Regular', color: '#3C4043' }}></Text>
                                </View> */}

                                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={images.selfiev} style={{ height: 25, width: 25, tintColor: 'red' }} />
                                        <Text style={{ fontSize: 18, marginLeft: 16, fontFamily: 'Poppins-Regular', color: '#3C4043' }}>Selfie</Text>
                                    </View>
                                    {userprofiledata?.isProfileVerified === true ?
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 105,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={images.verified} style={{ height: 20, width: 20 }} />
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Verified</Text>
                                            </View>
                                        </View>
                                        :
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 120,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {/* <Image source={images.verified} style={{ height: 20, width: 20 }} /> */}
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Not Verified</Text>
                                            </View>
                                        </View>
                                    }
                                </View>

                                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={images.identity} style={{ height: 25, width: 25, tintColor: 'red' }} />
                                        <Text style={{ fontSize: 18, marginLeft: 16, fontFamily: 'Poppins-Regular', color: '#3C4043' }}>Identity</Text>
                                    </View>
                                    {userprofiledata?.isIdVerified === true ?
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 105,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={images.verified} style={{ height: 20, width: 20 }} />
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Verified</Text>
                                            </View>
                                        </View>
                                        :
                                        <View style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 120,
                                            borderRadius: 20,
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            backgroundColor: '#BF850052',
                                            borderColor: '#BF850052'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {/* <Image source={images.verified} style={{ height: 20, width: 20 }} /> */}
                                                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: '#916008', marginLeft: 8, top: 2 }}>Not Verified</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                            </View>
                        </View>
                        {userprofiledata?.publicPhotos?.length > 0 ?
                            <View style={styles.cont6}>
                                <Text style={styles.txt5}>Photos</Text>
                            </View> : null}


                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 16 }}>
                            {userprofiledata?.publicPhotos?.map((photo, index) => (
                                <TouchableOpacity key={index} onPress={() => handleImageClick(index)}>
                                    <View style={{ margin: 5 }}>
                                        <Image
                                            source={{ uri: photo }}
                                            style={{ width: 105, height: 150, borderRadius: 10 }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {userprofiledata?.privatePhotos?.length > 0 ?
                            <View style={styles.cont6}>
                                <Text style={styles.txt5}>Private Photo</Text>
                                {/* <Image source={images.rightarrow} style={styles.arrow} /> */}
                            </View> : null}


                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 16 }}>
                            {userprofiledata?.privatePhotos?.map((photo, index) => (
                                <TouchableOpacity key={index} onPress={() => handleImageClick1(index)}>
                                    <View style={{ margin: 5 }}>
                                        <Image
                                            source={{ uri: photo }}
                                            style={{ width: 105, height: 150, borderRadius: 10 }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))}


                            {userprofiledata?.privatePhotosCount > 0 &&
                                // ((userdetails?.gender === 'Female' && userdetails?.preferences?.gender[0] !== 'Female')) &&
                                userprofiledata?.privatePicAccess?.status !== 'Accepted' && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            const status = userprofiledata?.privatePicAccess?.status;

                                            const isEligibleToRequest =
                                                userdetails?.gender === 'Female' &&
                                                userdetails?.preferences?.gender?.[0] !== 'Female';

                                            if (isEligibleToRequest) {
                                                if (status !== 'Pending' && status !== 'Rejected') {
                                                    handlePicRequest(userprofiledata?._id);
                                                } else {
                                                    Toast.show(`You have already ${status} access`, Toast.SHORT);
                                                }
                                            } else {
                                                setIsModalVisible1(true);
                                            }
                                        }}
                                    >

                                        <ImageBackground
                                            source={images.dummy1}
                                            style={{
                                                height: 150,
                                                width: 105,
                                                borderRadius: 10,
                                                marginLeft: 16,
                                                marginTop: 20,
                                            }}
                                            imageStyle={{ borderRadius: 10 }}
                                            blurRadius={30}
                                        >
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontSize: 16,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {userprofiledata?.privatePicAccess?.status || 'Request to Unlock'}
                                                </Text>
                                                <TouchableOpacity style={styles.lockIconContainer}>
                                                    <Image
                                                        source={images.lock}
                                                        style={{
                                                            width: 24,
                                                            height: 24,
                                                            marginTop: 10,
                                                        }}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                )}

                        </View>

                        {userprofiledata?.aboutUsDescription?.length > 0 ?
                            <Text style={styles.about}>About</Text> : null}
                        <Text style={styles.abouttxt}>{userprofiledata?.aboutUsDescription || ''}</Text>

                        {userprofiledata?.preferences?.aboutPartnerDescription && userprofiledata?.preferences?.aboutPartnerDescription?.length > 0 ? (
                            <Text style={styles.about}>What I am Longing For</Text>
                        ) : null}
                        {userprofiledata?.preferences?.aboutPartnerDescription && userprofiledata?.preferences?.aboutPartnerDescription?.length > 0 ? (
                            <Text style={styles.abouttxt}>{userprofiledata?.preferences?.aboutPartnerDescription}</Text>
                        ) : null}


                        <Text style={styles.about}>Hobbies</Text>
                        <View style={styles.bodyTypeContainer}>
                            {userprofiledata?.hobbies?.map((hobby) => (
                                <TouchableOpacity
                                    key={hobby}
                                    style={[
                                        styles.bodyTypeButton,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.bodyTypeText,
                                        ]}
                                    >
                                        {hobby}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {userprofiledata?.ethnicity && userprofiledata?.ethnicity.length !== 0 ? (
                            <View style={styles.cont7}>
                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                    <Image source={images.face} style={styles.face} />
                                    <Text style={styles.txt6}>Ethnicity</Text>
                                </View>
                                <Text style={styles.txt7}>{userprofiledata?.ethnicity}</Text>
                            </View>
                        ) : null}

                        {userprofiledata?.children && userprofiledata?.children.length !== 0 ? (
                            <View style={styles.cont7}>
                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                    <Image source={images.child} style={styles.face} />
                                    <Text style={styles.txt6}>Children</Text>
                                </View>
                                <Text style={styles.txt7}>{userprofiledata?.children}</Text>
                            </View>
                        ) : null}

                        {userprofiledata?.smoke && userprofiledata?.smoke.length !== 0 ? (
                            <View style={styles.cont7}>
                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                    <Image source={images.smoke} style={styles.face} />
                                    <Text style={styles.txt6}>Do you smoke?</Text>
                                </View>
                                <Text style={styles.txt7}>{userprofiledata?.smoke}</Text>
                            </View>
                        ) : null}

                        {userprofiledata?.drink && userprofiledata?.drink.length !== 0 ? (
                            <View style={styles.cont7}>
                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                    <Image source={images.drink} style={styles.face} />
                                    <Text style={styles.txt6}>Do you drink?</Text>
                                </View>
                                <Text style={styles.txt7}>{userprofiledata?.drink}</Text>
                            </View>
                        ) : null}

                        {userprofiledata?.highestEducation && userprofiledata?.highestEducation.length !== 0 ? (
                            <View style={styles.cont7}>
                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                    <Image source={images.education} style={styles.face} />
                                    <Text style={styles.txt6}>Education</Text>
                                </View>
                                <Text style={styles.txt7}>{userprofiledata?.highestEducation || NaN}</Text>
                            </View>
                        ) : null}

                        {userprofiledata?.workField && userprofiledata?.workField?.length !== 0 ? (
                            <View style={styles.cont7}>
                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                    <Image source={images.face} style={styles.face} />
                                    <Text style={styles.txt6}>Occupation</Text>
                                </View>
                                <Text style={styles.txt7}>{userprofiledata?.workField || NaN}</Text>
                            </View>
                        ) : null}

                        {userprofiledata?.netWorthRange && userprofiledata?.netWorthRange?.length !== 0 ? (
                            <View style={[styles.cont7, {}]}>
                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                    <Image source={images.networth} style={styles.face} />
                                    <Text style={styles.txt6}>Net Worth</Text>
                                </View>
                                <Text style={styles.txt7}>
                                    {userprofiledata?.netWorthRange || NaN}
                                </Text>
                            </View>
                        ) : null}

                    </ScrollView>
                    <View style={[styles.contt8, { justifyContent: dashScreen === undefined ? 'center' : 'space-between' }]}>

                        {dashScreen != undefined ?
                            <TouchableOpacity onPress={() => userDisLike(userprofiledata?._id)} style={styles.cont9}>
                                <Image source={images.cross} style={styles.cross} />
                            </TouchableOpacity>
                            : null}


                        {dashScreen != undefined ?
                            <TouchableOpacity onPress={() => hasLiked ? userDisLike(userprofiledata?._id) : userLike(userprofiledata?._id)}>
                                <View style={[styles.cont9, { backgroundColor: '#916008', height: 55, width: 55 }]}>
                                    <Image source={hasLiked ? images.redheart : images.heart} style={[styles.cross, { tintColor: 'white', height: 25, width: 25 }]} />
                                </View>
                            </TouchableOpacity> : null}


                        <TouchableOpacity onPress={() => handleChatPress()} style={styles.cont9}>
                            <Image source={images.chat} style={[styles.cross, { height: 30, width: 30 }]} />
                        </TouchableOpacity>


                    </View>
                </>
            )}
            <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{modalContent.title}</Text>
                    <Text style={styles.modalDescription}>{modalContent.description}</Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.blockButton]}
                            onPress={handleAction}
                        >
                            <Text style={[styles.modalButtonText, styles.blockButtonText]}>
                                {modalContent.action.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {imagesToShow.length > 0 && (
                <Modal visible={isModal} transparent={true} onRequestClose={closeModal} onBackdropPress={closeModal} >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                            <Image style={styles.modalCloseText} source={images.cross} />
                        </TouchableOpacity>
                        {/* <Image source={{ uri: selectedImage }} style={styles.modalImage} /> */}
                        <ImageViewer
                            imageUrls={imagesToShow}
                            index={selectedImageIndex}
                            enableSwipeDown={true}
                            onSwipeDown={closeModal}
                            backgroundColor="rgba(0, 0, 0, 0.8)"
                        />
                    </View>
                </Modal>
            )}

            {imagesToShow1.length > 0 && (
                <Modal visible={isModal1} transparent={true} onRequestClose={closeModal} onBackdropPress={closeModal} >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                            <Image style={styles.modalCloseText} source={images.cross} />
                        </TouchableOpacity>
                        {/* <Image source={{ uri: selectedImage }} style={styles.modalImage} /> */}
                        <ImageViewer
                            imageUrls={imagesToShow1}
                            index={selectedImageIndex1}
                            enableSwipeDown={true}
                            onSwipeDown={closeModal}
                            backgroundColor="rgba(0, 0, 0, 0.8)"
                        />
                    </View>
                </Modal>
            )}

            <RBSheet
                ref={rbSheetRef1}
                height={question1 === 'Other' ? 480 : 450}
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
                    <Text style={{ textAlign: 'center', fontSize: 24, color: "black", fontFamily: GARAMOND.bold, marginTop: 10 }}>Are you sure you want to report this user?</Text>
                    <Text style={{ color: '#3C4043', fontSize: 14, fontFamily: POPPINSRFONTS.regular, textAlign: "center", marginTop: 10 }}>Please provide details about your report. Our team will review it and take appropriate action.</Text>
                    <View style={{ marginTop: 20 }}>
                        {renderDropdownWithInput('select your reason', question1, setQuestion1, answer1, setAnswer1)}
                    </View>
                    {question1 === 'Other' ?
                        <TextInput
                            placeholder="Reason for report "
                            placeholderTextColor='grey'
                            value={otherreason}
                            maxLength={100}
                            onChangeText={setOtherReason}
                            style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', paddingLeft: 20, borderColor: '#DDDDDD', color: 'black', borderRadius: 10, }}

                        />
                        :
                        null}


                    <View style={{ marginTop: question1 !== 'Other' ? 40 : null }}>
                        <TouchableOpacity onPress={() => rbSheetRef1.current.close()} style={{ top: 30, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#DDDDDD', backgroundColor: 'white' }}>
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => userReport(item)} style={{ top: 50, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#916008', backgroundColor: '#916008' }}>
                            <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Report</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>
            <Modal isVisible={isModalVisible1} style={styles.modal}>
                <View style={styles.overlay}>
                    <TouchableOpacity onPress={() => setIsModalVisible1(false)} style={[styles.closeButton, { borderColor: 'white' }]}>
                        <Image source={images.cross} style={[styles.closeIcon, { tintColor: 'white' }]} />
                    </TouchableOpacity>
                    {userprofiledata?.country === 'India' ?
                        <TouchableWithoutFeedback onPress={() => {
                            setIsModalVisible1(false);
                            navigation.navigate('RazorPay');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableWithoutFeedback>
                        :
                        <TouchableWithoutFeedback onPress={() => {
                            setIsModalVisible1(false);
                            navigation.navigate('Paypal');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableWithoutFeedback>}
                </View>
            </Modal>
        </View>
    );
};

export default UserProfileDetails;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        zIndex: 1,
        alignItems: "center",
    },
    iconButton: {
        borderWidth: 1,
        borderRadius: 100,
        justifyContent: "center",
        height: 30,
        width: 30,
        borderColor: "#C4C4C4",
        backgroundColor: "#C4C4C4",
        // opacity:3
    },
    icon: {
        height: 14,
        width: 8,
        alignSelf: "center",
    },
    dotsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#C4C4C4",
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: "#916008",
        width: 10,
        height: 10,
    },
    imageWrapper: {
        height: 520, // Matches the image height
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: "hidden",
    },
    imageContainer: {
        width: width,
        height: 520,
        position: "relative",
    },
    img: {
        width: "100%",
        height: "100%",
    },
    overlayContent: {
        position: "absolute",
        bottom: 15,
        left: 20,
        right: 20,
        padding: 10,
        borderRadius: 10,
        zIndex: 2
    },
    contentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginTop: 20,
    },
    cont1: {
        borderWidth: 1,
        height: 20,
        width: 55,
        borderColor: "#34A853",
        backgroundColor: "#34A853",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    onlineText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    nameText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#3C4043",
    },
    locationText: {
        fontSize: 14,
        color: "#7A7A7A",
    },
    cont2: {
        borderWidth: 1,
        height: 22,
        width: 80,
        borderColor: '#5E3E05',
        backgroundColor: "#5E3E05",
        borderRadius: 20,
        justifyContent: 'center',

    },
    txt: {
        textAlign: 'center',
        color: '#F2D28C'
    },
    txt1: {
        color: '#302E2E',
        // marginLeft: 16,
        fontSize: 35,
        fontFamily: GARAMOND.bold
    },
    img1: {
        height: 20,
        width: 20,
        marginTop: 3,
        marginLeft: 5
    },
    cont3: {
        flexDirection: 'row',
        marginTop: 20,
    },
    txt2: {
        color: '#7A7A7A',
        fontSize: 14,
        fontFamily: POPPINSRFONTS.semibold,
        // marginLeft: 16,
        marginTop: 10
    },
    cont4: {
        borderWidth: 1,
        borderColor: '#D9D9D9',
        backgroundColor: 'white',
        height: 190,
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
        borderRadius: 9
    },
    cont5: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 16,
        marginRight: 16,
        marginTop: 10
    },
    icon1: {
        height: 21,
        width: 21,
        top: 2
    },
    txt3: {
        color: 'black',
        fontSize: 20,
        fontFamily: PLAYFAIRFONTS.semibold,
        marginLeft: 12
    },
    txt4: {
        fontFamily: POPPINSRFONTS.regular,
        fontSize: 16,
        color: '#7A7A7A'
    },
    cont6: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 16,
        marginRight: 16,
        marginTop: 20
    },
    txt5: {
        color: 'black',
        fontFamily: PLAYFAIRFONTS.bold,
        fontSize: 30
    },
    arrow: {
        height: 20,
        width: 20
    },
    about: {
        marginLeft: 16,
        color: 'black',
        fontSize: 30,
        fontFamily: PLAYFAIRFONTS.bold,
        marginTop: 20
    },
    abouttxt: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginLeft: 16,
        color: 'black',
        marginTop: 10,
        marginRight: 16

    },
    bodyTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
        marginLeft: 5,
        marginRight: 5
    },
    bodyTypeButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        margin: 5,
        backgroundColor: '#FFF',
    },
    selectedBodyTypeButton: {
        backgroundColor: '#5F3D23',
        borderColor: '#5F3D23',
    },
    bodyTypeText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#3C4043',
    },
    selectedBodyTypeText: {
        color: '#FFF',
        fontFamily: 'Poppins-Bold',
    },
    cont7: {
        height: 70,
        width: '90%',
        borderWidth: 1,
        alignSelf: 'center',
        marginTop: 20,
        borderRadius: 9,
        borderColor: '#DADCE0',

    },
    face: {
        height: 25,
        width: 25,

    },
    txt6: {
        color: 'black',
        fontFamily: PLAYFAIRFONTS.bold,
        fontSize: 20,
        marginLeft: 12
    },
    txt7: {
        color: '#7A7A7A',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginLeft: 50,
        marginTop: 8,

    },
    contt8: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 0,  // Sticks the container to the bottom of the screen
        left: 0,
        right: 0,
        paddingHorizontal: 40,  // Optional: Adds space from the edges
        paddingVertical: 10,  // Optional: Adds some space inside the container
        backgroundColor: 'white',  // White background for the container
        borderTopLeftRadius: 20,  // Rounded top corners
        borderTopRightRadius: 20,  // Rounded top corners
        zIndex: 1,  // Ensure it's on top of other content,

    },

    cont9: {
        borderWidth: 1,
        height: 48,
        width: 48,
        borderRadius: 100,
        borderColor: '#DADADA',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',  // White background for each button
    },
    cross: {
        height: 15,
        width: 15,
        alignSelf: 'center',
        tintColor: '#916008'
    },
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        height: 350,
        width: "90%",
        alignSelf: "center",
    },
    modalTitle: {
        fontFamily: "Poppins-Medium",
        fontSize: 24,
        color: "black",
        textAlign: "center",
    },
    modalDescription: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#3C4043",
        textAlign: "center",
        marginVertical: 20,
    },
    modalButtonContainer: {
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
    },
    modalButton: {
        height: 47,
        width: "80%",
        borderWidth: 1,
        borderColor: "#E0E2E9",
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
        marginVertical: 5,
    },
    modalButtonText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: "#3C4043",
    },
    blockButton: {
        backgroundColor: "#916008",
        borderColor: "#916008",
    },
    blockButtonText: {
        color: "white",
    },
    modalOverlay: {
        height: '110%',
        width: '130%',
        alignSelf: 'center',
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Full-screen dark background
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
    dropdownContainer: {
        marginBottom: 10,

    },
    dropdown: {
        height: 50,
        width: '90%',
        borderColor: '#DDDDDD',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        alignSelf: 'center'
    },
    dropdownBox: {
        borderRadius: 10,
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'grey',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: 'black',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    overlay: {
        // flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        margin: 0,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
        borderWidth: 1,
        height: 30,
        width: 30,
        justifyContent: 'center',
        borderRadius: 100
    },
    closeIcon: {
        height: 17,
        width: 17,
        alignSelf: 'center'
    },



});
