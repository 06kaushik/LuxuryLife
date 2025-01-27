import React, { useState, useRef, useEffect } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Image,
    ImageBackground
} from "react-native";
import FastImage from "react-native-fast-image";
import images from "./images";
import RBSheet from "react-native-raw-bottom-sheet";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from "moment";
import Toast from 'react-native-simple-toast'

const { width } = Dimensions.get("window");

const UserProfileDetails = ({ navigation, route }) => {

    const { item } = route.params
    console.log('response from', item);


    const [activeIndex, setActiveIndex] = useState(0);
    const [seek, setSeek] = useState(null)
    const [userhobbies, setUserHobbies] = useState([])
    const [isModalVisible, setModalVisible] = useState(false);
    const [userdetails, setUserDetails] = useState(null)
    const [modalContent, setModalContent] = useState({ title: "", description: "", action: "" });
    const rbSheetRef = useRef();
    const seeking = ['Discretion', 'Flexible Schedule', 'Friends', 'No Strings Attached']
    const getHobbies = ['Travel', 'Sport', 'Cinema', 'Cooking', 'Adventure']




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
            console.log('response from the like button', resp.data);
            getUserFilteredData()

        } catch (error) {
            console.log('error from the like ', error);
        }
    }

    const userDisLike = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: "UNLIKE"
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the DISLIKE button', resp.data);
            navigation.goBack('')
            Toast.show('User Blocked Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the DISLIKE ', error);
        }
    }
    const hasLiked = item.activity_logs.some(log => log.action === "LIKE" && log.userId === userdetails?._id);

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
            Toast.show('User Blocked Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the hide ', error);
        }
    }

    const userReport = async (id) => {
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
            console.log('response from the report button', resp.data);
            navigation.goBack('')
            Toast.show('User Blocked Succuessfully', Toast.SHORT)
        } catch (error) {
            console.log('error from the report ', error);
        }
    }

    const requestPrivatePhoto = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: userdetails?._id,
            userId: id
        }
        try {
            const resp = await axios.post('home/request-private-pic-access', body, { headers })
            console.log('response from the request photo', resp.data);
        } catch (error) {
            console.log('error from the request photo', error?.response?.data?.message);


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
                        "Hiding a member cannot be reversed",
                    action: "Hide",
                });
                break;
            case "Block":
                setModalContent({
                    title: "Are you sure you want to Block this member?",
                    description:
                        "Blocking a member cannot be reversed. Did you want to hide this member instead?",
                    action: "Block",
                });
                break;
            case "Report":
                setModalContent({
                    title: "Are you sure you want to Report this member?",
                    description:
                        "Hiding a member cannot be reversed",
                    action: "Report",
                });
                break;
            default:
                break;
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleAction = () => {

        if (modalContent.action === "Block") {
            userBlock(item?.userId);
        }
        if (modalContent.action === "Hide") {
            userHide(item?.userId);
        }
        if (modalContent.action === "Report") {
            userReport(item?.userId);
        }
        closeModal();
    };

    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setActiveIndex(index);
    };

    return (
        <View style={styles.main}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <FastImage source={images.back} style={styles.icon} />
                </TouchableOpacity>
                <View style={styles.dotsContainer}>
                    {item.publicPhotos.map((_, index) => (
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
                            <TouchableOpacity onPress={() => openModal("Report")}>
                                <Text style={{ color: '#3C4043', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-SemiBold', margin: 10 }}>Report</Text>
                            </TouchableOpacity>
                        </View>


                    </RBSheet>
                </TouchableOpacity>
            </View>

            {/* Image Carousel */}
            <View style={styles.imageWrapper}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                >
                    {item.publicPhotos.map((item, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <FastImage
                                source={{ uri: item }}
                                style={styles.img}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
            <ScrollView>
                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <View style={styles.cont1}>
                        <Text style={styles.onlineText}>Online</Text>
                    </View>
                    <View style={styles.cont2}>
                        <Text style={styles.txt}>PREMIUM</Text>
                    </View>
                </View>
                <View style={styles.cont3}>
                    <Text style={styles.txt1}>{item?.userName || NaN}, {item?.age || NaN} </Text>
                    <Image source={item?.isIdVerified === false ? null : images.verified} style={styles.img1} />
                </View>
                <Text style={styles.txt2}>{item?.city || NaN}, {item?.country || NaN}</Text>
                <Text style={[styles.txt2, { color: 'black', fontSize: 16, fontFamily: 'Poppins-Medium' }]}>{item?.distance || NaN} miles</Text>
                <Text style={[styles.txt2, { fontFamily: 'Poppins-SemiBold' }]}>{item?.myHeading || NaN}</Text>

                <View style={styles.cont4}>
                    <View style={styles.cont5}>
                        <View style={{ flexDirection: 'row', }}>
                            <Image source={images.star} style={styles.icon1} />
                            <Text style={styles.txt3}>Member Since</Text>
                        </View>
                        <Text style={styles.txt4}>{moment(item?.createdAt)?.fromNow() || NaN}</Text>
                    </View>

                    <View style={styles.cont5}>
                        <View style={{ flexDirection: 'row', }}>
                            <Image source={images.heart} style={styles.icon1} />
                            <Text style={styles.txt3}>Relationship status</Text>
                        </View>
                        <Text style={styles.txt4}>{item?.currentRelationshipStatus || NaN}</Text>
                    </View>

                    <View style={styles.cont5}>
                        <View style={{ flexDirection: 'row', }}>
                            <Image source={images.body} style={styles.icon1} />
                            <Text style={styles.txt3}>Body</Text>
                        </View>
                        <Text style={styles.txt4}>{item?.bodyType || NaN}</Text>
                    </View>

                    <View style={styles.cont5}>
                        <View style={{ flexDirection: 'row', }}>
                            <Image source={images.height} style={styles.icon1} />
                            <Text style={styles.txt3}>Height</Text>
                        </View>
                        <Text style={styles.txt4}>{Math.round(item?.tall?.cm) || 'NaN'} cm</Text>
                    </View>
                </View>

                <View style={styles.cont6}>
                    <Text style={styles.txt5}>Photos</Text>
                    {/* <Image source={images.rightarrow} style={styles.arrow} /> */}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 16 }}>
                    {item.publicPhotos.map((photo, index) => (
                        <View key={index} style={{ margin: 5 }}>
                            <Image
                                source={{ uri: photo }}
                                style={{ width: 105, height: 150, borderRadius: 10 }}
                            />
                        </View>
                    ))}
                </View>

                <View style={styles.cont6}>
                    <Text style={styles.txt5}>Private Photo</Text>
                    {/* <Image source={images.rightarrow} style={styles.arrow} /> */}
                </View>
                <TouchableOpacity onPress={() => requestPrivatePhoto(item?.userId)}>
                    <ImageBackground
                        source={images.dummy1}
                        style={{ height: 150, width: 105, borderRadius: 10, marginLeft: 8, top: 5, marginLeft: 16 }}
                        imageStyle={{ borderRadius: 10 }}
                        blurRadius={30}
                    >
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 10,
                        }}>
                            <Text style={{
                                color: 'white',
                                fontSize: 16,
                                textAlign: 'center',
                            }}>Request to Unlock</Text>
                            <TouchableOpacity style={styles.lockIconContainer}>
                                <Image
                                    source={images.lock}
                                    style={{
                                        width: 24,
                                        height: 24, marginTop: 10
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                    </ImageBackground>
                </TouchableOpacity>
                <Text style={styles.about}>About</Text>
                <Text style={styles.abouttxt}>{item?.aboutUsDescription || NaN}</Text>

                <Text style={styles.about}>What I am Seeking</Text>
                <Text style={styles.abouttxt}>{item?.preferences?.aboutPartnerDescription || NaN}</Text>

                <Text style={styles.about}>Hobbies</Text>
                <View style={styles.bodyTypeContainer}>
                    {item?.hobbies?.map((hobby) => (
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
                <View style={styles.cont7}>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                        <Image source={images.face} style={styles.face} />
                        <Text style={styles.txt6}>Ethnicity</Text>
                    </View>
                    <Text style={styles.txt7}>{item?.ethnicity || NaN}</Text>
                </View>

                <View style={styles.cont7}>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                        <Image source={images.child} style={styles.face} />
                        <Text style={styles.txt6}>Children</Text>
                    </View>
                    <Text style={styles.txt7}>{item?.children}</Text>
                </View>

                <View style={styles.cont7}>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                        <Image source={images.smoke} style={styles.face} />
                        <Text style={styles.txt6}>Do you smoke?</Text>
                    </View>
                    <Text style={styles.txt7}>{item?.smoke || NaN}</Text>
                </View>

                <View style={styles.cont7}>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                        <Image source={images.drink} style={styles.face} />
                        <Text style={styles.txt6}>Do you drink?</Text>
                    </View>
                    <Text style={styles.txt7}>{item?.drink || NaN}</Text>
                </View>

                <View style={styles.cont7}>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                        <Image source={images.education} style={styles.face} />
                        <Text style={styles.txt6}>Education</Text>
                    </View>
                    <Text style={styles.txt7}>{item?.highestEducation || NaN}</Text>
                </View>

                <View style={styles.cont7}>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                        <Image source={images.face} style={styles.face} />
                        <Text style={styles.txt6}>Occupation</Text>
                    </View>
                    <Text style={styles.txt7}>{item?.workField || NaN}</Text>
                </View>


                <View style={styles.cont7}>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                        <Image source={images.networth} style={styles.face} />
                        <Text style={styles.txt6}>Net Worth</Text>
                    </View>
                    <Text style={styles.txt7}>{item?.netWorthRange || NaN}</Text>
                </View>

                <View style={styles.contt8}>
                    <View style={styles.cont9}>
                        <Image source={images.cross} style={styles.cross} />
                    </View>

                    <TouchableOpacity onPress={() => hasLiked ? userDisLike(item?.userId) : userLike(item?.userId)}>
                        <View style={[styles.cont9, { backgroundColor: '#916008', height: 55, width: 55 }]}>
                            <Image source={hasLiked ? images.redheart : images.heart} style={[styles.cross, { tintColor: 'white', height: 25, width: 25 }]} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.cont9}>
                        <Image source={images.chat} style={[styles.cross, { height: 20, width: 20 }]} />
                    </View>
                </View>
            </ScrollView>
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
        height: 326, // Matches the image height
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: "hidden",
    },
    imageContainer: {
        width: width,
        height: 326,
    },
    img: {
        width: "100%",
        height: "100%",
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
        justifyContent: 'center'
    },
    txt: {
        textAlign: 'center',
        color: '#F2D28C'
    },
    txt1: {
        color: '#302E2E',
        marginLeft: 16,
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold'
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
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        marginLeft: 16,
        marginTop: 10
    },
    cont4: {
        borderWidth: 1,
        borderColor: '#D9D9D9',
        backgroundColor: 'white',
        height: 150,
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
        fontSize: 15,
        fontFamily: 'Poppins-Medium',
        marginLeft: 12
    },
    txt4: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
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
        fontFamily: 'Poppins-Bold',
        fontSize: 20
    },
    arrow: {
        height: 20,
        width: 20
    },
    about: {
        marginLeft: 16,
        color: 'black',
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        marginTop: 20
    },
    abouttxt: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginLeft: 16,
        color: 'black',
    },
    bodyTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
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
        height: 20,
        width: 20,

    },
    txt6: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        marginLeft: 12
    },
    txt7: {
        color: '#7A7A7A',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginLeft: 16,
        marginTop: 5
    },
    contt8: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        margin: 60
    },
    cont9: {
        borderWidth: 1,
        height: 48,
        width: 48,
        borderRadius: 100,
        borderColor: '#DADADA',
        justifyContent: 'center'
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



});
