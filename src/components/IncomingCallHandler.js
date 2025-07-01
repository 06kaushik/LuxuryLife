import { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TouchableWithoutFeedback,Vibration } from 'react-native';
import useSocket from '../socket/SocketMain';
import { useNavigation } from '@react-navigation/native';
import images from './images';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';
import Modal from 'react-native-modal';
import InCallManager from 'react-native-incall-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './UserContext';


const IncomingCallHandler = ({ }) => {

    const [incomingCall, setIncomingCall] = useState(null);
    const { on, emit, removeListener, socketId } = useSocket(() => { });
    const navigation = useNavigation();
    const timeoutRef = useRef(null);
    const vibrationPattern = [0, 500, 1000];
    const ringtoneRef = useRef(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [otheruserprofiledata, setOtherUserProfileData] = useState()
    const { userdetails, userprofiledata } = useContext(UserContext);
    const userId = userdetails?._id;
    const [shouldShowModal, setShouldShowModal] = useState(
        !userprofiledata?.isSubscribed &&
        (userprofiledata?.gender === 'Male' || userprofiledata?.gender === 'Non-binary' || (userprofiledata?.gender === 'Female' && otheruserprofiledata?.gender === 'Female'))
    );


    useEffect(() => {
        setShouldShowModal(
            !userprofiledata?.isSubscribed &&
            (userprofiledata?.gender === 'Male' || userprofiledata?.gender === 'Non-binary' || (userprofiledata?.gender === 'Female' && otheruserprofiledata?.gender === 'Female'))
        );
    }, [incomingCall]);


    useEffect(() => {
        const handleCallEnded = (data) => {
            //('response from the call ended in incomimgvideo call handler ', data);
            stopRingtone();
            setIncomingCall(null);
        };
        on('callEnded', handleCallEnded);

        return () => removeListener('callEnded', handleCallEnded);
    }, [socketId, on, removeListener]);


    const getOtherUserProfileData = async (userId) => {

        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        try {
            const resp = await axios.get(`home/get-user-profile/${userId}`, { headers });
            setOtherUserProfileData(resp?.data?.data);
        } catch (error) {
            //('error frm the user profile', error?.response?.data?.message || error.message);
        }
    };

    const playRingtone = () => {
        InCallManager.startRingtone('_DEFAULT_');
        Vibration.vibrate(vibrationPattern, true);
    };

    const stopRingtone = () => {
        InCallManager.stopRingtone();
        Vibration.cancel();
    };

    useEffect(() => {
        const handleIncomingCall = (data) => {
            // //('dataa from the incoming call', data);

            if (data?.callType === 'video') {
                getOtherUserProfileData(data?.userId)
                setIncomingCall(data);
                playRingtone();
                timeoutRef.current = setTimeout(() => {
                    // console.log('⏰ Auto-rejecting call after 60 seconds');
                    emit('end-video-call', {
                        roomId: data.roomId,
                        from: userId,
                        logId: data?.logId
                    });
                    stopRingtone();
                    setIncomingCall(null);
                }, 30000); // 60 seconds
            }
        };

        on('videoCallRequest', handleIncomingCall);
        return () => {
            removeListener('videoCallRequest', handleIncomingCall);
            stopRingtone();
        };
    }, [on, socketId]);

    const acceptCall = () => {
        if (shouldShowModal) {
            setIsModalVisible(true)
            return;
        }
        clearTimeout(timeoutRef.current);
        stopRingtone();
        emit('accept-video-call', {
            to: incomingCall.userId,
            roomId: incomingCall.roomId,
            logId: incomingCall?.logId,
            fromSocketId: socketId
        });
        // //('join room ', incomingCall.roomId, userId);

        emit('join-room', { roomId: incomingCall.roomId, userId })
        setIncomingCall(null);
        navigation.navigate('IncomingVideoCall', {
            selectedUser: incomingCall.userId,
            videoRoomId: incomingCall.roomId,
            userId: userId,
            logId: incomingCall?.logId,

        });
        //('incoming call after navigation ', incomingCall);
    };


    // useEffect(() => {
    //     on('user-connected', (data) => {
    //         console.log('userconnected in incoming video', data);

    //     })
    // }, [socketId])

    useEffect(() => {
        const handleUserConnected = (data) => {
            console.log('dataa of call connected ', data);
            // console.log(data, userdetails?._id);


            if (data === userId) {
                console.log('🧹 Clearing UI from IncomingCallHandler because user joined on another device', data === userId);
                stopRingtone();
                setIncomingCall(null);
            }
        };

        on('user-connected', handleUserConnected);
        return () => removeListener('user-connected', handleUserConnected);
    }, [socketId, userId, incomingCall]);



    const rejectCall = () => {
        clearTimeout(timeoutRef.current)
        emit('end-video-call', {
            roomId: incomingCall.roomId,
            from: userId,
            logId: incomingCall?.logId
        });
        stopRingtone();
        setIncomingCall(null);
    };


    if (!incomingCall) return null;


    return (
        <View style={styles.callOverlay}>
            <View style={styles.innerRow}>
                <Image source={{ uri: incomingCall?.userDetails?.profilePicture }} style={styles.avatar} />
                <View style={styles.textContainer}>
                    <Text style={styles.callText}>Incoming Video Call</Text>
                    <Text style={styles.callerName}>{incomingCall?.userDetails?.userName}</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.accept} onPress={acceptCall}>
                        <LottieView
                            source={require('../assets/videocall.json')}
                            autoPlay
                            loop
                            style={styles.lottieIcon}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reject} onPress={rejectCall}>
                        <Image source={images.hang} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <Modal isVisible={isModalVisible} style={styles.modal}>
                <View style={styles.overlay}>
                    <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.closeButton, { borderColor: 'white' }]}>
                        <Image source={images.cross} style={[styles.closeIcon, { tintColor: 'white' }]} />
                    </TouchableOpacity>
                    {userprofiledata?.country === 'India' ?
                        <TouchableWithoutFeedback onPress={() => {
                            setIsModalVisible(false);
                            navigation.navigate('RazorPay');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableWithoutFeedback>
                        :
                        <TouchableWithoutFeedback onPress={() => {
                            setIsModalVisible(false);
                            navigation.navigate('Paypal');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableWithoutFeedback>}
                </View>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    callOverlay: {
        position: 'absolute',
        top: 10,
        backgroundColor: '#1c1205',
        borderRadius: 50,
        zIndex: 9999,
        height: 80,
        justifyContent: 'center',
        paddingHorizontal: 10,
        elevation: 5,
        width: '95%',
        alignSelf: "center"
    },
    innerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatar: {
        height: 55,
        width: 55,
        borderRadius: 27.5,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    callText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    callerName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginLeft: 10,
    },
    accept: {
        backgroundColor: 'green',
        borderRadius: 25,
        height: 45,
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reject: {
        backgroundColor: 'red',
        borderRadius: 25,
        height: 45,
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
    lottieIcon: {
        width: 80,
        height: 80,
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    overlay: {
        // flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        margin: 0,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
        borderWidth: 1,
        height: 30,
        width: 30,
        justifyContent: 'center',
        borderRadius: 100
    },
    closeIcon: {
        height: 17,
        width: 17,
        alignSelf: 'center'
    },

});


export default IncomingCallHandler;
