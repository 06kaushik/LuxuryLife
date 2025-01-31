import React, { useEffect, useRef, useState } from "react";
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
    AppState
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import images from "../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import LaodingScreen from "../../components/LoadingScreen";
import Toast from 'react-native-simple-toast'
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get("window");



const DashBoardScreen = ({ navigation }) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [userData, setUserData] = useState([])
    // console.log('userdatalength', userData);
    // const positions = useRef(userData?.map(() => new Animated.ValueXY({ x: 0, y: 0 }))).current;
    const [userdetails, setUserDetails] = useState(null)
    const [filterdata, setFilterData] = useState(null)
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const isFocused = useIsFocused()
    const positions = useRef([]).current;
    const [swipedCount, setSwipedCount] = useState(0);
    const [appState, setAppState] = useState(AppState.currentState);


    useEffect(() => {
        console.log('in the useEfect');

        getdatafromAsync()
        getUserFilteredData();
    }, [isFocused])

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            setAppState(nextAppState);
        });
        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (appState === 'active') {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                getUserFilteredData();
            }, 2000);
        }
    }, [appState, currentPage]);

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
        if (userData.length > 0) {
            positions.length = userData.length;
            for (let i = 0; i < userData.length; i++) {
                if (!positions[i]) {
                    positions[i] = new Animated.ValueXY({ x: 0, y: 0 });
                }
            }
            // console.log("positionsss", positions);
        }
    }, [userData]);

    useEffect(() => {
        getdatafromAsync();
    }, [userdetails]);

    useEffect(() => {
        if (userdetails && userdetails.location && userdetails.location.coordinates) {
            getUserFilteredData();
        }
    }, [userdetails]);


    const getdatafromAsync = async () => {
        try {
            const resp = await AsyncStorage.getItem('dashboardData')
            // console.log('reposnse from the async', resp);
            if (resp) {
                const parseData = JSON.parse(resp)
                setFilterData(parseData)
            }
        } catch (error) {
            console.log('error from the async dash data', error);
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
                userNameSearchText: "",
                currentCity: filterdata?.where?.currentCity || '',
                otherLocation: filterdata?.where?.otherLocation || '',
                maxDistance: filterdata?.where?.maxDistance || 100,
                location: {
                    latitude: filterdata?.where?.location?.latitude || userdetails?.location?.coordinates[1] || 28.6217917,
                    longitude: filterdata?.where?.location?.longitude || userdetails?.location?.coordinates[0] || 77.3748881,
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
                gender: filterdata?.where?.gender || userdetails?.preferences?.gender
            },
            requestType: "mobile",
            pageLength: 11,
            currentPage,
            autopopulate: true,
            requestSource: 'dashboard'
        };
        // console.log('body of search', body);
        setIsLoading(true);
        try {
            const resp = await axios.post('home/search', body, { headers });
            const newData = resp?.data?.data;
            setUserData(newData);
            if (newData.length < body.pageLength) {
                setHasMoreData(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log('error from the search API', error.response?.data?.message || error);
            setIsLoading(false);
        }
    };


    const panResponder = (index) => PanResponder.create({
        onMoveShouldSetPanResponder: (event, gesture) => {
            const isHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy);
            return isHorizontal || Math.abs(gesture.dx) > 10;
        },
        onPanResponderMove: (event, gesture) => {
            if (positions[index]) {
                positions[index]?.setValue({ x: gesture.dx, y: gesture.dy });
            }
        },
        onPanResponderRelease: (event, gesture) => {
            if (positions[index]) {
                if (gesture.dx > 120) {
                    // Swipe right
                    Animated.timing(positions[index], {
                        toValue: { x: width + 100, y: gesture.dy },
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => handleSwipe(index, "right"));
                } else if (gesture.dx < -120) {
                    // Swipe left
                    Animated.timing(positions[index], {
                        toValue: { x: -width - 100, y: gesture.dy },
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => handleSwipe(index, "left"));
                } else {
                    // Reset position if swipe is too small
                    Animated.spring(positions[index], {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                    }).start();
                }
            }
        },
    });

    const handleSwipe = (index, direction) => {
        positions[index].setValue({ x: 0, y: 0 });
        if (index === 0) {
            setIsLoading(true);
            setCurrentPage((prevPage) => prevPage + 1);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
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
            Toast.show('Private Pic Requested', Toast.SHORT)
        } catch (error) {
            console.log('error from the request photo', error?.response?.data?.message);
        }
    }

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
            console.log('response from the like button', resp.data);

        } catch (error) {
            console.log('error from the like ', error);
        }
    }


    return (
        <View style={{ flex: 1 }}>
            {isLoading ? (
                <LaodingScreen />
            ) : (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image source={images.dashlogo} style={styles.logo} />
                        <Text style={styles.headerText}>Just for you</Text>
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
                                                translateX: positions[index] ? positions[index].x : new Animated.Value(0),
                                            },
                                            {
                                                translateY: positions[index] ? positions[index].y : new Animated.Value(0),
                                            },
                                            {
                                                rotate: rotate(index),
                                            },
                                        ]
                                    },
                                ]}
                                {...panResponder(index).panHandlers}
                            >
                                <Animated.ScrollView
                                    style={styles.scrollView}
                                    contentContainerStyle={styles.scrollContent}
                                    onScroll={Animated.event(
                                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                        { useNativeDriver: false }
                                    )}
                                    scrollEventThrottle={16}
                                >
                                    <TouchableOpacity style={{}} onPress={() => {
                                        console.log("Image clicked");
                                        navigation.navigate("UserProfileDetails", { item: item?.userId });
                                    }}>
                                        <Animated.Image
                                            source={{ uri: item?.profilePicture }}
                                            style={[styles.image, {
                                                height: imageHeight,
                                                opacity: imageOpacity,
                                            }]}
                                            resizeMode="cover"
                                        />
                                        <LinearGradient
                                            colors={["transparent", "rgba(0,0,0,2)", "rgba(0,0,0,2)"]}
                                            locations={[0.1, 0.6, 1]}
                                            style={styles.gradient}
                                        >
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <View style={styles.details}>
                                        <View style={styles.contentContainer}>
                                            <View style={styles.cont1}>
                                                <Text style={styles.onlineText}>Online</Text>
                                            </View>
                                            <View style={styles.cont2}>
                                                <Text style={styles.txt}>PREMIUM</Text>
                                            </View>
                                        </View>
                                        <View style={styles.cont3}>
                                            <Text style={styles.txt1}>{item?.userName || 'NaN'}, {item?.age || 'NaN'}</Text>
                                            <Image source={item?.isIdVerified === false ? null : images.verified} style={styles.img1} />
                                        </View>
                                        <Text style={styles.txt2}>{item?.city || 'NaN'}, {item?.country || 'NaN'}</Text>
                                        <Text style={[styles.txt2, { color: 'black', fontSize: 16, fontFamily: 'Poppins-Medium' }]}>{item?.distance || 'NaN'} miles</Text>
                                        <Text style={[styles.txt2, { fontFamily: 'Poppins-SemiBold' }]}>{item?.myHeading || 'NaN'}</Text>

                                        <View style={styles.cont4}>
                                            <View style={styles.cont5}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Image source={images.star} style={styles.icon1} />
                                                    <Text style={styles.txt3}>Member Since</Text>
                                                </View>
                                                <Text style={styles.txt4}>{moment(item?.createdAt)?.fromNow() || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont5}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Image source={images.heart} style={styles.icon1} />
                                                    <Text style={styles.txt3}>Relationship status</Text>
                                                </View>
                                                <Text style={styles.txt4}>{item?.currentRelationshipStatus || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont5}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Image source={images.body} style={styles.icon1} />
                                                    <Text style={styles.txt3}>Body</Text>
                                                </View>
                                                <Text style={styles.txt4}>{item?.bodyType || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont5}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Image source={images.height} style={styles.icon1} />
                                                    <Text style={styles.txt3}>Height</Text>
                                                </View>
                                                <Text style={styles.txt4}>{Math.round(item?.tall?.cm) || 'NaN'} cm</Text>
                                            </View>
                                        </View>

                                        <View style={styles.cont6}>
                                            <Text style={styles.txt5}>Photos</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {item?.publicPhotos?.map((photo, index) => (
                                                photo && (
                                                    <View key={index} style={{ margin: 5 }}>
                                                        <Image
                                                            source={{ uri: photo }}
                                                            style={{ width: 105, height: 150, borderRadius: 10 }}
                                                        />
                                                    </View>
                                                )
                                            ))}
                                        </View>

                                        <View style={styles.cont6}>
                                            <Text style={styles.txt5}>Private Photo</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => requestPrivatePhoto(item?.userId)}>
                                            <ImageBackground
                                                source={images.dummy1}
                                                style={{ height: 150, width: 105, borderRadius: 10, marginLeft: 8, top: 5 }}
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
                                        <Text style={styles.abouttxt}>{item?.aboutUsDescription || 'NaN'}</Text>

                                        <Text style={styles.about}>What I am Seeking</Text>
                                        <Text style={styles.abouttxt}>{item?.preferences?.aboutPartnerDescription || 'NaN'}</Text>

                                        <Text style={styles.about}>Hobbies</Text>
                                        <View style={styles.bodyTypeContainer}>
                                            {item?.hobbies?.map((hobby) => (
                                                <TouchableOpacity key={hobby} style={styles.bodyTypeButton}>
                                                    <Text style={styles.bodyTypeText}>
                                                        {hobby}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <View style={{ marginBottom: 100 }}>
                                            <View style={styles.cont7}>
                                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                    <Image source={images.face} style={styles.face} />
                                                    <Text style={styles.txt6}>Ethnicity</Text>
                                                </View>
                                                <Text style={styles.txt7}>{item?.ethnicity || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont7}>
                                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                    <Image source={images.child} style={styles.face} />
                                                    <Text style={styles.txt6}>Children</Text>
                                                </View>
                                                <Text style={styles.txt7}>{item?.children || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont7}>
                                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                    <Image source={images.smoke} style={styles.face} />
                                                    <Text style={styles.txt6}>Do you smoke?</Text>
                                                </View>
                                                <Text style={styles.txt7}>{item?.smoke || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont7}>
                                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                    <Image source={images.drink} style={styles.face} />
                                                    <Text style={styles.txt6}>Do you drink?</Text>
                                                </View>
                                                <Text style={styles.txt7}>{item?.drink || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont7}>
                                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                    <Image source={images.education} style={styles.face} />
                                                    <Text style={styles.txt6}>Education</Text>
                                                </View>
                                                <Text style={styles.txt7}>{item?.highestEducation || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont7}>
                                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                    <Image source={images.face} style={styles.face} />
                                                    <Text style={styles.txt6}>Occupation</Text>
                                                </View>
                                                <Text style={styles.txt7}>{item?.workField || 'NaN'}</Text>
                                            </View>

                                            <View style={styles.cont7}>
                                                <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                    <Image source={images.networth} style={styles.face} />
                                                    <Text style={styles.txt6}>Net Worth</Text>
                                                </View>
                                                <Text style={styles.txt7}>
                                                    {item?.netWorthRange ? `$${item.netWorthRange.min} - $${item.netWorthRange.max}` : 'NaN'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>


                                </Animated.ScrollView>
                                <Animated.View style={{
                                    position: "absolute",
                                    bottom: profileDetailsBottom,
                                    opacity: profileDetailsOpacity,
                                    width: "100%"
                                }}>
                                    <View style={{ bottom: 30, left: 16 }}>
                                        <View style={styles.onlineBadge}>
                                            <Text style={styles.onlineText1}>Online</Text>
                                        </View>
                                        <Text style={styles.cardName}>{item.userName}, {item.age}</Text>
                                        <Text style={styles.cardLocation}>{item.city}</Text>
                                        <Text style={styles.cardDistance}>{item.distance} miles</Text>
                                    </View>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={[styles.circleButton, { marginTop: 10 }]} onPress={() => handleCrossSwipe(index, item?.userId)}>
                                            <Image source={images.cross} style={styles.buttonIcon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleHeartSwipe(index, item?.userId)} style={[styles.circleButton, styles.heartButton]}>
                                            <Image source={images.heart} style={[styles.buttonIcon, { tintColor: 'white', height: 30, width: 30 }]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.circleButton, { marginTop: 10 }]}>
                                            <Image source={images.chat} style={styles.buttonIcon} />
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
        width: 75,
        height: 35,
        top: 10
    },
    headerText: {
        fontSize: 24,
        fontFamily: "Playfair_9pt-BoldItalic",
        color: "black",
        right: 5
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
        // borderWidth:5,
        // borderColor:'red'
    },

    image: {
        width: "100%",
        // resizeMode:'contain'
    },
    gradient: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "40%",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        paddingBottom: 20,
        marginBottom: 1500
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
        bottom: 10

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
        fontSize: 28,
        fontWeight: "bold",
        top: 5
    },
    cardLocation: {
        color: "white",
        fontSize: 16,
        opacity: 0.8,
        top: 10
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
});
