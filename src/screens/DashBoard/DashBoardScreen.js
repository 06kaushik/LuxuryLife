import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Animated,
    PanResponder,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    TouchableOpacity
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import images from "../../components/images";
import Modal from 'react-native-modal';
import ProgressCircle from 'react-native-progress/Circle';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


const { width, height } = Dimensions.get("window");

const data = [
    {
        id: 1,
        name: "Leilanig",
        age: 19,
        location: "New Delhi, India",
        distance: "800 miles",
        image: require("../../assets/dummy1.png"),
        details:
            "An obedient disciple in search of a young guru! I love exploring new experiences.",
    },
    {
        id: 2,
        name: "John",
        age: 25,
        location: "New York, USA",
        distance: "1200 miles",
        image: require("../../assets/dummy2.png"),
        details: "Tech enthusiast and food lover. Exploring the world, one bite at a time.",
    },
    // Add more profiles as needed
];

const DashBoardScreen = ({ navigation }) => {
    const position = useRef(new Animated.ValueXY()).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const currentIndex = useRef(0);
    const panActive = useRef(false);
    const [seek, setSeek] = useState(null)
    const [userhobbies, setUserHobbies] = useState([])
    const seeking = ['Discretion', 'Flexible Schedule', 'Friends', 'No Strings Attached']
    const getHobbies = ['Travel', 'Sport', 'Cinema', 'Cooking', 'Adventure']
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(50); // Adjust this as per actual progress
    const [userdetails, setUserDetails] = useState(null)
    const [filterdata, setFilterData] = useState(null)



    useEffect(() => {
        getdatafromAsync();
    }, []);

    useEffect(() => {
        if (filterdata) {
            getUserFilteredData();
        }
    }, [filterdata]);

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

    const getUserFilteredData = async () => {
        if (!filterdata) {
            return;
        }
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            where: {
                userNameSearchText: "",
                currentCity: filterdata?.where?.currentCity || '',
                otherLocation: filterdata?.where?.otherLocation || '',
                maxDistance: filterdata?.where?.maxDistance || '',
                location: {
                    latitude: filterdata?.where?.location?.latitude || '',
                    longitude: filterdata?.where?.location?.longitude || '',
                    city: filterdata?.where?.location?.city || ''
                },
                options: filterdata?.where?.options || '',
                memberSeeking: filterdata?.where?.memberSeeking || '',
                hobbies: filterdata?.where?.hobbies || '',
                bodyType: filterdata?.where?.bodyType || '',
                verification: filterdata?.where?.verification || '',
                ethnicity: filterdata?.where?.ethnicity || '',
                height: {
                    min: filterdata?.where?.height?.min || '',
                    max: filterdata?.where?.height?.max || ''
                },
                smoking: filterdata?.where?.smoking || '',
                drinking: filterdata?.where?.drinking || '',
                relationshipStatus: filterdata?.where?.relationshipStatus || '',
                children: filterdata?.where?.children || '',
                education: filterdata?.where?.education || '',
                workField: filterdata?.where?.workField || [],
                levels: filterdata?.where?.levels || '',
                languages: filterdata?.where?.languages || '',
                profileText: filterdata?.where?.profileText || "",
                ageRange: filterdata?.where?.ageRange || {},
                gender: filterdata?.where?.gender || ''
            },
            requestType: "mobile",
            pageLength: 11,
            currentPage,
            autopopulate: true
        };
        setIsLoading(true);
        try {
            const resp = await axios.post('home/search', body, { headers });
            // console.log('response from the search API', resp?.data?.data);
            if (currentPage === 0) {
                setUserData(resp?.data?.data);
            } else {
                setUserData(prevData => [...prevData, ...resp?.data?.data]);
            }
            if (resp?.data?.data?.length < body.pageLength) {
                setHasMoreData(false);
            } else {
                setHasMoreData(true);
            }

            setIsLoading(false);
        } catch (error) {
            console.log('error from the search API', error.response?.data?.message || error);
            setIsLoading(false);
        }
    };





    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const handleSeeking = (type) => {
        setSeek(type);
    };


    const profileDetailsBottom = scrollY.interpolate({
        inputRange: [0, 100],  // Track scrolling from the start
        outputRange: [50, -150],  // Move the profile details up as user scrolls
        extrapolate: 'clamp',  // Ensure the value doesn't go beyond the range
    });

    const profileDetailsOpacity = scrollY.interpolate({
        inputRange: [0, 100],  // Track scrolling from the start
        outputRange: [1, 0],  // Fade out the profile details as user scrolls
        extrapolate: 'clamp',
    });

    const handleHHobbies = (hobby) => {
        if (userhobbies.includes(hobby)) {
            setUserHobbies(userhobbies.filter((item) => item !== hobby));
        } else if (userhobbies.length < 7) {
            setUserHobbies([...userhobbies, hobby]);
        } else {
            Toast.show('You can select upto 7 Hobbies only', Toast.SHORT);
        }
    };

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (event, gesture) => {
            const isHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy);
            if (isHorizontal) {
                panActive.current = true;
            }
            return isHorizontal;
        },
        onPanResponderMove: (event, gesture) => {
            if (panActive.current) {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            }
        },
        onPanResponderRelease: (event, gesture) => {
            if (panActive.current) {
                if (gesture.dx > 120) {
                    // Swipe right
                    Animated.timing(position, {
                        toValue: { x: width + 100, y: gesture.dy },
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        handleSwipe("right");
                    });
                } else if (gesture.dx < -120) {
                    // Swipe left
                    Animated.timing(position, {
                        toValue: { x: -width - 100, y: gesture.dy },
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        handleSwipe("left");
                    });
                } else {
                    // Reset position
                    Animated.spring(position, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                    }).start();
                }
                panActive.current = false;
            }
        },
    });

    const handleSwipe = (direction) => {
        currentIndex.current = (currentIndex.current + 1) % data.length;
        position.setValue({ x: 0, y: 0 });
    };

    const handleHeartSwipe = () => {
        Animated.timing(position, {
            toValue: { x: width + 100, y: 0 },
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            handleSwipe("right");
        });
    };

    const handleCrossSwipe = () => {
        Animated.timing(position, {
            toValue: { x: -width - 100, y: 0 },
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            handleSwipe("left");
        });
    };

    const rotate = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: ["-15deg", "0deg", "15deg"],
        extrapolate: "clamp",
    });

    const imageHeight = scrollY.interpolate({
        inputRange: [0, 663 / 2], // Adjust to half of the card's height
        outputRange: [663, 326], // Adjust to match the card height
        extrapolate: "clamp",
    });


    const imageOpacity = scrollY.interpolate({
        inputRange: [0, height / 2],
        outputRange: [1, 0.8],
        extrapolate: "clamp",
    });

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



    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image source={images.dashlogo} style={styles.logo} />
                <Text style={styles.headerText}>Just for you</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Preference")}>
                    <Image source={images.menu} style={styles.menuIcon} />
                </TouchableOpacity>
            </View>

            {data
                .map((item, index) => {
                    const isCurrent = index === currentIndex.current;
                    return (
                        <Animated.View
                            key={item.id}
                            style={[
                                styles.card,
                                isCurrent && {
                                    transform: [
                                        { translateX: position.x },
                                        { translateY: position.y },
                                        { rotate: rotate },
                                    ],
                                },
                            ]}
                            {...(isCurrent ? panResponder.panHandlers : {})}
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
                                    navigation.navigate("UserProfileDetails");
                                }}>
                                    <Animated.Image
                                        source={item.image}
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
                                        <Text style={styles.txt1}>Leilanig, 19 </Text>
                                        <Image source={images.verified} style={styles.img1} />
                                    </View>
                                    <Text style={styles.txt2}>New Delhi, India</Text>
                                    <Text style={[styles.txt2, { color: 'black', fontSize: 16, fontFamily: 'Poppins-Medium' }]}>800 miles</Text>
                                    <Text style={[styles.txt2, { fontFamily: 'Poppins-SemiBold' }]}>An obedient disciple in search of a young guru!</Text>

                                    <View style={styles.cont4}>
                                        <View style={styles.cont5}>
                                            <View style={{ flexDirection: 'row', }}>
                                                <Image source={images.star} style={styles.icon1} />
                                                <Text style={styles.txt3}>Member Since</Text>
                                            </View>
                                            <Text style={styles.txt4}>2 Years</Text>
                                        </View>

                                        <View style={styles.cont5}>
                                            <View style={{ flexDirection: 'row', }}>
                                                <Image source={images.heart} style={styles.icon1} />
                                                <Text style={styles.txt3}>Relationship status</Text>
                                            </View>
                                            <Text style={styles.txt4}>Single</Text>
                                        </View>

                                        <View style={styles.cont5}>
                                            <View style={{ flexDirection: 'row', }}>
                                                <Image source={images.body} style={styles.icon1} />
                                                <Text style={styles.txt3}>Body</Text>
                                            </View>
                                            <Text style={styles.txt4}>Curvy</Text>
                                        </View>

                                        <View style={styles.cont5}>
                                            <View style={{ flexDirection: 'row', }}>
                                                <Image source={images.height} style={styles.icon1} />
                                                <Text style={styles.txt3}>Height</Text>
                                            </View>
                                            <Text style={styles.txt4}>173 cm</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cont6}>
                                        <Text style={styles.txt5}>Photos</Text>
                                        <Image source={images.rightarrow} style={styles.arrow} />
                                    </View>

                                    <View style={styles.cont6}>
                                        <Text style={styles.txt5}>Private Photo</Text>
                                        <Image source={images.rightarrow} style={styles.arrow} />
                                    </View>

                                    <Text style={styles.about}>About</Text>
                                    <Text style={styles.abouttxt}>I want a submissive partner for me. Don't want to talk about myself much.I'm dominant by nature, but can switch too. I love to explore new experinces, I like open minded an non-judgemental people.</Text>

                                    <Text style={styles.about}>What I am Seeking</Text>
                                    <Text style={styles.abouttxt}>I want you to open up like you never did before, be up for exploring whatever you want to try. Its very very important to know about each other first ..!</Text>
                                    <View style={styles.bodyTypeContainer}>
                                        {seeking.map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    styles.bodyTypeButton,
                                                    seek === type && styles.selectedBodyTypeButton,
                                                ]}
                                                onPress={() => handleSeeking(type)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.bodyTypeText,
                                                        seek === type && styles.selectedBodyTypeText,
                                                    ]}
                                                >
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.about}>Hobbies</Text>
                                    <View style={styles.bodyTypeContainer}>
                                        {getHobbies.map((hobby) => (
                                            <TouchableOpacity
                                                key={hobby}
                                                style={[
                                                    styles.bodyTypeButton,
                                                    userhobbies.includes(hobby) && styles.selectedBodyTypeButton,
                                                ]}
                                                onPress={() => handleHHobbies(hobby)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.bodyTypeText,
                                                        userhobbies.includes(hobby) && styles.selectedBodyTypeText,
                                                    ]}
                                                >
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
                                            <Text style={styles.txt7}>Black / African Descent</Text>
                                        </View>

                                        <View style={styles.cont7}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                <Image source={images.child} style={styles.face} />
                                                <Text style={styles.txt6}>Children</Text>
                                            </View>
                                            <Text style={styles.txt7}>Prefer Not To Say</Text>
                                        </View>

                                        <View style={styles.cont7}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                <Image source={images.smoke} style={styles.face} />
                                                <Text style={styles.txt6}>Do you smoke?</Text>
                                            </View>
                                            <Text style={styles.txt7}>Non - Smoker</Text>
                                        </View>

                                        <View style={styles.cont7}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                <Image source={images.drink} style={styles.face} />
                                                <Text style={styles.txt6}>Do you drink?</Text>
                                            </View>
                                            <Text style={styles.txt7}>Social Drinker</Text>
                                        </View>

                                        <View style={styles.cont7}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                <Image source={images.education} style={styles.face} />
                                                <Text style={styles.txt6}>Education</Text>
                                            </View>
                                            <Text style={styles.txt7}>Graduate Degree</Text>
                                        </View>

                                        <View style={styles.cont7}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                <Image source={images.face} style={styles.face} />
                                                <Text style={styles.txt6}>Occupation</Text>
                                            </View>
                                            <Text style={styles.txt7}>Building Maintenance</Text>
                                        </View>

                                        <View style={styles.cont7}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                <Image source={images.income} style={styles.face} />
                                                <Text style={styles.txt6}>Annual Income</Text>
                                            </View>
                                            <Text style={styles.txt7}>$150,000</Text>
                                        </View>

                                        <View style={styles.cont7}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 16 }}>
                                                <Image source={images.networth} style={styles.face} />
                                                <Text style={styles.txt6}>Net Worth</Text>
                                            </View>
                                            <Text style={styles.txt7}>$100,000</Text>
                                        </View>

                                    </View>
                                </View>
                            </Animated.ScrollView>
                            {/* Action Buttons */}

                            <Animated.View style={{
                                position: "absolute",
                                bottom: profileDetailsBottom,  // Interpolated to move it out of view
                                opacity: profileDetailsOpacity,  // Interpolated to fade it out
                                width: "100%"
                            }}>
                                <View style={{ bottom: 30, left: 16 }}>
                                    <View style={styles.onlineBadge}>
                                        <Text style={styles.onlineText1}>Online</Text>
                                    </View>
                                    <Text style={styles.cardName}>{item.name}, {item.age}</Text>
                                    <Text style={styles.cardLocation}>{item.location}</Text>
                                    <Text style={styles.cardDistance}>{item.distance}</Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={[styles.circleButton, { marginTop: 10 }]} onPress={handleCrossSwipe}>
                                        <Image source={images.cross} style={styles.buttonIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleHeartSwipe} style={[styles.circleButton, styles.heartButton]}>
                                        <Image source={images.heart} style={[styles.buttonIcon, { tintColor: 'white', height: 30, width: 30 }]} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.circleButton, { marginTop: 10 }]}>
                                        <Image source={images.chat} style={styles.buttonIcon} />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </Animated.View>
                    );
                })
                .reverse()}

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                onBackButtonPress={toggleModal}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    {/* Circle Progress Bar */}
                    <ProgressCircle
                        size={150}
                        progress={completionPercentage / 100}
                        showsText={true}
                        textStyle={styles.progressText}
                        borderWidth={8}
                        color={'#DAA520'}
                        unfilledColor={'#F0F0F0'}
                    />
                    {/* Completion Text */}
                    <Text style={styles.completionText}>{completionPercentage}% Complete</Text>
                    {/* Title */}
                    <Text style={styles.title}>Complete Your Profile for the Best Matches!</Text>
                    {/* Description */}
                    <Text style={styles.description}>
                        You’re almost there! A fully completed profile increases your chances of finding the perfect match and makes you stand out from other members.
                    </Text>

                    {/* Why Complete Your Profile Section */}
                    <View style={styles.listContainer}>
                        <Text style={styles.subtitle}>Why Complete Your Profile?</Text>
                        <View style={styles.listItem}>
                            <Text style={styles.listItemText}>✅ Get matched with people who align with your preferences.</Text>
                        </View>
                        <View style={styles.listItem}>
                            <Text style={styles.listItemText}>✅ Boost your profile visibility and credibility.</Text>
                        </View>
                        <View style={styles.listItem}>
                            <Text style={styles.listItemText}>✅ Show potential matches who you truly are.</Text>
                        </View>
                    </View>

                    {/* Footer Button */}
                    <TouchableOpacity style={styles.button} onPress={toggleModal}>
                        <Text style={styles.buttonText}>Complete My Profile Now</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

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
    },

    image: {
        width: "100%",
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
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        top: 5
    },
    cardLocation: {
        color: "#fff",
        fontSize: 16,
        opacity: 0.8,
        top: 10
    },

    cardDistance: {
        color: "#fff",
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
