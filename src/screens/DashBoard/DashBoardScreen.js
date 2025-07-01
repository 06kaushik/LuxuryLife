import React, { useEffect, useRef, useState, useContext } from "react";
import {
    View,
    Text,
    Animated,
    PanResponder,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    ImageBackground,
    AppState,
    BackHandler,

} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import images from "../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from 'moment';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import LaodingScreen from "../../components/LoadingScreen";
import Toast from 'react-native-simple-toast'
import FastImage from 'react-native-fast-image';
import useSocket from "../../socket/SocketMain";
import Modal from 'react-native-modal';
import { useNotifications } from "../../components/NotificationContext";
import { useSocketProvider } from "../../components/SocketContext";
import SearchingScreen from "../../components/SearchingScreen";
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from "../../components/GlobalStyle";
import { AuthContext } from "../../components/AuthProvider";
import { UserContext } from "../../components/UserContext";

const { width, height } = Dimensions.get("window");


const DashBoardScreen = ({ navigation, route }) => {

    const scrollY = useRef(new Animated.Value(0)).current;
    const [userData, setUserData] = useState([])
    const { userdetails, setUserDetails } = useContext(UserContext);
    const { userprofiledata, setUserProfileData } = useContext(UserContext);
    const [filterdata, setFilterData] = useState(null)
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const isFocused = useIsFocused()
    const positions = useRef([]).current;
    const [swipedCount, setSwipedCount] = useState(0);
    const [appState, setAppState] = useState(AppState.currentState);
    const [privatepicrequest, setPrivatePicRequest] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
    const [backPressed, setBackPressed] = useState(false)
    const { updateMessageCount, updateProfileViewCount } = useNotifications();
    const { emit, on, removeListener, once } = useSocket(onSocketConnect);
    const dashScreen = 'dashboard'
    const [loading, setLoading] = useState(true);
    const [likesetting, setManageLikeSetting] = useState()
    const [isDataFetched, setIsDataFetched] = useState(false);
    const { logout } = useContext(AuthContext);


    const onSocketConnect = () => { };

    useEffect(() => {
        getUserFilteredData()
    }, [userdetails])

    useEffect(() => {
        const handleNotificationResponse = (resp) => {
            if (resp?.notification?.type === 'MESSAGE' || resp?.notification?.type === 'PIC_REQUEST') {
                updateMessageCount(prevCount => prevCount + 1);
            } else if (resp?.notification?.type === 'PROFILE_VIEW' || resp?.notification?.type === 'PROFILE_LIKE') {
                updateProfileViewCount(prevCount => prevCount + 1);
            }
        };
        // Listen for notificationResponse events
        on('notificationResponse', handleNotificationResponse);

        // Cleanup function to remove the listener
        return () => {
            removeListener('notificationResponse', handleNotificationResponse);
        };
    }, [emit, on]);

    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                if (backPressed) {
                    BackHandler.exitApp()
                } else {
                    setBackPressed(true);
                    Toast.show('Press back again to exit', Toast.SHORT);
                    setTimeout(() => {
                        setBackPressed(false);
                    }, 2000);
                    return true;
                }
            };

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction
            );

            return () => backHandler.remove();
        }, [backPressed])
    );

    useEffect(() => {
        if (userdetails?.profileCompletion < 100) {
            setIsModalVisible(true);
        }
    }, [userdetails]);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await getUserFilteredData(); // Make API call with fresh filter
            setIsLoading(false);
        };

        // Fetch either on focus or if refresh flag was passed
        if (isFocused || route.params?.refreshDashboard) {
            fetchData();
        }
    }, [isFocused, route.params?.refreshDashboard]);


    useEffect(() => {
        if (route.params?.refreshDashboard) {
            navigation.setParams({ refreshDashboard: false });
        }
    }, [route.params?.refreshDashboard]);


    useEffect(() => {
        const checkIfFirstTimeUser = async () => {
            const demoSeen = await AsyncStorage.getItem('demoSeen');
            if (!demoSeen) {
                setIsFirstTimeUser(true);
            }
        };

        checkIfFirstTimeUser();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            setAppState(nextAppState);
        });
        return () => {
            subscription.remove();
        };
    }, []);

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
        const getUserProfileData = async () => {
            const token = await AsyncStorage.getItem("authToken");
            const headers = {
                Authorization: token,
            };
            try {
                const resp = await axios.get(`auth/user-profile`, { headers });
                setUserProfileData(resp?.data?.data);
            } catch (error) {
                console.log("error from the user profile", error.response.data.message);
            }
        };
        getUserProfileData()
    }, [])



    useEffect(() => {
        if (userData.length > 0) {
            positions.length = userData.length;
            for (let i = 0; i < userData.length; i++) {
                if (!positions[i]) {
                    positions[i] = new Animated.ValueXY({ x: 0, y: 0 });
                }
            }
        }
    }, [userData]);

    useEffect(() => {
        getdatafromAsync();
    }, [userdetails]);

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
            //('response from account settings in userdetails', resp.data);
            const parsedSettings = resp?.data?.data;
            const settings = parsedSettings?.privacyAndSecuritySetting;
            setManageLikeSetting(settings?.privacySettings?.favorites)
        } catch (error) {
            //('error from account settings in userdetails',error.response?.data?.message || error.message);
        }
    };


    const handleSwipeGuideComplete = async () => {
        await AsyncStorage.setItem('demoSeen', 'true');
        setIsFirstTimeUser(false);
    };

    const getdatafromAsync = async () => {
        try {
            const resp = await AsyncStorage.getItem('dashboardDatafilter')
            // //('reposnse from the async', JSON.parse(resp));
            if (resp) {
                const parseData = JSON.parse(resp)
                setFilterData(parseData)
                setIsLoading(true)
                getUserFilteredData()
                setIsLoading(false)
            }
        } catch (error) {
            //('error from the async dash data', error);
        }
    }


    useEffect(() => {
        if (currentPage > 0) {
            getUserFilteredData();
        }
    }, [currentPage]);

    const getUserFilteredData = async () => {

        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };

        let body = {
            where: {
                filterName: '',
                userNameSearchText: "",
                currentCity: filterdata?.where?.currentCity || '',
                otherLocation: filterdata?.where?.otherLocation || '',
                maxDistance: filterdata?.where?.maxDistance || 100,
                location: {
                    latitude: filterdata?.where?.location?.latitude || userdetails?.location?.coordinates[1],
                    longitude: filterdata?.where?.location?.longitude || userdetails?.location?.coordinates[0],
                    city: filterdata?.where?.location?.city || ''
                },
                options: filterdata?.where?.options || {},
                memberSeeking: filterdata?.where?.memberSeeking || [],
                hobbies: filterdata?.where?.hobbies || [],
                bodyType: filterdata?.where?.bodyType || [],
                verification: filterdata?.where?.verification || [],
                ethnicity: filterdata?.where?.ethnicity || [],
                tall: {
                    min: filterdata?.where?.tall?.min || 152,
                    max: filterdata?.where?.tall?.max || 182,
                },
                smoking: filterdata?.where?.smoking || [],
                drinking: filterdata?.where?.drinking || [],
                relationshipStatus: filterdata?.where?.relationshipStatus || [],
                children: filterdata?.where?.children || [],
                education: filterdata?.where?.education || [],
                workField: filterdata?.where?.workField || [],
                levels: filterdata?.where?.levels || [],
                languages: filterdata?.where?.languages || [],
                profileText: filterdata?.where?.profileText || "",
                ageRange: {
                    min: filterdata?.where?.ageRange?.min || userdetails?.preferences?.ageRange?.min || 18,
                    max: filterdata?.where?.ageRange?.max || userdetails?.preferences?.ageRange?.max || 40,
                },
                gender: filterdata?.where?.gender || userdetails?.preferences?.gender || ['Female'],
            },
            requestType: "mobile",
            pageLength: 15,
            currentPage,
            autopopulate: true,
            requestSource: 'dashboard'
        };
        // console.log('body of search in preference', body);
        // setIsLoading(true);
        try {
            const resp = await axios.post('home/search', body, { headers });
            console.log('user dataaaaa', resp?.data?.data.length);
            const newData = resp?.data?.data;
            if (userData.length > 0) {
                // Filter out duplicates based on unique _id
                const filteredData = newData.filter(item =>
                    !userData.some(existingItem => existingItem?._id === item?._id)
                );

                // Append the filtered data
                setUserData(prevData => [...prevData, ...filteredData]);
            } else {
                // If no data is loaded yet, just set the new data
                setUserData(newData);
            }

            // Set flags to indicate data has been fetched and stop loading
            setIsDataFetched(true);
            setIsLoading(false); // Stop loading after data is fetched

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error("Error fetching data:", errorMessage);

            if (errorMessage === "You are not authorized!") {
                logout()

            }

            setIsLoading(false);
            setUserData([]);  // Clear previous data if there's an error
        }

    };


    const panResponder = (index, id) => PanResponder.create({
        onMoveShouldSetPanResponder: (event, gesture) => Math.abs(gesture.dx) > 10,
        onPanResponderMove: (event, gesture) => {
            positions[index].setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (event, gesture) => {
            if (gesture.dx > 120) {
                // Swipe right
                handleSwipe(index, "right", id);
            } else if (gesture.dx < -120) {
                // Swipe left
                handleSwipe(index, "left", id);
            } else {
                // Reset position if swipe is too small
                Animated.spring(positions[index], {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    const handleSwipe = (index, direction, id) => {
        console.log('index', index);

        Animated.timing(positions[index], {
            toValue: { x: direction === "right" ? width + 100 : -width - 100, y: 0 },
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            // After swipe, remove the card and update the list
            setUserData((prevCards) => prevCards.filter((_, i) => i !== index));

            // Check if the swipe is right (like) or left (dislike)
            if (direction === "right") {
                userLike(id);  // Call userLike when swipe is right
            } else if (direction === "left") {
                userDisLike(id);  // Call userDisLike when swipe is left
            }

            // If the first card is swiped, trigger the loading and page increment
            if (index === 1) {
                setIsLoading(true);  // Set loading state to true
                setCurrentPage((prevPage) => prevPage + 1);  // Increment currentPage to load more data
                // setTimeout(() => {
                //     setIsLoading(false);  // Set loading state back to false after a delay
                // }, 1000);
            }
        });
    };



    const translateX = (index) => {
        const position = positions[index];
        if (position) {
            return position.x;
        }
        return new Animated.Value(0);
    };


    const rotate = (index) => {
        const position = positions[index];
        if (position) {
            return position.x.interpolate({
                inputRange: [-width / 2, 0, width / 2],
                outputRange: ["-15deg", "0deg", "15deg"],
                extrapolate: "clamp",
            });
        }
        return "0deg";
    };

    const imageHeight = scrollY.interpolate({
        inputRange: [0, 663 / 2],
        outputRange: [663, 326],
        extrapolate: "clamp",
    });

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, height / 2],
        outputRange: [1, 0.8],
        extrapolate: "clamp",
    });

    const handleHeartSwipe = (index, id) => {
        if (positions[index]) {
            Animated.timing(positions[index], {
                toValue: { x: width + 100, y: 0 },
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                handleSwipe(index, "right");
                userLike(id)
            });
        }
    };

    const handleCrossSwipe = (index, id) => {
        Animated.timing(positions[index], {
            toValue: { x: -width - 100, y: 0 },
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            handleSwipe(index, "left");
            userDisLike(id)
        });
    };

    const profileDetailsBottom = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [50, -150],
        extrapolate: 'clamp',
    });

    const profileDetailsOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });



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
            //('response from the like button', resp.data);
            if (likesetting !== true) {
                emit('profileActivity', {
                    action: 'like',
                    targetUserId: id,
                    userId: userdetails?._id,
                });
            }
        } catch (error) {
            //('error from the like ', error);
        }
    }

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
            //('response from the Dislike button', resp.data);

        } catch (error) {
            //('error from the like ', error);
        }
    }

    const handleChatPress = async (item) => {
        try {

            emit("checkRoom", {
                users: {
                    participantId: item?.participantId?._id,
                    userId: userdetails?._id
                },
            });
            removeListener('roomResponse');
            once("roomResponse", (response) => {
                const roomId = response?.roomId;
                emit("initialMessages", {
                    userId: userdetails?._id,
                    roomId,
                });
                removeListener('initialMessagesResponse');
                once("initialMessagesResponse", (response) => {
                    const messages = response?.initialMessages || [];
                    navigation.navigate('OneToOneChatNav', { roomId: roomId, initialMessages: messages, userName: item?.userName, profilepic: item?.profilePicture, id: item?.userId });

                });
            });
        } catch (error) {
            //("error from navigation to one-to-one:", error);

        }
    };


    return (
        <View style={{ flex: 1 }}>
            {isFirstTimeUser && (
                <View style={styles.demoOverlay}>
                    <View style={{ flexDirection: 'row', }}>
                        <Image source={images.swipeleft} style={{ height: 70, width: 70, tintColor: 'white', right: 50 }} />
                        <Image source={images.swiperight} style={{ height: 70, width: 70, tintColor: 'white', left: 50 }} />
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <Text style={[styles.demoText, { right: 20 }]}>Swipe left to Dislike</Text>
                        <Text style={[styles.demoText, { left: 20 }]}>Swipe right to Like</Text>
                    </View>
                    <TouchableOpacity style={{ top: 30 }} onPress={handleSwipeGuideComplete}>
                        <Text style={styles.closeButton}>Got it!</Text>
                    </TouchableOpacity>
                </View>
            )}
            {isLoading ? (
                <LaodingScreen />
            ) : !isDataFetched ? (
                <LaodingScreen />
            ) : userData?.length === 0 ? (
                // Show SearchingScreen only after data is fetched and empty
                <SearchingScreen navigation={navigation} />
            ) : (
                <View style={styles.container}>
                    <View style={styles.header}>

                        <View style={{ flexDirection: 'row', left: 40 }}>
                            <Image source={images.dashlogo} style={styles.logo} />
                            <View style={{ borderWidth: 1, left: 10, borderColor: '#916008' }} />
                            <Text style={styles.headerText}>Secure Selective{'\n'}Safe Connections</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("Preference")}>
                            <Image source={images.menu} style={styles.menuIcon} />
                        </TouchableOpacity>
                    </View>
                    {userData
                        .map((item, index) => (
                            <Animated.View
                                key={item._id}
                                style={[
                                    styles.card,
                                    {
                                        transform: [
                                            {
                                                translateX: translateX(index),  // apply translation
                                            },
                                            {
                                                rotate: rotate(index),
                                            },
                                        ],

                                    },
                                ]}
                                {...panResponder(index, item?.userId).panHandlers}
                            >

                                <TouchableOpacity style={{}} activeOpacity={1} onPress={() => {

                                    navigation.navigate("UserProfileDetails", { item: item?.userId, dashScreen });
                                }}>
                                    <LinearGradient
                                        colors={
                                            item?.subscriptionType && item?.subscriptionType === 'Gold' ?
                                                ['#BF8500', '#604300', '#F2D28C', '#6A513E'] :
                                                item?.subscriptionType && item?.subscriptionType === 'Luxury' ?
                                                    ['#FF4A4A', '#B53535'] :
                                                    ['transparent', 'transparent']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            padding: 5,
                                            borderRadius: 15,
                                        }}
                                    >
                                        <Animated.Image
                                            source={{ uri: item?.profilePicture }}
                                            style={[styles.image, {
                                                height: imageHeight,
                                                opacity: imageOpacity,
                                                // borderRadius: 12,
                                            }]}
                                            resizeMode="cover"
                                        />
                                        {item?.subscriptionType && item?.subscriptionType?.length !== 0 ? (
                                            <LinearGradient
                                                colors={['#BF8500', '#593E00']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 30,
                                                    left: 20,
                                                    borderRadius: 100,
                                                    height: 30,
                                                    width: 100,
                                                    justifyContent: 'center'


                                                }}
                                            >
                                                <Text style={{ color: '#F2D28C', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                                                    {item?.subscriptionType}
                                                </Text>
                                            </LinearGradient>
                                        ) : null}
                                        {item?.publicPhotos?.length > 0 && (
                                            <View
                                                style={{
                                                    borderWidth: 1,
                                                    position: 'absolute',
                                                    top: 30,
                                                    right: 20,
                                                    height: 30,
                                                    width: 30,
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    borderColor: 'rgba(0,0,0,0.7)',
                                                    borderRadius: 100,
                                                    justifyContent: 'center'
                                                }}
                                            >

                                                <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                                    <Image source={images.gallery} style={{ height: 10, width: 10, tintColor: 'grey', alignSelf: 'center', }} />
                                                    <Text style={{ color: 'grey', fontSize: 10, textAlign: 'center', left: 2, bottom: 0.5 }}>{item?.publicPhotos?.length}</Text>
                                                </View>

                                            </View>
                                        )}
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={["transparent", "rgba(0,0,0,2)", "rgba(0,0,0,2)"]}
                                        locations={[0.1, 0.6, 1]}
                                        style={styles.gradient}
                                    >
                                    </LinearGradient>
                                </TouchableOpacity>

                                <Animated.View style={{
                                    position: "absolute",
                                    bottom: profileDetailsBottom,
                                    opacity: profileDetailsOpacity,
                                    width: "100%"
                                }}>

                                    <View style={{ bottom: 30, left: 16 }}>
                                        {item?.isOnline === true ?
                                            <View style={styles.onlineBadge}>
                                                <Text style={styles.onlineText1}>Online</Text>
                                            </View>
                                            :
                                            <View style={[styles.onlineBadge, { backgroundColor: 'red', borderColor: 'red' }]}>
                                                <Text style={styles.onlineText1}>Offline</Text>
                                            </View>
                                        }

                                        <Text style={styles.cardName}>{item.userName.charAt(0).toUpperCase() + item?.userName.slice(1)}, {item.age}</Text>
                                        <Text style={styles.cardLocation}>{item.city}, {item?.country}</Text>
                                        <Text style={styles.cardDistance}>{item.distance === 0 ? 1 : item?.distance} mile away</Text>
                                        <View style={{ flexDirection: 'row', top: 30 }}>
                                            {item?.isLinkedinVerified ?
                                                <Image source={images.l} style={{ height: 23, width: 23, margin: 3 }} /> : null}
                                            {item?.isInstagramVerified ?
                                                <Image source={images.i} style={{ height: 23, width: 23, margin: 3 }} /> : null}
                                            {item?.isFacebookVerified ?
                                                <Image source={images.f} style={{ height: 23, width: 23, margin: 3 }} /> : null}
                                            {item?.isTwitterVerified ?
                                                <Image source={images.x} style={{ height: 23, width: 23, margin: 3 }} /> : null}
                                            {item?.isIdVerified ?
                                                <Image source={images.s} style={{ height: 23, width: 23, margin: 3 }} /> : null}
                                            {item?.isProfileVerified ?
                                                <Image source={images.sv} style={{ height: 23, width: 23, margin: 3 }} /> : null}
                                        </View>
                                    </View>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={[styles.circleButton, { marginTop: 10 }]} onPress={() => handleCrossSwipe(index, item?.userId)}>
                                            <Image source={images.cross} style={[styles.buttonIcon, { height: 20, width: 20 }]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleHeartSwipe(index, item?.userId)} style={[styles.circleButton, styles.heartButton]}>
                                            <Image source={images.heart} style={[styles.buttonIcon, { tintColor: 'white', height: 40, width: 40 }]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.circleButton, { marginTop: 10 }]} onPress={() => handleChatPress(item)}>
                                            <Image source={images.chat} style={[styles.buttonIcon, { height: 30, width: 30 }]} />
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </Animated.View>
                        ))}
                </View>
            )}
        </View>
    );
};

