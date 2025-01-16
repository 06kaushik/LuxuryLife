import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Image,
    FlatList,
    TouchableOpacity,
} from "react-native";
import images from "../../components/images"; // Replace with your actual image imports

const ChatScreen = ({ navigation }) => {
    const [search, setSearch] = useState("");

    // Dummy Data for Chats
    const data = [
        {
            id: "1",
            name: "Martin Randolph",
            message: "You: What's man!",
            time: "9:40 AM",
            avatar: images.dummy,
            isOnline: true,
        },
        {
            id: "2",
            name: "Andrew Parker",
            message: "You: Ok, thanks!",
            time: "9:25 AM",
            avatar: images.dummy,
            isOnline: false,
        },
        {
            id: "3",
            name: "Karen Castillo",
            message: "You: Ok, See you in To...",
            time: "Fri",
            avatar: images.dummy,
            isOnline: false,
        },
        {
            id: "4",
            name: "Maisy Humphrey",
            message: "Have a good day, Maisy!",
            time: "Fri",
            avatar: images.dummy,
            isOnline: false,
        },
        {
            id: "5",
            name: "Joshua Lawrence",
            message: "The business plan loo...",
            time: "Thu",
            avatar: images.dummy,
            isOnline: true,
        },
    ];

    // Top Section Icons (with Online Indicators)
    const topIcons = [
        { id: "1", name: "Joshua", avatar: images.dummy, isOnline: true },
        { id: "2", name: "Martin", avatar: images.dummy, isOnline: true },
        { id: "3", name: "Karen", avatar: images.dummy, isOnline: true },
        { id: "4", name: "Martha", avatar: images.dummy, isOnline: true },
    ];

    // Render Individual Chat Item
    const renderItem = ({ item }) => (

        <TouchableOpacity onPress={() => navigation.navigate('OneToOneChat')} style={styles.chatItem}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <Image source={item.avatar} style={styles.avatar} />
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            {/* Chat Content */}
            <View style={styles.chatContent}>
                <Text style={styles.chatName}>{item.name}</Text>
                <View style={styles.messageTimeRow}>
                    <Text style={styles.chatMessage}>{item.message}</Text>
                    <Text style={styles.chatTime}>{item.time}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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

            {/* Top Icons with Online Indicators */}
            <View style={styles.topIcons}>
                {topIcons.map((user) => (
                    <View key={user.id} style={styles.userIconContainer}>
                        <View>
                            <Image source={user.avatar} style={styles.topAvatar} />
                            {user.isOnline && <View style={styles.onlineIndicator} />}
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                    </View>
                ))}
            </View>

            {/* Chat List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
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
