import React, { useState, useEffect,useContext } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ImageBackground, Dimensions, ActivityIndicator } from 'react-native'
import images from "../../components/images";
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import useSocket from "../../socket/SocketMain";
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from "../../components/GlobalStyle";
import LottieView from "lottie-react-native";
import { UserContext } from "../../components/UserContext";


const { width, height } = Dimensions.get('window');

const RelevantScreen = ({ navigation, index }) => {

    //('relevant screen');


    const [userData, setUserData] = useState([])
    const [filterdata, setFilterData] = useState(null)
    const [isLoading, setIsLoading] = useState(true);
    const [userdetails, setUserDetails] = useState(null)
    const { emit, on, removeListener, once } = useSocket(onSocketConnect);
    const isFocused = useIsFocused()
    const [likesetting, setManageLikeSetting] = useState()
    const { userprofiledata } = useContext(UserContext);



    const onSocketConnect = () => {
        //('Socket connected in chat screen');
    };

    useEffect(() => {
        if (isFocused && userdetails && index === 2) {
            getUserFilteredData();
        }
    }, [isFocused, userdetails, index]);

    useEffect(() => {
        getdatafromAsync();
    }, []);

    useEffect(() => {
        if (filterdata) {
            getUserFilteredData();
        }
    }, [filterdata]);


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
        } catch (error) {
            // console.log(
            //     'error from account settings in userdetails',
            //     error.response?.data?.message || error.message
            // );
        }
    };


    const getdatafromAsync = async () => {
        try {
            const resp = await AsyncStorage.getItem('dashboardData')
            // //('reposnse from the async', resp);
            if (resp) {
                const parseData = JSON.parse(resp)
                setFilterData(parseData)
            }

        } catch (error) {
            //('error from the async dash data', error);


        }
    }

    const getUserFilteredData = async (page) => {
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
                tall: {
                    unit: filterdata?.where?.tall?.unit,
                    min: filterdata?.where?.tall?.min,
                    max: filterdata?.where?.tall?.max,
                    range: filterdata?.where?.tall?.range
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
            // requestType: "mobile",
            pageLength: 100,
            currentPage: 0,
            autopopulate: true,
            // requestSource: 'list',
            sortBy: 'distance'
        };
        // //('body of NEAREST', body)
        setIsLoading(true);
        try {
            const resp = await axios.post('home/search', body, { headers });
            // //('response from the search API IN NEAREST', resp?.data?.data.length);
            setUserData(
                resp?.data?.data.map((item) => ({
                    ...item,
                    localLiked: item.activity_logs?.some(
                        (log) => log.action === "LIKE" && log.userId === userdetails?._id
                    ),
                }))
            );
            setIsLoading(false);
        } catch (error) {
            //('error from the search API', error.response?.data?.message || error);
            setIsLoading(false);
        }
    };




    const userLike = async (id) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const body = {
            targetUserId: id,
            action: "LIKE"
        };

        setUserData(prev =>
            prev.map(item => item.userId === id ? { ...item, localLiked: true } : item)
        );

        try {
            await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers });
            if (likesetting !== true) {
                emit('profileActivity', {
                    action: 'like',
                    targetUserId: id,
                    userId: userdetails?._id,
                });
            }
        } catch (error) {
            console.log('error from like', error);
        }
    };

    const userDisLike = async (id) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const body = {
            targetUserId: id,
            action: "UNLIKE"
        };

        setUserData(prev =>
            prev.map(item => item.userId === id ? { ...item, localLiked: false } : item)
        );

        try {
            await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers });
        } catch (error) {
            console.log('error from dislike', error);
        }
    };

    const handleChatPress = (item) => {
        try {
            emit("checkRoom", { users: { participantId: item?.userId, userId: userdetails?._id } });

            // Use `once` instead of `on` to prevent stacking listeners
            removeListener('roomResponse');
            once('roomResponse', (response) => {
                const roomId = response?.roomId;
                emit('initialMessages', { userId: userdetails?._id, roomId });
                removeListener('initialMessagesResponse');
                once('initialMessagesResponse', (response) => {
                    const messages = response?.initialMessages || [];
                    navigation.navigate('OneToOneChatNav', {
                        roomId: roomId,
                        initialMessages: messages,
                        userName: item?.userName,
                        profilepic: item?.profilePicture,
                        id: item?.userId
                    });
                });
            });

        } catch (error) {
            console.error('Error navigating to OneToOneChat:', error);
        }
    };



    const renderNewest = ({ item }) => {

        const hasLiked = item.localLiked;
        const truncatedUserName = item.userName.length > 5 ? item.userName.slice(0, 5) : item.userName;

        return (
            <View style={styles.card} >
                <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item?.userId })}>
                    <ImageBackground source={{ uri: item?.profilePicture }} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
                        <LinearGradient
                            colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
                            style={styles.gradientOverlay}
                        />
                        {item?.subscriptionsType ? (
                            item?.subscriptionsType === 'Gold' ? (
                                <View
                                    style={{
                                        position: "absolute",
                                        top: 10,
                                        left: 10,
                                        backgroundColor: '#916008',
                                        height: 25,
                                        width: 25,
                                        borderRadius: 100,
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        source={images.stars}
                                        style={{
                                            height: 20,
                                            width: 20,
                                            alignSelf: 'center',
                                            tintColor: 'gold',
                                        }}
                                    />
                                </View>
                            ) : item?.subscriptionsType === 'Luxury' ? (
                                <View
                                    style={{
                                        position: "absolute",
                                        top: 10,
                                        left: 10,
                                        backgroundColor: 'silver',
                                        height: 25,
                                        width: 25,
                                        borderRadius: 100,
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        source={images.crown}
                                        style={{
                                            height: 20,
                                            width: 20,
                                            alignSelf: 'center',
                                            tintColor: '#916008',
                                        }}
                                    />
                                </View>
                            ) : null
                        ) : null}

                        {item.isOnline && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Online</Text>
                            </View>
                        )}
                        <View style={styles.overlayContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                <View>
                                    <Text style={styles.memberName} numberOfLines={2} ellipsizeMode="tail">
                                        {`${truncatedUserName.charAt(0).toUpperCase() + truncatedUserName.slice(1)}, ${item.age}`}
                                    </Text>
                                    <Text style={styles.memberLocation}>{item.city}</Text>
                                    <Text style={styles.memberDistance}>{item.distance === 0 ? 1 : item?.distance} {userprofiledata?.preferredMeasurement === false ? 'km' : 'miles'} away</Text>
                                </View>
                                <View style={{}}>
                                    <TouchableOpacity onPress={() => handleChatPress(item)} style={{ borderWidth: 1, borderColor: '#E0E2E9', borderRadius: 100, height: 30, width: 30, justifyContent: 'center', backgroundColor: 'white', position: 'absolute', right: 1 }}>
                                        <Image source={images.chat} style={[styles.icon, { height: 18, width: 18 }]} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => hasLiked ? userDisLike(item?.userId) : userLike(item?.userId)}
                                        style={{ borderWidth: 1, borderColor: '#E0E2E9', borderRadius: 100, height: 30, width: 30, justifyContent: 'center', backgroundColor: 'white', top: 40, position: 'absolute', right: 1 }}
                                    >
                                        <Image source={hasLiked ? images.redheart : images.heart} style={[styles.icon, { height: 20, width: 20, top: 1 }]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View >
        )
    }

    return (
        <View style={styles.main}>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LottieView
                        source={require('../../assets/loaderr.json')}
                        autoPlay
                        loop
                        style={{ width: 50, height: 50 }}
                    />
                </View>
            ) : userData?.length === 0 ? (
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 24, color: 'black', textAlign: 'center', fontFamily: PLAYFAIRFONTS.bold }}>Oops, We are out of Matches</Text>
                </View>
            ) : (
                <FlatList
                    data={userData}
                    renderItem={renderNewest}
                    keyExtractor={(item) => item._id}
                    removeClippedSubviews={false}
                    numColumns={2}
                    style={{ marginTop: 20 }}

                />
            )}
        </View>
    )
}

