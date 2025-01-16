import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ImageBackground } from 'react-native'
import images from "../../components/images";
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";



const ViewedMe = ({ navigation }) => {
    const userId = '677687b24cd0469415aa2c8a'
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [viewedme, setViewedMe] = useState([
        {
            id: "1",
            name: "Leilanig",
            age: 19,
            location: "New Delhi, India",
            distance: "800 miles",
            status: "Online",
            image: images.dummy,
        },
        {
            id: "2",
            name: "Leilanig",
            age: 19,
            location: "New Delhi, India",
            distance: "800 miles",
            status: "Offline",
            image: images.dummy,
        },
        {
            id: "3",
            name: "Leilanig",
            age: 19,
            location: "New Delhi, India",
            distance: "800 miles",
            status: "Online",
            image: images.dummy,
        },
        {
            id: "4",
            name: "Leilanig",
            age: 19,
            location: "New Delhi, India",
            distance: "800 miles",
            status: "Offline",
            image: images.dummy,
        },
    ]);

    ///// API INTEGRATION /////////

    const getViewMeData = async (page = 0) => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        const body = {
            currentPage: page,
            pageLength: 20,
            longitude: 77.3812,
            latitude: 28.6210,
        };

        try {
            const resp = await axios.post(`home/get-favorite/viewed/${userId}`, body, { headers });
            console.log('Response from the viewed me data:', resp.data.data);

            if (resp.data.data > 0) {
                setViewedMe((prev) => [...prev, ...resp.data.data]);
                setHasMoreData(true);
            } else {
                setHasMoreData(false);
            }
        } catch (error) {
            console.error('Error from get viewed data:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        getViewMeData(currentPage);
    }, []);

    const loadMoreData = () => {
        if (!isLoadingMore && hasMoreData) {
            setIsLoadingMore(true);
            setCurrentPage((prev) => prev + 1);
            getViewMeData(currentPage + 1);
        }
    };


    const renderViewedMe = ({ item }) => (
        <View style={styles.card}>
            <ImageBackground source={item.image} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
                <LinearGradient
                    colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
                    style={styles.gradientOverlay}
                />
                {item.status === "Online" && (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                )}
                <View style={styles.overlayContainer}>
                    <Text style={styles.memberName}>{`${item.name}, ${item.age}`}</Text>
                    <Text style={styles.memberLocation}>{item.location}</Text>
                    <Text style={styles.memberDistance}>{item.distance}</Text>
                </View>
            </ImageBackground>
            <Text style={styles.timeAgo}>7 hours ago</Text>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.unhideButton}>
                    <Text style={styles.unhideText}>Hide</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ borderWidth: 1, borderColor: '#E0E2E9', borderRadius: 100, height: 36, width: 36, justifyContent: 'center' }}>
                    <Image source={images.chat} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={{ borderWidth: 1, borderColor: '#E0E2E9', borderRadius: 100, height: 36, width: 36, justifyContent: 'center' }}>
                    <Image source={images.heart} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (


        <View style={styles.main}>
            <FlatList
                data={viewedme}
                renderItem={renderViewedMe}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                style={{ marginTop: 20 }}
                contentContainerStyle={styles.gridContent}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5} // Trigger load more when 50% from the bottom
                ListFooterComponent={
                    isLoadingMore && (
                        <Text style={{ textAlign: 'center', marginVertical: 10 }}>Loading more...</Text>
                    )
                }
            />

        </View>
    )
}


export default ViewedMe;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20
    },
    gridContent: {
        paddingBottom: 20,
    },
    card: {
        flex: 1,
        margin: 8,
        borderRadius: 10,
        backgroundColor: "#FFF",
        // elevation: 2,
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
    icon: {
        width: 15,
        height: 15,
        tintColor: "#3C4043",
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
})