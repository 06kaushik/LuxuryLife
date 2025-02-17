import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, Image, Switch, Dimensions, ScrollView, FlatList, ActivityIndicator
} from "react-native";
import images from "../../../components/images";
import Modal from "react-native-modal";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PhotoVideoPermissions = ({ navigation }) => {
    const [loading, setLoading] = useState(true); // Loader state
    const [blockIncoming1, setBlockIncoming1] = useState(true);
    const [blockIncoming2, setBlockIncoming2] = useState(false);
    const [receiveCalls, setReceiveCalls] = useState(false);
    const [incomingRingtone, setIncomingRingtone] = useState(false);
    const [photosharing, setPhotoSharing] = useState(false);
    const [photovisibility, setPhotoVisibility] = useState(false);
    const [autodownload, setAutoDownload] = useState(false);
    const [privatephoto, setPrivatePhoto] = useState(false);
    const [privatesharing, setPrivateSharing] = useState(false);
    const [videosharing, setVideoSharing] = useState(false);
    const [autoplayback, setAutoPlayBack] = useState(false);
    const [videocallperm, setVideoCallPer] = useState(false);
    const [filesharing, setFileSharing] = useState(false);
    const [multimediaprev, SetMultiMediaPrev] = useState(false);
    const [storageperm, setStoragePerm] = useState(false);
    const [sharingwith, setSharingWith] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [userdetails, setUserDetails] = useState(null);
    const [privatememberlist, setPrivateMemberList] = useState([]);
    const [privatePhotos, setPrivatePhotos] = useState([]);

    const handleImageClick = (images) => {
        setSelectedImages(images);
        setModalVisible(true);
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Show loader
                setLoading(true);
                const userData = await AsyncStorage.getItem('UserData');
                if (!userData) {
                    console.error('User data is missing.');
                    return;
                }

                const parsedData = JSON.parse(userData);
                setUserDetails(parsedData);

                // Fetch private photos
                setPrivatePhotos(parsedData.privatePhotos || []);

                // Fetch private members only if user ID is valid
                if (parsedData?._id) {
                    await getPrivateMember(parsedData._id);
                } else {
                    console.error('User ID is missing. Unable to fetch private members.');
                }
            } catch (error) {
                console.error('Error during initialization:', error.message);
            } finally {
                // Hide loader
                setLoading(false);
            }
        };

        initializeData();
    }, []);


    const handleSharingWithToggle = async (newValue) => {
        setSharingWith(newValue);
        if (newValue === true) {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const headers = {
                    Authorization: token,
                };
                if (!userdetails?._id) {
                    console.error('User ID is missing. Unable to fetch private members.');
                    return;
                }
                const body = {};
                const resp = await axios.put(`account/remove-all-private-pic-access/${userdetails?._id}`, body, { headers });
                console.log('Response from removing all private access:', resp.data);
                await getPrivateMember(userdetails._id);
            } catch (error) {
                console.error('Error from removing all private access:', error?.response?.data?.message || error.message);
            }
        }
    };

    const hidePrivateMember = async (accessId) => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            console.error('Authorization token is missing.');
            return;
        }

        if (!userdetails?._id) {
            console.error('User ID is missing. Unable to fetch private members.');
            return;
        }

        const headers = {
            Authorization: token,
        };
        let body = {
            status: 'Removed'
        }

        try {
            const resp = await axios.put(`account/updated-private-pic-access/${accessId}`, body, { headers });
            console.log('Response from the hide member API:', resp?.data?.data);

            // Call getPrivateMember with the userId
            await getPrivateMember(userdetails._id);
        } catch (error) {
            console.error('Error fetching hide members:', error.response?.data?.message || error.message);
        }
    };


    const getPrivateMember = async (userId) => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            console.error('Authorization token is missing.');
            return;
        }

        const headers = {
            Authorization: token,
        };
        let body = {}

        try {
            const resp = await axios.post(`account/get-private-pic-access/${userId}`, body, { headers });
            // console.log('Response from private member API:', resp?.data?.data);
            setPrivateMemberList(resp?.data?.data || []);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Unknown error';
            console.error(`Error fetching private members: ${message}`);
        }
    };


    const renderMemberList = ({ item: user }) => (
        <View key={user?._id} style={styles.userContainer}>
            <Image
                source={{ uri: user?.targetUserId?.profilePicture }}
                style={{ height: 130, width: 100, borderRadius: 8 }}
            />
            <View>
                <Text style={styles.userName}>{user?.targetUserId?.userName}</Text>
                <Text style={styles.userLocation}>
                    {user?.targetUserId?.city}, {user?.targetUserId?.state}, {user?.targetUserId?.country}
                </Text>
                <View style={styles.photoContainer}>
                    {privatePhotos.slice(0, 2).map((photo, index) => (
                        <Image key={index} source={{ uri: photo }} style={styles.photo} />
                    ))}
                    {privatePhotos.length > 2 && (
                        <TouchableOpacity
                            style={styles.imageButton}
                            onPress={() => handleImageClick(privatePhotos)}
                        >
                            <Text style={styles.imageCount}>+{privatePhotos.length - 2}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.hideButton} onPress={() => hidePrivateMember(user?._id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.closeeye} style={{ height: 18, width: 18, marginRight: 5 }} />
                    <Text style={styles.hideText}>Hide</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#916008" />
            </View>
        );
    }



    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Multimedia and Voice{'\n'}Permissions</Text>
                </View>
            </TouchableOpacity>

            <ScrollView style={{ marginTop: 40 }}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Video Settings</Text>

                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Recieve voice messages</Text>
                        <Switch
                            value={blockIncoming1}
                            onValueChange={() => setBlockIncoming1((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Voice note playback</Text>
                        <Switch
                            value={blockIncoming2}
                            onValueChange={() => setBlockIncoming2((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>

                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>
                            Voice chat requests
                        </Text>
                        <Switch
                            value={receiveCalls}
                            onValueChange={() => setReceiveCalls((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Set incoming ringtone</Text>
                        <Switch
                            value={incomingRingtone}
                            onValueChange={() => setIncomingRingtone((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Photo Settings</Text>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Photo Sharing</Text>
                        <Switch
                            value={photosharing}
                            onValueChange={() => setPhotoSharing((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Profile photo visibility</Text>
                        <Switch
                            value={photovisibility}
                            onValueChange={() => setPhotoVisibility((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Photo auto-download</Text>
                        <Switch
                            value={autodownload}
                            onValueChange={() => setAutoDownload((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Private photo access</Text>
                        <Switch
                            value={privatephoto}
                            onValueChange={() => setPrivatePhoto((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Private photo sharing with</Text>
                        <Switch
                            value={privatesharing}
                            onValueChange={() => setPrivateSharing((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Video Settings</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Video Sharing</Text>
                    <Switch
                        value={videosharing}
                        onValueChange={() => setVideoSharing((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Video auto-playback</Text>
                    <Switch
                        value={autoplayback}
                        onValueChange={() => setAutoPlayBack((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Video call permissions</Text>
                    <Switch
                        value={videocallperm}
                        onValueChange={() => setVideoCallPer((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Other Multimedia{'\n'}Settings</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>File sharing</Text>
                    <Switch
                        value={filesharing}
                        onValueChange={() => setFileSharing((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Multimedia preview</Text>
                    <Switch
                        value={multimediaprev}
                        onValueChange={() => SetMultiMediaPrev((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Storage permissions</Text>
                    <Switch
                        value={storageperm}
                        onValueChange={() => setStoragePerm((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} />
                <View style={styles.toggleContainer}>
                    <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
                        Sharing Private{'\n'}Photos with
                    </Text>
                    <Switch
                        value={sharingwith}
                        onValueChange={(newValue) => handleSharingWithToggle(newValue)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                {privatememberlist.length === 0 ?
                    <View style={styles.photoSection}>
                        <Image source={images.privacy} style={styles.privacyIcon} />
                        <Text style={styles.emptyText}>You haven't shared any private photos.</Text>
                        <Text style={styles.infoText}>
                            Members that you have shared private photos with will display here.
                        </Text>
                    </View>
                    :
                    <FlatList
                        data={privatememberlist}
                        keyExtractor={(item) => item._id}
                        renderItem={renderMemberList}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                }


                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={selectedImages}
                            horizontal
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={styles.modalImage}
                                />
                            )}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>



            </ScrollView>
        </View>
    );
};

export default PhotoVideoPermissions;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 10

    },
    cont: {
        flexDirection: 'row',
        marginTop: 40
    },
    txt: {
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        marginLeft: 12,
        top: 5
    },
    headerText: {
        fontSize: 20,
        fontFamily: "Poppins-Bold",
        color: "black",
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 24,
        fontFamily: "Poppins-Bold",
        color: "black",
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: "black",
        marginBottom: 10,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8,
    },
    toggleText: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "black",
        flex: 1, // Allows wrapping text
    },
    photoSection: {
        alignItems: "center",
        marginTop: 20,
    },
    privacyIcon: {
        height: 60,
        width: 60,
        marginTop: 10,
        marginBottom: 10,
    },
    emptyText: {
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        color: "#000",
        textAlign: "center",
    },
    infoText: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#7B7B7B",
        textAlign: "center",
        marginTop: 5,
        paddingHorizontal: 10,
    },
    userContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
    },
    photoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4, marginLeft: 20
    },
    photo: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginRight: 5,
    },
    imageButton: {
        backgroundColor: "#916008",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: "center",
    },
    imageCount: {
        color: "#FFF",
        fontFamily: "Poppins-Bold",
        fontSize: 12,
    },
    userInfoContainer: {
        flex: 1,
        marginLeft: 10,
    },
    userName: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: "black",
        marginLeft: 20
    },
    userLocation: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#7B7B7B",
        marginLeft: 20
    },
    hideButton: {
        borderWidth: 1,
        height: 36,
        width: 90,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#B8B8B8',
        marginTop: 50,
        right: 30

    },
    hideText: {
        color: "#3C4043",
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        textAlign: 'center',
        top: 1
    },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: {
        width: Dimensions.get("window").width, // Full width of the screen
        height: Dimensions.get("window").height * 0.8, // 80% of screen height
        resizeMode: "contain", // Ensures the image fits without distortion
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: "#916008",
        padding: 10,
        borderRadius: 10,
        bottom: 20
        // marginTop: 20,
    },
    closeText: {
        color: "#FFF",
        fontFamily: "Poppins-Bold",
        fontSize: 14,
    },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