export default RelevantScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    gridContent: {
        paddingBottom: 20,
    },
    card: {
        margin: 8,
        width: '45%',
        borderRadius: 10,
        backgroundColor: "#FFF",
        height: height * 0.3,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    imageBackground: {
        width: "100%",
        height: "100%",
        justifyContent: "flex-end",
    },
    statusBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "green",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        color: "white",
        fontFamily: "Poppins-SemiBold",
        fontSize: 10,
    },
    overlayContainer: {
        padding: 10,
    },
    memberName: {
        fontFamily: GARAMOND.bold,
        fontSize: 23,
        color: "white",
    },
    memberLocation: {
        fontFamily: POPPINSRFONTS.regular,
        fontSize: 14,
        color: "white",
    },
    memberDistance: {
        fontFamily: "Poppins-Medium",
        fontSize: 12,
        color: "white",
    },
    timeAgo: {
        marginLeft: 12,
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#7A7A7A",
        marginTop: 5,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 5,
        marginBottom: 10,
    },
    unhideButton: {
        backgroundColor: "white",
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderColor: '#E0E2E9',
        borderWidth: 1,
        justifyContent: 'center'
    },
    unhideText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: "#3C4043",
    },
    icon: {
        width: 15,
        height: 15,
        // tintColor: "#3D4043",
        alignSelf: 'center'
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    emptyImage: {
        height: 150,
        width: 104,
    },
    emptyText: {
        textAlign: "center",
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        color: "#3C4043",
        marginTop: 20,
    },
    browseButton: {
        backgroundColor: "#916008",
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    browseText: {
        color: "white",
        fontFamily: "Poppins-SemiBold",
        fontSize: 15,
    },
    gradientOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "50%",
        borderRadius: 10,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    paginationLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
