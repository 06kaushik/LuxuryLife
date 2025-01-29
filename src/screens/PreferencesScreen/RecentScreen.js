import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ImageBackground, Dimensions, ActivityIndicator } from 'react-native'
import images from "../../components/images";
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width, height } = Dimensions.get('window');

const RecentScreen = ({ navigation }) => {

    const [userData, setUserData] = useState([])
    const [filterdata, setFilterData] = useState(null)
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [userdetails, setUserDetails] = useState(null)



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
                console.log('Error fetching user data:', error);
            }
        };
        fetchUserDetails();
    }, []);



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
            pageLength: 2000,
            currentPage: 0,
            autopopulate: true,
            requestSource:'list'
        };
        console.log('body of recent', body)
        setIsLoading(true);
        try {
            const resp = await axios.post('home/search', body, { headers });
            console.log('response from the search API', resp?.data?.data.length);
            setUserData(resp?.data?.data);
            setIsLoading(false);
        } catch (error) {
            console.log('error from the search API', error.response?.data?.message || error);
            setIsLoading(false);
        }
    };




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
            getUserFilteredData()

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
            getUserFilteredData()

        } catch (error) {
            console.log('error from the like ', error);
        }
    }



    const renderNewest = ({ item }) => {
        const hasLiked = item.activity_logs.some(log => log.action === "LIKE" && log.userId === userdetails?._id);
        const truncatedUserName = item.userName.length > 8 ? item.userName.slice(0, 8) : item.userName;
        return (
            <View style={styles.card} >
                <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item })}>
                    <ImageBackground source={{ uri: item?.profilePicture }} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
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
                            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                <View>
                                    <Text style={styles.memberName} numberOfLines={2} ellipsizeMode="tail">
                                        {`${truncatedUserName}, ${item.age}`}
                                    </Text>
                                    <Text style={styles.memberLocation}>{item.city}</Text>
                                    <Text style={styles.memberDistance}>{item.distance}</Text>
                                </View>
                                <View style={{}}>
                                    <TouchableOpacity style={{ borderWidth: 1, borderColor: '#E0E2E9', borderRadius: 100, height: 30, width: 30, justifyContent: 'center', backgroundColor: 'white' }}>
                                        <Image source={images.chat} style={styles.icon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => hasLiked ? userDisLike(item?.userId) : userLike(item?.userId)}
                                        style={{ borderWidth: 1, borderColor: '#E0E2E9', borderRadius: 100, height: 30, width: 30, justifyContent: 'center', backgroundColor: 'white', top: 5 }}
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
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    data={userData}
                    renderItem={renderNewest}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    style={{ marginTop: 20 }}

                />
            )}
        </View>
    )
}

export default RecentScreen

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
        width: width * 0.4,
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
