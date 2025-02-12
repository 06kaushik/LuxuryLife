import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator, Dimensions } from 'react-native'
import images from "../../components/images";
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import useSocket from "../../socket/SocketMain";
import { useIsFocused } from '@react-navigation/native';



const { width, height } = Dimensions.get('window')

const ViewedMe = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(true);
    const [userdetails, setUserDetails] = useState(null);
    const [viewedme, setViewedMe] = useState([]);
    const { emit, on } = useSocket(onSocketConnect);
    const isFocused = useIsFocused()


    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };

    useEffect(() => {
        getViewMeData()
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
                console.log('Error fetching user data:', error);
            }
        };
        fetchUserDetails();
    }, []);


    const getViewMeData = async () => {

        if (!userdetails?.location?.coordinates) return;
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const body = {
            currentPage: 0,
            pageLength: 2000,
            where: {
                longitude: userdetails?.location?.coordinates[0],
                latitude: userdetails?.location?.coordinates[1],
            },
            sortBy: "age",

        };
        console.log('body of vieweed data', body);

        setIsLoading(true);
        try {
            const resp = await axios.post('home/get-favorite/viewed', body, { headers });
            console.log('Response from the viewed me data:', resp.data);
            setViewedMe(resp?.data?.data)
            setIsLoading(false);
        } catch (error) {
            console.error('Error from get viewed data:', error?.response?.data?.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userdetails) {
            getViewMeData();
        }
    }, [userdetails]);


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
            getViewMeData()
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
            getViewMeData()

        } catch (error) {
            console.log('error from the like ', error);
        }
    }

    const userHide = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: 'HIDE'
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the HIDE', resp?.data);
            getViewMeData()
        } catch (error) {
            console.log('error from the hde api ', error.response.data.message);


        }

    }

    const handleChatPress = (item) => {
        try {
            emit("checkRoom", { users: { participantId: item?.userId, userId: userdetails?._id } });
            on('roomResponse', (response) => {
                const roomId = response?.roomId;
                console.log('room id in viewd screen', roomId);

                emit('initialMessages', { userId: userdetails?._id, roomId });
                on('initialMessagesResponse', (response) => {
                    const messages = response?.initialMessages || [];
                    navigation.navigate('OneToOneChat', { roomId: roomId, initialMessages: messages, userName: item?.user?.userName, profilepic: item?.user?.profilePicture, id: item?.userId });
                });
            });
        } catch (error) {
            console.log('error from navigatuo to one to one ', error);
        }
    };


    const renderViewedMe = ({ item }) => {
console.log('iteemeemm of viewd me', item);

        const lastActive = moment(item?.user?.lastActive).fromNow();
        const hasLiked = item.userLikeActionCount === 1;

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item?.userId })}>
                    <ImageBackground source={{ uri: item?.user?.profilePicture }} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
                        <LinearGradient colors={["transparent", "rgba(0, 0, 0, 0.7)"]} style={styles.gradientOverlay} />
                        {item.status === "Online" && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Online</Text>
                            </View>
                        )}
                        <View style={styles.overlayContainer}>
                            <Text style={styles.memberName}>{`${item.user?.userName}, ${item?.user?.age}`}</Text>
                            <Text style={styles.memberLocation}>{item.city}, {item?.country}</Text>
                            <Text style={styles.memberDistance}>{item.distance} miles</Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={styles.timeAgo}>{lastActive}</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => userHide(item?.userId)} style={styles.unhideButton}>
                        <Text style={styles.unhideText}>Hide</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleChatPress(item)}>
                        <Image source={images.chat} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => hasLiked ? userDisLike(item?.userId) : userLike(item?.userId)}
                        style={styles.iconButton}>
                        <Image source={hasLiked ? images.redheart : images.heart} style={[styles.icon, { height: 20, width: 20, top: 1 }]} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.main}>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    data={viewedme}
                    renderItem={renderViewedMe}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    style={{ marginTop: 20 }}
                />
            )}
        </View>
    );
};

export default ViewedMe;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20
    },
    card: {
        // flex: 1,
        width: width * 0.4,
        margin: 8,
        borderRadius: 10,
        backgroundColor: "#FFF",
        overflow: "hidden",
    },
    imageBackground: {
        width: "100%",
        height: 200,
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
        fontFamily: "Poppins-Bold",
        fontSize: 14,
        color: "white",
    },
    memberLocation: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
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
    iconButton: {
        borderWidth: 1,
        borderColor: '#E0E2E9',
        borderRadius: 100,
        height: 36,
        width: 36,
        justifyContent: 'center',
    },
    icon: {
        width: 15,
        height: 15,
        // tintColor: "#3C4043",
        alignSelf: 'center'
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationLoader: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    gradientOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "50%",
        borderRadius: 10,
    },
});
