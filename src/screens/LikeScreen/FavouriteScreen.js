import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator, Dimensions } from 'react-native'
import images from "../../components/images";
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";


const { width, height } = Dimensions.get('window')

const FavouriteScreen = ({ navigation }) => {

    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [userdetails, setUserDetails] = useState(null);
    const [favourite, setFavourite] = useState([]);


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

    const getFavouriteData = async () => {
        if (!userdetails?.location?.coordinates) return;

        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        const body = {
            currentPage,
            pageLength: 20,
            where: {
                longitude: userdetails?.lcoation?.coordinates[0],
                latitude: userdetails?.location?.coordinates[1],
            },
            sortBy: 'age'
        };
        setIsLoading(true)
        try {
            const resp = await axios.post(`home/get-my-favorite`, body, { headers });
            console.log('Response from the favorite data:', resp.data.data);
            setFavourite(prevData => currentPage === 0 ? resp?.data?.data : [...prevData, ...resp?.data?.data])
            if (resp?.data?.data?.length < body.pageLength) {
                setHasMoreData(false)
            } else {
                setHasMoreData(true)
            }
            setIsLoading(false)
        } catch (error) {
            console.error('Error from get viewed data:', error);
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if (userdetails) {
            getFavouriteData()
        }
    }, [userdetails])

    const handleEndReached = () => {
        if (!isPaginationLoading && hasMoreData) {
            setIsPaginationLoading(true);
            setCurrentPage(prevPage => prevPage + 1);
        }
    }

    useEffect(() => {
        if (currentPage >= 0) {
            getFavouriteData()
        }
    }, [currentPage])

    useEffect(() => {
        if (!isPaginationLoading && currentPage > 0) {
            setIsPaginationLoading(false)
        }
    }, [favourite])

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


    const renderFavourite = ({ item }) => {
        const lastActive = moment(item?.user?.lastActive).fromNow();
        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item?.userId })}>
                    <ImageBackground source={{ uri: item?.targetUser?.profilePicture }} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
                        <LinearGradient colors={["transparent", "rgba(0, 0, 0, 0.7)"]} style={styles.gradientOverlay} />
                        {item.status === "Online" && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Online</Text>
                            </View>
                        )}
                        <View style={styles.overlayContainer}>
                            <Text style={styles.memberName}>{`${item.targetUser?.userName}, ${item?.targetUser?.age}`}</Text>
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
                    <TouchableOpacity style={styles.iconButton}>
                        <Image source={images.chat} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Image source={images.redheart} style={[styles.icon, { height: 20, width: 20 }]} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (


        <View style={styles.main}>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    data={favourite}
                    renderItem={renderFavourite}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    style={{ marginTop: 20 }}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isPaginationLoading && hasMoreData ? (
                        <View style={styles.paginationLoader}>
                            <ActivityIndicator size="small" color="#0000ff" />
                        </View>
                    ) : null}
                />
            )}
        </View>
    )
}


export default FavouriteScreen;

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
    icon: {
        width: 15,
        height: 15,
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