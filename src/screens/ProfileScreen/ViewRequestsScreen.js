import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList } from "react-native";
import images from "../../components/images";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-simple-toast'


const ViewRequestScreen = ({ navigation }) => {

    const [privatepicrequest, setPrivatePicRequest] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getPrivatePhotoRequest()
    }, [])

    const getPrivatePhotoRequest = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            currentPage: 0
        }
        setIsLoading(true);
        try {
            const resp = await axios.post('account/get-private-pic-access-request', body, { headers })
            console.log('response from the get request', resp?.data?.data?.data);
            setPrivatePicRequest(resp?.data?.data?.data)
            setIsLoading(false);
        } catch (error) {
            console.log('error from get requests', error?.response?.data?.message);
            setIsLoading(false);
        }
    }

    const acceptRequest = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            accessId: id,
            type: 'single',
            status: 'Accepted'
        }
        try {
            const resp = await axios.put('account/updated-private-pic-access-request', body, { headers })
            console.log('respone from the accepted', resp?.data);
            getPrivatePhotoRequest()
            Toast.show('Request Accepted', Toast.SHORT)
        } catch (error) {
            console.log('error from accepted', error.response.data.message);
        }
    }

    const rejectRequest = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            accessId: id,
            type: 'single',
            status: 'Rejected'
        }
        try {
            const resp = await axios.put('account/updated-private-pic-access-request', body, { headers })
            console.log('response from rejected', resp?.data);
            getPrivatePhotoRequest()
            Toast.show('Request Rejected', Toast.SHORT)
        } catch (error) {
            console.log('error from rejected', error?.response?.data?.message)
        }
    }

    const rejectAllRequest = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            accessId: 0,
            type: 'all',
            status: 'Rejected'
        }
        try {
            const resp = await axios.put('account/updated-private-pic-access-request', body, { headers })
            console.log('response from reject all', resp.data);
            getPrivatePhotoRequest()
            Toast.show('All Requested Rejected', Toast.SHORT)
            navigation.goBack('')
        } catch (error) {
            console.log('error from reject all', error?.response.data?.message);
        }
    }

    const acceptAllRequest = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            accessId: 0,
            type: 'all',
            status: 'Accepted'
        }
        try {
            const resp = await axios.put('account/updated-private-pic-access-request', body, { headers })
            console.log('response from reject all', resp.data);
            getPrivatePhotoRequest()
            Toast.show('All Requested Accepted', Toast.SHORT)
            navigation.goBack('')
        } catch (error) {
            console.log('error from reject all', error?.response.data?.message);
        }
    }

    const renderRequest = ({ item }) => {
        return (
            <View style={{
                borderWidth: 1,
                height: 80,
                width: '90%',
                alignSelf: 'center',
                borderRadius: 5,
                borderColor: '#D9D9D9',
                padding: 10,
                justifyContent: 'center',
                marginTop: 20
            }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={{ uri: item?.targetUserId?.profilePicture }} style={{ height: 60, width: 60, borderRadius: 30, marginRight: 10 }} />
                        <View style={{ marginTop: 5 }}>
                            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16, color: '#000', }}>{item?.targetUserId?.userName}, {item?.targetUserId?.age}</Text>
                            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 14, color: '#7B7B7B' }}>{item?.targetUserId?.city},{item?.targetUserId?.country}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: '#7B7B7B', marginBottom: 5 }}>2 hours</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => rejectRequest(item?._id)} style={{ marginRight: 10, borderWidth: 1, height: 30, width: 30, justifyContent: 'center', borderRadius: 100, backgroundColor: 'black', borderColor: 'black' }}>
                                <Image source={images.cross} style={{ height: 15, width: 15, alignSelf: 'center', tintColor: 'white' }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => acceptRequest(item?._id)} style={{ borderWidth: 1, height: 30, width: 30, justifyContent: 'center', borderRadius: 100, backgroundColor: "#916008", borderColor: "#916008" }}>
                                <Image source={images.tick1} style={{ height: 20, width: 20, alignSelf: 'center', tintColor: 'white' }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }


    return (
        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack("")}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.back} />
                    <Text style={styles.txt}>Request Private Photos</Text>
                </View>
            </TouchableOpacity>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    data={privatepicrequest}
                    renderItem={renderRequest}
                />

            )}


            <View style={styles.bottomButtons}>
                <TouchableOpacity onPress={() => rejectAllRequest()} style={styles.rejectButton}>
                    <Text style={[styles.buttonText, { color: 'black' }]}>Reject All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => acceptAllRequest()} style={styles.acceptButton}>
                    <Text style={styles.buttonText}>Accept All</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ViewRequestScreen;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white",
    },
    back: {
        height: 20,
        width: 20,
        marginTop: 10,
    },
    cont: {
        marginRight: 20,
        marginLeft: 20,
        marginTop: 30,
        flexDirection: "row",
    },
    txt: {
        color: "black",
        marginLeft: 10,
        fontFamily: "Poppins-Medium",
        fontSize: 20,
        marginTop: 5

    },
    cont1: {
        marginTop: 40,
        flex: 1,
    },
    bottomButtons: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        alignItems: "center",
    },
    rejectButton: {
        borderWidth: 1,
        height: 50,
        width: "90%",
        borderRadius: 100,
        borderColor: "#D9D9D9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        backgroundColor: "white",
    },
    acceptButton: {
        borderWidth: 1,
        height: 50,
        width: "90%",
        borderRadius: 100,
        borderColor: "#916008",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#916008",
    },
    buttonText: {
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        color: "white",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
});
