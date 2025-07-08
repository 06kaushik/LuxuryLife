import React, { useState, useEffect, useRef } from "react";
import {
    Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, Image
} from "react-native";
import FastImage from 'react-native-fast-image';
import images from "../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSocket from "../../socket/SocketMain";
import moment from "moment";
import { useIsFocused } from '@react-navigation/native';
import axios from "axios";
import { PLAYFAIRFONTS, POPPINSRFONTS } from "../../components/GlobalStyle";
import LottieView from "lottie-react-native";
import RBSheet from 'react-native-raw-bottom-sheet';

const ChatScreen = ({ navigation }) => {

    const [search, setSearch] = useState("");
    const [chatList, setChatList] = useState([]);
    const [userdetails, setUserDetails] = useState(null);
    const [userprofiledata, setUserProfileData] = useState();
    const [loading, setLoading] = useState(true);
    const [useronline, setUserOnline] = useState(null);
    const [preloadedProfiles, setPreloadedProfiles] = useState({});
    const emittedOnce = useRef(false);
    const socketListenersInitialized = useRef(false);
    const isFocused = useIsFocused();
    const { emit, on, removeListener, once, socketId } = useSocket(() => { });
    const rbSheetRef = useRef();
    const [loadingChatId, setLoadingChatId] = useState(null);
    const [sortingOption, setSortingOption] = useState('All');


    useEffect(() => {
        if (isFocused) {
            fetchUserDetails();
            fetchUserProfile();
        }
    }, [isFocused]);


    const fetchUserDetails = async () => {
        try {
            const data = await AsyncStorage.getItem('UserData');
            if (data) {
                setUserDetails(JSON.parse(data));
            }
        } catch (error) {
            console.log('Error fetching user data:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const resp = await axios.get('auth/user-profile', {
                headers: { Authorization: token },
            });
            setUserProfileData(resp?.data?.data);
        } catch (error) {
            console.log('Error fetching profile:', error?.response?.data?.message);
        }
    };

    useEffect(() => {
        if (userdetails && socketId && !emittedOnce.current) {
            emit("getRecentChatList", { userId: userdetails._id, selectedFilter: sortingOption });
            emittedOnce.current = true;
        }

        if (userdetails && socketId && !socketListenersInitialized.current) {
            on('recentChatListResponse', async (event) => {
                const updatedChats = event?.list || [];

                setChatList(updatedChats); // ✅ render immediately
                setLoading(false); // ✅ hide loader now

                // ⏳ fetch profiles in background, no blocking
                const token = await AsyncStorage.getItem('authToken');
                const headers = { Authorization: token };

                const profileMap = {};
                for (let chat of updatedChats) {
                    // console.log('chat of dataaa', chat);

                    await axios.get(`home/get-user-profile/${chat?.participantId?._id}`, { headers })
                        .then(res => {
                            profileMap[chat?.participantId?._id] = res?.data?.data;
                            setPreloadedProfiles(prev => ({
                                ...prev,
                                [chat?.participantId?._id]: res?.data?.data
                            }));
                        })
                        .catch(() => { });
                }
            });


            on('unreadCountUpdate', (event) => {
                setChatList(prev =>
                    prev.map(chat => {
                        if (chat?.OneToOneId === event?.OneToOneId) {
                            return {
                                ...chat,
                                unreadCount: (chat.unreadCount || 0) + 1,
                                lastMessage: {
                                    message: event?.message,
                                    messageType: event?.messageType,
                                    timestamp: new Date().toISOString(),
                                },
                            };
                        }
                        return chat;
                    })
                );
            });

            socketListenersInitialized.current = true;
        }

        return () => {
            removeListener('recentChatListResponse');
            removeListener('unreadCountUpdate');
            socketListenersInitialized.current = false;
            emittedOnce.current = false;
        };
    }, [userdetails, socketId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("⚠️ Timed out waiting for chat data.");
                setLoading(false);
            }
        }, 8000);
        return () => clearTimeout(timer);
    }, [loading]);

    const handleChatPress = async (item) => {
        try {
            setLoadingChatId(item._id);
            const otherProfile = preloadedProfiles[item?.participantId?._id];

            emit("checkRoom", {
                users: {
                    participantId: item?.participantId?._id,
                    userId: userdetails?._id,
                },
            });

            once("roomResponse", (response) => {
                const roomId = response?.roomId;

                emit("initialMessages", {
                    userId: userdetails?._id,
                    roomId,
                });

                once("initialMessagesResponse", (res) => {
                    setLoadingChatId(null);
                    navigation.navigate("OneToOneChat", {
                        roomId,
                        initialMessages: res?.initialMessages || [],
                        item,
                        useronline,

                    });
                });
            });
        } catch (error) {
            console.error('Error during chat navigation:', error);
            setLoadingChatId(null);
        }
    };


    const filteredChatList = chatList.filter(item =>
        item?.participantId?.userName?.toLowerCase().includes(search.toLowerCase()) ||
        (item?.lastMessage?.message && item?.lastMessage?.message.toLowerCase().includes(search.toLowerCase()))
    );

    const renderItem = ({ item }) => {
        // console.log('iteeem of chatlist', item);

        const lastMessageTimestamp = moment(item?.updatedAt);
        const currentTime = moment();
        let displayTime;

        if (lastMessageTimestamp.isSame(currentTime, 'day')) {
            const diffInMinutes = currentTime.diff(lastMessageTimestamp, 'minutes');
            if (diffInMinutes < 60) {
                displayTime = `${diffInMinutes} min ago`;
            } else {
                displayTime = lastMessageTimestamp.format('h:mm A');
            }
        } else if (lastMessageTimestamp.isSame(currentTime.subtract(1, 'days'), 'day')) {
            displayTime = `Yesterday, ${lastMessageTimestamp.format('h:mm A')}`;
        } else {
            displayTime = lastMessageTimestamp.format('MMM D, h:mm A');
        }

        // Conditional rendering based on message type
        let messageContent;
        if (item?.lastMessage?.messageType === 'text') {
            messageContent = <Text numberOfLines={1} ellipsizeMode='tail' style={styles.chatMessage}>{item?.lastMessage?.message}</Text>
        } else if (item?.lastMessage?.messageType === 'audio') {
            messageContent = (
                <View style={styles.audioMessage}>
                    <Text>🎙️</Text>
                    <Text style={styles.chatMessage}>Audio Message</Text>
                </View>
            );
        } else if (item?.lastMessage?.messageType === 'image') {
            messageContent = (
                <View style={styles.imageMessage}>
                    <Text>📷</Text>
                    <Text style={styles.chatMessage}>Image</Text>
                </View>
            );
        } else if (['call_request', 'call_request_accept', 'call_request_reject'].includes(item?.lastMessage?.messageType)) {
            const isVideo = item?.lastMessage?.message === 'video';
            let iconSource = isVideo ? images.video : images.audio;

            if (item?.lastMessage?.messageType === 'call_request_reject') {
                iconSource = images.missed;
            } else if (!isVideo) {
                iconSource = item?.participantId?._id === userdetails?._id ? images.outgoing : images.incoming;
            }

            const labelMap = {
                call_request: 'Call Requested',
                call_request_accept: 'Call Accepted',
                call_request_reject: 'Call Rejected',
            };

            const label = `${isVideo ? 'Video' : 'Audio'} ${labelMap[item?.lastMessage?.messageType]}`;

            messageContent = (
                <View style={styles.audioMessage}>
                    <Image source={iconSource} style={styles.icon} />
                    <Text style={styles.chatMessage}>{label}</Text>
                </View>
            );
        }

        // Check subscription and gender conditions
        // Determine access to message content
        const participantGender = item?.participantId?.gender;
        const userGender = userprofiledata?.gender;
        const prefersGender = userprofiledata?.preferences?.gender?.[0];
        const isSubscribed = userprofiledata?.isSubscribed;

        let showUpgradeMessage = false;

        // If subscribed, always show message
        if (isSubscribed) {
            showUpgradeMessage = false;
        } else if (userGender === 'Female') {
            // Female without subscription
            if (participantGender === 'Male') {
                showUpgradeMessage = false; // can view Male messages
            } else {
                showUpgradeMessage = true; // Female viewing Female or Non-binary => restrict
            }
        } else if (userGender === 'Male' || userGender === 'Non-binary') {
            // Males or others cannot view anything without subscription
            showUpgradeMessage = true;
        }

        return (
            <TouchableOpacity onPress={() => handleChatPress(item)} style={styles.chatItem}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: item?.participantId?.profilePicture }} style={styles.avatar} />
                    {item?.participantId?.isOnLine === true ? <View style={styles.onlineIndicator} /> : null}
                </View>
                <View style={styles.chatContent}>
                    <Text style={styles.chatName}>{item?.participantId?.userName.charAt(0).toUpperCase() + item?.participantId?.userName?.slice(1)}</Text>
                    <View style={styles.messageTimeRow}>
                        {/* {upgradeText ? upgradeText : messageContent} */}
                        {loadingChatId === item._id ? (
                            <Text style={styles.chatMessage}>Loading...</Text>
                        ) : showUpgradeMessage ? (
                            <Text style={styles.chatMessage}>Upgrade to read</Text>
                        ) : item?.lastMessage?.messageType === 'pic_request' ? (
                            <Text style={styles.chatMessage}>Private Pic Requested</Text>
                        ) : (
                            messageContent
                        )}

                        <Text style={styles.chatTime}>{displayTime}</Text>
                    </View>
                    {item?.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCountText}>{item?.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {loading || !userprofiledata ? (
                <View style={styles.loader}>
                    <LottieView source={require('../../assets/loaderr.json')} autoPlay loop style={{ width: 100, height: 100 }} />
                </View>
            ) : (
                <>
                    <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.headerTitle}>Chats</Text>
                    </TouchableOpacity>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#C4C4C4"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    <TouchableOpacity onPress={() => rbSheetRef?.current?.open()} style={{ marginTop: 20, marginLeft: 10 }}>
                        <Image source={images.menu} style={{ height: 25, width: 25 }} />
                    </TouchableOpacity>


                    {filteredChatList?.length !== 0 ?
                        <FlatList
                            data={filteredChatList}
                            keyExtractor={(item) => item?._id}
                            renderItem={renderItem}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            removeClippedSubviews={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            style={styles.chatList}
                        />
                        :
                        <View style={{ flex: 1, justifyContent: 'center', bottom: 30 }}>
                            <Image source={images.nochat} style={{ height: 115, width: 131, tintColor: '#916008', alignSelf: "center", bottom: 20 }} />
                            <Text style={{ fontSize: 20, textAlign: 'center', color: 'black', fontFamily: PLAYFAIRFONTS.bold }}>No Messages Yet?</Text>
                            <Text style={{ fontSize: 16, textAlign: 'center', color: 'black', fontFamily: POPPINSRFONTS.regular, marginLeft: 16, marginRight: 16, top: 5 }}>Don’t worry – your perfect match might just be a conversation away. Stay active and discover exciting connections! Once you receive your messages, make sure to use the filters above.</Text>

                        </View>
                    }
                </>
            )}

            <RBSheet
                ref={rbSheetRef}
                height={200}
                closeOnPressMask={true}
                draggable={true}
            >
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity style={styles.sheetOption} onPress={() => { setSortingOption('All'); rbSheetRef.current?.close(); }}>
                        <Text style={styles.sortxt}>All Messages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetOption} onPress={() => { setSortingOption('New Messages'); rbSheetRef.current?.close(); }}>
                        <Text style={styles.sortxt}>New Messages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetOption} onPress={() => { setSortingOption('Unread Messages'); rbSheetRef.current?.close(); }}>
                        <Text style={styles.sortxt}>Unread Messages</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 15,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 50,
    },
    profilePic: {
        height: 50,
        width: 50,
        borderRadius: 100,
    },
    headerTitle: {
        fontSize: 30,
        fontFamily: POPPINSRFONTS.bold,
        marginLeft: 10,
        color: "black",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
        paddingHorizontal: 10,
        height: 40,
    },
    searchIcon: {
        height: 20,
        width: 20,
        marginRight: 5,
        tintColor: "#C4C4C4",
    },
    searchInput: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#000",
        paddingLeft: 20,
        height: 44,
        width: '100%',
        top: 3,
    },
    chatList: {
        marginTop: 30,
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 25,
    },
    chatContent: {
        flex: 1,
        marginLeft: 10,
    },
    chatName: {
        fontSize: 20,
        fontFamily: PLAYFAIRFONTS.bold,
        color: "black",
        marginLeft: 8
    },
    messageTimeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 3,
    },
    chatMessage: {
        fontSize: 14,
        fontFamily: POPPINSRFONTS.regular,
        color: "#7A7A7A",
        marginLeft: 10,
        top: 3,
        marginRight: 30
    },
    chatTime: {
        fontSize: 10,
        fontFamily: "Poppins-Regular",
        color: "#C4C4C4",
        top: 8
    },
    onlineIndicator: {
        position: "absolute",
        bottom: 2,
        right: 2,
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: "#00D26A",
        borderWidth: 2,
        borderColor: "white",
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadge: {
        position: "absolute",
        // top: 5,
        right: 5,
        backgroundColor: "red",
        borderRadius: 100,
        // paddingVertical: 2,
        // paddingHorizontal: 5,
        height: 25,
        width: 25,
        justifyContent: 'center'
    },
    unreadCountText: {
        color: "white",
        fontSize: 13,
        fontWeight: "bold",
        textAlign: 'center'
    },
    audioMessage: {
        flexDirection: "row",
        alignItems: "center",
    },
    imageMessage: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    sheetOption: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E2E9',
    },
    sortxt: {
        color: "black",
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center'
    },
});

export default ChatScreen;



