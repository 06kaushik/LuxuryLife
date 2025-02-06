import React, { useState, useEffect, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import images from "../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSocket from "../../socket/SocketMain";
import moment from "moment";
import { useIsFocused } from '@react-navigation/native';

const ChatScreen = ({ navigation }) => {

    const [search, setSearch] = useState("");
    const [chatList, setChatList] = useState([]);
    const [userdetails, setUserDetails] = useState(null);
    const [initialMessages, setInitialMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [useronline, setUserOnline] = useState(null);
    const emittedRoomIds = useRef(new Set());
    const isFocused = useIsFocused()

    const { emit, on, removeListener } = useSocket(onSocketConnect);



    useEffect(() => {
        if (isFocused) {
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

            if (userdetails?._id) {
                emit("userOnline", { userId: userdetails?._id });
                emit("getRecentChatList", { userId: userdetails?._id });

                on('recentChatListResponse', (event) => {
                    const updatedChats = event?.list || [];
                    updatedChats.forEach((chatItem) => {
                        const participantId = chatItem?.participantId?._id;

                        if (!chatItem.roomId && !emittedRoomIds.current.has(participantId)) {
                            emittedRoomIds.current.add(participantId);
                        }
                    });
                    setChatList(updatedChats);
                    setLoading(false);
                });

                on('userStatusChange', (event) => {
                    setUserOnline(event?.userId);
                    setChatList(prevChatList =>
                        prevChatList.map(chatItem =>
                            chatItem?.participantId?._id === event?.userId
                                ? {
                                    ...chatItem,
                                    participantId: {
                                        ...chatItem.participantId,
                                        isOnLine: event?.isOnline
                                    }
                                }
                                : chatItem
                        )
                    );
                });

                on('unreadCountUpdate', (event) => {
                    console.log('Unread count updated: ', event);

                    setChatList(prevChatList =>
                        prevChatList.map(chatItem => {
                            if (chatItem?.OneToOneId === event?.OneToOneId) {
                                return {
                                    ...chatItem,
                                    unreadCount: chatItem?.unreadCount + 1,
                                    lastMessage: {
                                        message: event?.message,
                                        messageType: event?.messageType,
                                        timestamp: new Date().toISOString(),
                                    },
                                };
                            }
                            return chatItem;
                        })
                    );
                });
            }
        }

        return () => {
            // Cleanup listeners when screen is no longer focused
            removeListener('recentChatListResponse');
            removeListener('userStatusChange');
            removeListener('unreadCountUpdate');
        };
    }, [isFocused, userdetails, emit, on, removeListener]);

    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };

    const handleChatPress = (item) => {
        try {
            emit("checkRoom", { users: { participantId: item?.participantId?._id, userId: userdetails?._id } });
            on('roomResponse', (response) => {
                const roomId = response?.roomId;
                emit('initialMessages', { userId: userdetails?._id, roomId });
                on('initialMessagesResponse', (response) => {
                    const messages = response?.initialMessages || [];
                    // console.log('initial message?>>>>', messages);
                    setInitialMessages(messages);
                    navigation.navigate('OneToOneChat', { roomId: roomId, initialMessages: messages, item: item, useronline: useronline });
                });
            });

        } catch (error) {
            console.log('error from navigatuo to one to one ', error);
        }

    };

    const renderItem = ({ item }) => {
        // console.log('iteeeem',item);

        const lastMessageTimestamp = moment(item?.lastMessage?.timestamp);
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
            messageContent = <Text style={styles.chatMessage}>{item?.lastMessage?.message}</Text>;
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
        }

        return (
            <TouchableOpacity onPress={() => handleChatPress(item)} style={styles.chatItem}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: item?.participantId?.profilePicture }} style={styles.avatar} />
                    {item?.participantId?.isOnLine === true ? <View style={styles.onlineIndicator} /> : null}
                </View>
                <View style={styles.chatContent}>
                    <Text style={styles.chatName}>{item?.participantId?.userName}</Text>
                    <View style={styles.messageTimeRow}>
                        {messageContent}
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
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                <>
                    <View style={styles.header}>
                        <Image source={{ uri: userdetails?.profilePicture }} style={styles.profilePic} />
                        <Text style={styles.headerTitle}>Chats</Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <Image source={images.search} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#C4C4C4"
                            value={search}
                            onChangeText={(text) => setSearch(text)}
                        />
                    </View>

                    <FlatList
                        data={chatList}
                        keyExtractor={(item) => item?._id}
                        renderItem={renderItem}
                        style={styles.chatList}
                    />
                </>
            )}
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
        fontSize: 24,
        fontFamily: "Poppins-Bold",
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
        marginTop: 20,
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
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: "black",
    },
    messageTimeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 3,
    },
    chatMessage: {
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: "#7A7A7A",
        marginLeft: 10,
        top: 3
    },
    chatTime: {
        fontSize: 10,
        fontFamily: "Poppins-Regular",
        color: "#C4C4C4",
        top: 5
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
        top: 5,
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
});

export default ChatScreen;
