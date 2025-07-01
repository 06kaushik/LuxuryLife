import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator, Dimensions } from 'react-native'
import images from "../../components/images";
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import useSocket from "../../socket/SocketMain";
import { useIsFocused } from '@react-navigation/native';
import RBSheet from "react-native-raw-bottom-sheet";
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from "../../components/GlobalStyle";
import Toast from 'react-native-simple-toast'
import Modal from "react-native-modal";
import LottieView from "lottie-react-native";




const { width, height } = Dimensions.get('window')

const FavouriteScreen = ({ navigation, index }) => {

    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [userdetails, setUserDetails] = useState(null);
    // console.log('user detaulss', userdetails?.location?.coordinates[0]);

    const [favourite, setFavourite] = useState([]);
    const { emit, on, removeListener, once } = useSocket(onSocketConnect);
    const isFocused = useIsFocused();
    const rbSheetRef = useRef();
    const [sortingOption, setSortingOption] = useState('Last Active');
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", description: "", action: "" });
    const [hasSeenHideModal, setHasSeenHideModal] = useState(false);


    const closeModal = () => {
        setModalVisible(false);
    };

    useEffect(() => {
        if (isFocused) {
            getFavouriteData();
        }
    }, [isFocused]);

    const handleAction = async () => {
        if (modalContent.action === "Hide" && modalContent.targetUserId) {
            await setHideModalSeen();
            await userHide(modalContent.targetUserId);
        }
        closeModal();
    };


    useEffect(() => {
        AsyncStorage.getItem('hasSeenHideModal').then(val => {
            if (val === 'true') setHasSeenHideModal(true);
        });
    }, []);

    const setHideModalSeen = async () => {
        await AsyncStorage.setItem('hasSeenHideModal', 'true');
        setHasSeenHideModal(true);
    };

    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };

    useEffect(() => {
        if (index === 1) { // Newest tab is selected
            getFavouriteData()
        }
    }, [index]);

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
            currentPage: 0,
            pageLength: 100,
            where: {
                longitude: userdetails?.location?.coordinates[0],
                latitude: userdetails?.location?.coordinates[1],
            },
            sortBy: sortingOption === 'Last Active' ? 'lastActive' : sortingOption === 'Distance' ? 'distance' : 'timestamp',


        };
        setIsLoading(true)
        // console.log('body of favo', body);

        try {
            const resp = await axios.post(`home/get-my-favorite`, body, { headers });
            // console.log('response from the favourite', resp?.data);

            setFavourite(resp?.data?.data.map((item) => ({
                ...item,
                localLiked: true // ✅ Always true for favourites list
            })));

            setIsLoading(false)
        } catch (error) {
            console.error('Full error from get favourite screen data:', error?.response?.data || error.message || error);
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
            console.log('response from the HIDE in fav', resp?.data);
            Toast.show('User Hide Succuessfully', Toast.SHORT)
            getFavouriteData()
        } catch (error) {
            console.log('error from the hde api ', error.response.data.message);
        }
    }

    const userLike = async (id) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const body = {
            targetUserId: id,
            action: "LIKE"
        };

        // update UI immediately
        setFavourite(prev =>
            prev.map(item => item.userId === id ? { ...item, localLiked: true } : item)
        );

        try {
            await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers });
        } catch (error) {
            console.log('error from the like ', error);
        }
    };

    const userDisLike = async (id) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const body = {
            targetUserId: id,
            action: "UNLIKE"
        };

        // update UI immediately
        setFavourite(prev =>
            prev.map(item => item.userId === id ? { ...item, localLiked: false } : item)
        );

        try {
            await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers });
        } catch (error) {
            console.log('error from the like ', error);
        }
    };

    const handleChatPress = (item) => {
        try {
            emit("checkRoom", {
                users: { participantId: item?.userId, userId: userdetails?._id },
            });

            removeListener('roomResponse');
            once('roomResponse', (response) => {
                const roomId = response?.roomId;

                emit('initialMessages', {
                    userId: userdetails?._id,
                    roomId,
                });

                removeListener('initialMessagesResponse');
                once('initialMessagesResponse', (response) => {
                    const messages = response?.initialMessages || [];

                    navigation.navigate('OneToOneChatNav', {
                        roomId,
                        initialMessages: messages,
                        userName: item?.targetUser?.userName,
                        profilepic: item?.targetUser?.profilePicture,
                        id: item?.userId,
                    });
                });
            });
        } catch (error) {
            console.log('error from navigatuo to one to one ', error);
        }
    };


    const renderFavourite = ({ item }) => {
        // console.log('item of favouriteee', item);

        const lastActive = moment(item?.activityLog?.timestamp).fromNow();
        const hasLiked = item.localLiked;
        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item?.userId })}>
                    <ImageBackground source={{ uri: item?.targetUser?.profilePicture }} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
                        <LinearGradient colors={["transparent", "rgba(0, 0, 0, 0.7)"]} style={styles.gradientOverlay} />
                        {item?.targetUser?.subscriptionsType ? (
                            item?.targetUser?.subscriptionsType === 'Gold' ? (
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
                            ) : item?.targetUser?.subscriptionsType === 'Luxury' ? (
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

                        {item?.targetUser?.isOnLine && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Online</Text>
                            </View>
                        )}
                        <View style={styles.overlayContainer}>
                            <Text style={styles.memberName}>{`${item.targetUser?.userName.charAt(0).toUpperCase() + item.targetUser?.userName.slice(1)}, ${item?.targetUser?.age}`}</Text>
                            <Text style={styles.memberLocation}>{item.city}, {item?.country}</Text>
                            <Text style={styles.memberDistance}>
                                {item?.distance === null || item?.distance === 0 ? 1 : item.distance} mile away
                            </Text>

                        </View>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={styles.timeAgo}>{lastActive}</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        onPress={() => {
                            if (!hasSeenHideModal) {
                                setModalContent({
                                    title: "Are you sure you want to Hide this member?",
                                    description: "This member will be hidden. You can undo this anytime in your Account Settings > Hidden Member Section.",
                                    action: "Hide",
                                    targetUserId: item?.userId,
                                });
                                setModalVisible(true);
                            } else {
                                userHide(item?.userId);
                            }
                        }}
                        style={styles.unhideButton}
                    >

                        <Text style={styles.unhideText}>Hide</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleChatPress(item)}>
                        <Image source={images.chat} style={[styles.icon, { height: 18, width: 18 }]} />
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

            <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => rbSheetRef.current?.open()}>
                    <RBSheet
                        ref={rbSheetRef}
                        height={180}
                        openDuration={250}
                        closeOnDragDown={true}
                        customStyles={{
                            container: {
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                            },
                            draggableIcon: {
                                backgroundColor: "#C4C4C4",
                            },
                        }}
                    >
                        <View style={{ marginTop: 20 }}>
                            <TouchableOpacity style={styles.sheetOption} onPress={() => { setSortingOption('Last Active'); getFavouriteData(); rbSheetRef.current?.close(); }}>
                                <Text style={styles.sortxt}>Last Active</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sheetOption} onPress={() => { setSortingOption('Distance'); getFavouriteData(); rbSheetRef.current?.close(); }}>
                                <Text style={styles.sortxt}>Distance</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sheetOption} onPress={() => { setSortingOption('When Viewed Me'); getFavouriteData(); rbSheetRef.current?.close(); }}>
                                <Text style={styles.sortxt}>When Viewed Me</Text>
                            </TouchableOpacity>
                        </View>
                    </RBSheet>
                    <Image source={images.menu} style={{ height: 25, width: 25, marginRight: 10 }} />
                </TouchableOpacity>
                <Text style={{}}>Sorted By: <Text style={{ color: 'black', fontFamily: 'Poppins-SemiBold' }}>{sortingOption}</Text></Text>
            </View>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LottieView
                        source={require('../../assets/loaderr.json')}
                        autoPlay
                        loop
                        style={{ width: 50, height: 50 }}
                    />
                </View>
            ) : favourite.length === 0 ? (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>Hurry! Your Favorites list is empty. Start adding people you like!</Text>
                    <Text style={styles.noDataDescription}>Save your favorites! Profiles you add will appear here for quick access.</Text>
                </View>
            ) : (
                <FlatList
                    data={favourite}
                    renderItem={renderFavourite}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    removeClippedSubviews={false}
                    style={{ marginTop: 20 }}
                // onEndReached={handleEndReached}
                // onEndReachedThreshold={0.5}
                // ListFooterComponent={isPaginationLoading && hasMoreData ? (
                //     <View style={styles.paginationLoader}>
                //         <ActivityIndicator size="small" color="#0000ff" />
                //     </View>
                // ) : null}
                />
            )}

            <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{modalContent.title}</Text>
                    <Text style={styles.modalDescription}>{modalContent.description}</Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.blockButton]}
                            onPress={handleAction}
                        >
                            <Text style={[styles.modalButtonText, styles.blockButtonText]}>
                                {modalContent.action.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
        width: '45%',
        margin: 8,
        borderRadius: 10,
        backgroundColor: "#FFF",
        overflow: "hidden",
        // height: height * 0.3,
    },
    imageBackground: {
        width: "100%",
        height: 230,
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
        fontSize: 25,
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
        fontFamily: POPPINSRFONTS.regular,
        fontSize: 14,
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
    sheetOption: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E2E9',
    },
    sortxt: {
        color: "black",
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold'
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    noDataText: {
        fontFamily: 'Playfair_9pt-SemiBold',
        fontSize: 24,
        color: '#333',
        textAlign: 'center'
    },
    noDataDescription: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#7A7A7A',
        marginTop: 5,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    iconButton: {
        borderWidth: 1,
        borderColor: '#E0E2E9',
        borderRadius: 100,
        height: 36,
        width: 36,
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        height: 350,
        width: "90%",
        alignSelf: "center",
    },
    modalTitle: {
        fontFamily: "Poppins-Medium",
        fontSize: 24,
        color: "black",
        textAlign: "center",
    },
    modalDescription: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#3C4043",
        textAlign: "center",
        marginVertical: 20,
    },
    modalButtonContainer: {
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
    },
    modalButton: {
        height: 47,
        width: "80%",
        borderWidth: 1,
        borderColor: "#E0E2E9",
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
        marginVertical: 5,
    },
    modalButtonText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: "#3C4043",
    },
    blockButton: {
        backgroundColor: "#916008",
        borderColor: "#916008",
    },
    blockButtonText: {
        color: "white",
    },
})