export default DashBoardScreen;



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
        // elevation: 4,
    },
    logo: {
        width: 100,
        height: 48,
        top: 10,
    },
    headerText: {
        fontSize: 20,
        fontFamily: PLAYFAIRFONTS.medium,
        color: "#916008",
        left: 20

    },
    menuIcon: {
        width: 24,
        height: 24,
    },
    card: {
        width: "100%",
        height: '85%',
        position: "absolute",
        bottom: 0,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        backgroundColor: "white",
        overflow: "hidden",
    },

    image: {
        width: "100%",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,


    },
    gradient: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "40%",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        paddingBottom: 20,
        // marginBottom: 1500
    },

    overlayContent: {
        position: "absolute",
        bottom: 200,
        left: 16,
    },

    onlineBadge: {
        borderWidth: 1,
        height: 19,
        width: 55,
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        borderRadius: 20,
        justifyContent: 'center',
        // bottom: 10

    },
    onlineText1: {
        textAlign: 'center',
        color: 'white',
        fontSize: 10,
        fontFamily: 'Poppins-Bold',
        top: 1
    },
    cardName: {
        color: "white",
        fontSize: 38,
        top: 5,
        fontFamily: GARAMOND.bold
    },
    cardLocation: {
        color: "white",
        fontSize: 16,
        opacity: 0.8,
        top: 10,
        fontFamily: POPPINSRFONTS.regular
    },

    cardDistance: {
        color: "white",
        fontSize: 16,
        opacity: 0.8,
        top: 15
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        backgroundColor: "white",
        marginTop: 1
    },
    details: {
        padding: 16,
        backgroundColor: "white",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    detailsHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    detailsText: {
        fontSize: 16,
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        top: 20
        // position: "absolute",
        // bottom: 20,
        // width: "100%",
    },
    circleButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
    },
    heartButton: {
        backgroundColor: "#916008",
        width: 70,
        height: 70,
        borderRadius: 100
    },
    buttonIcon: {
        width: 15,
        height: 15,
        tintColor: '#5C4033'
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    progressText: {
        fontSize: 20,
        color: '#DAA520',
    },
    completionText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#DAA520',
        marginTop: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
        color: 'black',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        color: '#C4C4C4',
    },
    listContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DAA520',
    },
    listItem: {
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'center',
    },
    listItemText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 10,
    },
    button: {
        backgroundColor: '#DAA520',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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
    demoText: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',

    },
    closeButton: {
        fontSize: 18,
        color: 'white',
        padding: 10,
        backgroundColor: '#5E3E05',
        borderRadius: 5,
    },
});
