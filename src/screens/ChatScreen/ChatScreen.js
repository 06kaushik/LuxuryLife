import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Image,
    FlatList,
    TouchableOpacity,
} from "react-native";
import images from "../../components/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSocket from "../../socket/SocketMain";
import moment from "moment";

const ChatScreen = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const [chatList, setChatList] = useState([]);
    const [userdetails, setUserDetails] = useState(null);

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
        emit("userOnline", { userId: userdetails?._id });
        emit("getRecentChatList", { userId: userdetails?._id });

        on('recentChatListResponse', (event) => {
            setChatList(event?.list)
        })
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
        return () => {
            removeListener()
        };
    }, [emit, on])

    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };


    const topOnlineUsers = ({ item }) => {
        return (
            <View>
                <View style={styles.avatarContainer}>
                    <View style={styles.userIconContainer}>
                        <View>
                            <Image source={{ uri: item?.participantId?.profilePicture }} style={styles.topAvatar} />
                            <View style={styles.onlineIndicator} />
                        </View>
                        <Text style={styles.userName}>{item?.participantId?.userName}</Text>
                    </View>
                </View>
            </View>
        )
    }

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
            <TouchableOpacity onPress={() => navigation.navigate('OneToOneChat')} style={styles.chatItem}>
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
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image source={images.profilePic} style={styles.profilePic} />
                <Text style={styles.headerTitle}>Chats</Text>
            </View>

            {/* Search Input with Icon */}
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

            <View>
                <FlatList
                    data={chatList.filter(item => item?.participantId?.isOnline != false)}
                    keyExtractor={(item) => item?._id}
                    renderItem={topOnlineUsers}
                    style={styles.chatList}
                />
            </View>


            <FlatList
                data={chatList}
                keyExtractor={(item) => item?._id}
                renderItem={renderItem}
                style={styles.chatList}
            />
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
        height: 40,
        width: 40,
        borderRadius: 20,
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
        // flex: 1,
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#000",
        paddingLeft: 20,
        height: 44,
        width: '100%',
        top: 3
    },
    topIcons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    userIconContainer: {
        alignItems: "center",
    },
    topAvatar: {
        height: 50,
        width: 50,
        borderRadius: 25,
    },
    userName: {
        marginTop: 5,
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: "#7A7A7A",
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
});

export default ChatScreen;
