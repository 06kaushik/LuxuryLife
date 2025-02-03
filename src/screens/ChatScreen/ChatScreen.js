import React, { useState, useEffect, useRef, } from "react";
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

const ChatScreen = ({ navigation }) => {


    const [search, setSearch] = useState("");
    const [chatList, setChatList] = useState([]);
    const [userdetails, setUserDetails] = useState(null);
    const [initialMessages, setInitialMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const emittedRoomIds = useRef(new Set());
    const { emit, on, removeListener } = useSocket(onSocketConnect);



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
        if (userdetails?._id) {
            emit("userOnline", { userId: userdetails?._id });
            emit("getRecentChatList", { userId: userdetails?._id });

            on('recentChatListResponse', (event) => {
                const updatedChats = event?.list || [];
                updatedChats.forEach((chatItem) => {
                    const participantId = chatItem?.participantId?._id;

                    if (!chatItem.roomId && !emittedRoomIds.current.has(participantId)) {
                        emittedRoomIds.current.add(participantId);
                        emit("checkRoom", { users: { participantId, userId: userdetails?._id } });
                    }
                });
                setChatList(updatedChats);
                setLoading(false);
            });

            on('userStatusChange', (event) => {
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

            on('roomResponse', (response) => {
                const roomId = response?.roomId;
                const participantId = response?.userId;
                if (roomId) {
                    setChatList((prevChatList) => {
                        return prevChatList.map(chatItem =>
                            chatItem?.participantId?._id === participantId
                                ? { ...chatItem, roomId }
                                : chatItem
                        );
                    });
                    emit('initialMessages', { userId: userdetails?._id, roomId });
                    on('initialMessagesResponse', (response) => {
                        const messages = response || [];
                        setInitialMessages(messages?.initialMessages);
                    });
                }
            });


            return () => {
                removeListener('recentChatListResponse');
                removeListener('userStatusChange');
                removeListener('roomResponse');
                removeListener('initialMessagesResponse');
            };
        }
    }, [userdetails]);


    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };

    const handleChatPress = (item) => {
        if (item.roomId) {
            navigation.navigate('OneToOneChat', { roomId: item.roomId, initialMessages });
        } else {
            const participantId = item?.participantId?._id;
            const userId = userdetails?._id;
            emit("checkRoom", { users: { participantId, userId } });

            on('roomResponse', (response) => {
                const roomId = response?.roomId;
                if (roomId) {
                    emit('initialMessages', { userId, roomId });
                    on('initialMessagesResponse', (response) => {
                        const messages = response?.messages || [];
                        navigation.navigate('OneToOneChat', { roomId: roomId, initialMessages: initialMessages, item: item });
                    });
                } else {
                    console.log("Room ID not available.");
                }
            });
        }
    };

    const renderItem = ({ item }) => {
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
        }
        else if (lastMessageTimestamp.isSame(currentTime.subtract(1, 'days'), 'day')) {
            displayTime = `Yesterday, ${lastMessageTimestamp.format('h:mm A')}`;
        }
        else {
            displayTime = lastMessageTimestamp.format('MMM D, h:mm A');
        }

        return (
            <TouchableOpacity onPress={() => handleChatPress(item)} style={styles.chatItem}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: item?.participantId?.profilePicture }} style={styles.avatar} />
                    {item?.participantId?.isOnLine === true ?
                        <View style={styles.onlineIndicator} />
                        : null
                    }
                </View>
                <View style={styles.chatContent}>
                    <Text style={styles.chatName}>{item?.participantId?.userName}</Text>
                    <View style={styles.messageTimeRow}>
                        <Text style={styles.chatMessage}>{item?.lastMessage?.message}</Text>
                        <Text style={styles.chatTime}>{displayTime}</Text>
                    </View>
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
    },
    chatTime: {
        fontSize: 10,
        fontFamily: "Poppins-Regular",
        color: "#C4C4C4",
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
});

export default ChatScreen;
