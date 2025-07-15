import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, Text, Keyboard, FlatList, Alert, TouchableWithoutFeedback, Dimensions } from 'react-native';
import images from '../../components/images';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSocket from '../../socket/SocketMain';
import io from 'socket.io-client';
import axios from 'axios';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Toast from 'react-native-simple-toast'
import { GARAMOND, POPPINSRFONTS } from '../../components/GlobalStyle';
import analytics from '@react-native-firebase/analytics';
import { UserContext } from '../../components/UserContext';
import * as Clarity from '@microsoft/react-native-clarity';



const OneToOneChatFromNav = ({ navigation, route }) => {
    const { roomId, initialMessages, item, useronline, userName, profilepic, id } = route.params;
    // console.log('userprofile data', otheruserprofiledata);

    const rbSheetRef = useRef();
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [inputHeight, setInputHeight] = useState(40);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(initialMessages);
    const [isRecording, setIsRecording] = useState(false);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [userdetails, setUserDetails] = useState(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const flatListRef = useRef();
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const [fileid, setFileId] = useState(null)
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const { emit, on, removeListener, socketId, once } = useSocket(onSocketConnect);
    const [privatePicRequestStatus, setPrivatePicRequestStatus] = useState('pending' || 'accepted' || 'rejected')
    const requestPic = item?.participantId?.profilePicture
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const isFocused = useIsFocused()
    const [contentHeight, setContentHeight] = useState(0);
    const [ispremiumuser, setIsPremiumUser] = useState(userprofiledata?.isSubscribed || (userprofiledata?.gender === 'Female' && otheruserprofiledata?.gender !== 'Female'))
    const [isModalVisible1, setIsModalVisible1] = useState(false);
    const [isModalVisible2, setIsModalVisible2] = useState(false);
    const [otheruserprofiledata, setOtherUserProfileData] = useState()
    const { userprofiledata, setUserProfileData } = useContext(UserContext)
    const [shouldShowModal, setShouldShowModal] = useState(false);
    // const [shouldShowModal, setShouldShowModal] = useState(
    //     !userprofiledata?.isSubscribed &&
    //     (userprofiledata?.gender === 'Male' || userprofiledata?.gender === 'Non-binary' || (userprofiledata?.gender === 'Female' && otheruserprofiledata?.gender === 'Female'))
    // );

    useEffect(() => {
        setShouldShowModal(
            !userprofiledata?.isSubscribed &&
            (userprofiledata?.gender === 'Male' || userprofiledata?.gender === 'Non-binary' ||
                (userprofiledata?.gender === 'Female' && otheruserprofiledata?.gender === 'Female'))
        );
    }, [userprofiledata, otheruserprofiledata]);


    const onSocketConnect = () => {
    };

    useFocusEffect(
        React.useCallback(() => {
            if (roomId && userdetails?._id) {
                emit("initialMessages", {
                    userId: userdetails._id,
                    roomId: roomId,
                });

                once("initialMessagesResponse", (res) => {
                    setMessages(res?.initialMessages || []);
                });
            }
        }, [roomId, userdetails?._id])
    );

    const getUserProfileData = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const resp = await axios.get('auth/user-profile', {
                headers: { Authorization: token },
            });
            setUserProfileData(resp?.data?.data);
        } catch (error) {
            console.log('Error fetching user profile:', error?.response?.data?.message);
        } finally {
            setLoadingProfile(false); // ✅ Correct loader for user profile
        }
    };

    const getOtherProfileData = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const headers = { Authorization: token };
            const resp = await axios.get(`home/get-user-profile/${item?.participantId?._id || id}`, { headers });
            setOtherUserProfileData(resp?.data?.data);
        } catch (error) {
            console.log('Error fetching other user profile:', error?.response?.data?.message);
        } finally {
            setLoadingMessages(false);
        }
    };


    const handleVideoCallClick = () => {
        if (shouldShowModal) {
            setIsModalVisible(true)
            return;
        }
        console.log('in the video buttton function');

        // Emit the video call request to the server
        emit('request-video-call', {
            roomId: roomId,
            to: item?.participantId?._id || id,
            from: userprofiledata?._id,
            callType: 'video',
        });

        emit('join-room', { roomId: roomId, userId: userdetails?._id })

        // Navigate to the VideoCall screen
        navigation.navigate('VideoCall', {
            userId: userprofiledata?._id,  // or use userId if that's what you need
            selectedUser: item?.participantId?._id || id,
            videoRoomId: roomId,
            callType: 'video',
        });
    };

    const handleAudioCallClick = () => {
        if (shouldShowModal) {
            setIsModalVisible(true)
            return;
        }
        console.log('in the video buttton function');

        // Emit the video call request to the server
        emit('request-video-call', {
            roomId: roomId,
            to: item?.participantId?._id || id,
            from: userprofiledata?._id,
            callType: 'audio',
        });
        emit('join-room', { roomId: roomId, userId: userdetails?._id })

        // Navigate to the VideoCall screen
        navigation.navigate('AudioCall', {
            userId: userprofiledata?._id,  // or use userId if that's what you need
            selectedUser: item?.participantId?._id || id,
            videoRoomId: roomId,
            callType: 'audio',
            profilePicture: item?.participantId?.profilePicture || profilepic,
            userName: item?.participantId?.userName.charAt(0).toUpperCase() + item?.participantId?.userName?.slice(1) || userName?.charAt(0).toUpperCase() + userName?.slice(1)
        });
    };

    useEffect(() => {
        setShouldShowModal(
            !userprofiledata?.isSubscribed &&
            (userprofiledata?.gender === 'Male' || userprofiledata?.gender === 'Non-binary' || (userprofiledata?.gender === 'Female' && otheruserprofiledata?.gender === 'Female'))
        );
    }, [userprofiledata, otheruserprofiledata]);


    useEffect(() => {
        if (isFocused) {
            // Reset loading state when screen is focused again
            setLoadingProfile(true);
            setLoadingMessages(true);

            // Then fetch latest data
            getUserProfileData();
            getOtherProfileData();
        }
    }, [isFocused]);

    useEffect(() => {
        if (userdetails?._id) {
            getUserProfileData();
        }
    }, [userdetails]);

    const scrollToBottom = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    useEffect(() => {
        if (contentHeight > 0) {
            scrollToBottom();
        }
    }, [contentHeight, messages?.length]);


    useEffect(() => {
        setIsPremiumUser(userprofiledata?.isSubscribed || (userprofiledata?.gender === 'Female' && otheruserprofiledata?.gender !== 'Female'))
    }, [userprofiledata, otheruserprofiledata])


    const showImageModal = (uri) => {
        setSelectedImageUri(uri);
        setIsImageModalVisible(true);
    };

    const hideImageModal = () => {
        setIsImageModalVisible(false);
        setSelectedImageUri(null);
    };

    useEffect(() => {
        on('readAllMessagesResponse', (event) => {
            if (event?.roomId === roomId) {
                // When the roomId from event matches the current roomId
                setMessages(prevMessages => {
                    return prevMessages.map(message => {
                        if (message.roomId === roomId) {
                            return {
                                ...message,
                                isRead: true,
                                isDelivered: true,
                                tick: images.bluetick,
                            };
                        }
                        return message;
                    });
                });
            } else {
                setMessages(prevMessages => {
                    return prevMessages.map(message => {
                        if (item?.participantId?._id || id === useronline) {
                            return {
                                ...message,
                                isRead: false,
                                isDelivered: true,
                                tick: images.doubletick,
                            };
                        }
                        return message;
                    });
                });
            }
        });

        return () => {
            removeListener('readAllMessagesResponse');
        };
    }, [roomId, on, removeListener, useronline]);

    useEffect(() => {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        const newTypingTimeout = setTimeout(() => {
            emit('typing', {
                senderId: userdetails?._id,
                receiverId: item?.participantId?._id || id,
            });
        }, 500);

        setTypingTimeout(newTypingTimeout);
    }, [message]);

    useEffect(() => {
        const typingIndicatorTimeout = setInterval(() => {
            if (isTyping) {
                setIsTyping(false);
                clearInterval(typingIndicatorTimeout);
            }
        }, 3000);

        on('typingResponse', (data) => {
            if (data?.response?.message !== null) {
                setIsTyping(true);
                clearInterval(typingIndicatorTimeout);
            } else {
                setIsTyping(false);
            }
        });

        return () => {
            removeListener('typingResponse');
            clearInterval(typingIndicatorTimeout);
        };
    }, [isTyping]);


    // useEffect(() => {
    //     emit("checkRoom", { users: { participantId: item?.participantId?._id, userId: userdetails?._id } });
    // }, [emit])

    // useEffect(() => {
    //     on('readAllMessagesResponse', (event) => {
    //         console.log('response from the read akk messages', event);
    //     })
    // }, [initialMessages])



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

    // useEffect(() => {
    //     if (userprofiledata?._id) { 
    //         emit("userOnline", { userId: userprofiledata._id });
    //     }
    // }, [userprofiledata, emit]);


    useEffect(() => {
        return () => {
            clearInterval(intervalId);
        };
    }, [intervalId]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        AudioRecord.init({
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            audioSource: 6,
            wavFile: 'audio.wav',
        });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        on('messageResponse', (response) => {
            console.log('Message response received:');
            if (response?.result) {
                console.log('Current messages:', response?.result);
                console.log('New message:');
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages, response.result];
                    console.log('Updated messages:');
                    return updatedMessages;
                });
            }
        });

        return () => {
            removeListener('messageResponse');
        };
    }, [on]);

    useEffect(() => {
        if (audioFile !== null) {
            sendMessage();
        }
    }, [audioFile]);

    useEffect(() => {
        if (fileid !== null) {
            sendMessage();
        }
    }, [fileid])


    const sendMessage = async () => {
        await analytics().logEvent('message_sendingStarting');
        await Clarity.sendCustomEvent('message_sendingStarting')
        if (!message.trim() && !audioFile && !fileid) {
            return;
        }
        try {
            let data = {
                roomId: roomId,
                senderId: userdetails?._id,
                receiverId: item?.participantId?._id || id,
                message: message,
                messageType: 'text',
                userAgentSent: null,
                files: [],
            };

            if (fileid) {
                data.messageType = 'image';
                data.files = [fileid];
            }
            if (audioFile) {
                data.messageType = 'audio';
                data.files = [audioFile]
            }

            console.log('Data being sent:', data);
            emit('message', data);

            // Reset states after sending the message
            setMessage('');
            setAudioFile(null);
            setFileId(null);
        } catch (error) {
            console.log('sendMessage error:', error);
        }
    };

    const handleContentSizeChange = (contentWidth, contentHeight) => {
        if (contentHeight <= 100) {
            setInputHeight(contentHeight);
        } else {
            setInputHeight(100);
        }
    };

    const uploadImageToServer = async (imageUri) => {
        const token = await AsyncStorage.getItem('authToken');
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            const response = await axios.post('file/upload', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = response?.data.data?._id;
            console.log('Uploaded photo URL:', uploadedUrl);
            return uploadedUrl;
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to upload image. Please try again later.');
        }
    };

    const handlePhotoSelection = async () => {
        if (shouldShowModal) {
            setIsModalVisible(true);
            return;
        }

        const options = {
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 1,
        };

        launchImageLibrary(options, (response) => {
            if (!response.didCancel && !response.errorCode && response.assets) {
                const imageUri = response.assets[0].uri;
                setPreviewImage(imageUri);
                setIsPreviewVisible(true); // Show the preview
            } else if (response.errorCode) {
                console.error('Image selection error:', response.errorCode);
            }
        });
    };


    const handleTakeSelfie = async () => {
        if (shouldShowModal) {
            setIsModalVisible(true)
            return;
        }
        const options = {
            mediaType: 'photo',
            cameraType: 'front',
            saveToPhotos: true,
            quality: 1,
        };

        launchCamera(options, async (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const imageUri = response.assets[0].uri;
                setPreviewImage(imageUri);
                setIsPreviewVisible(true);
            } else if (response.errorCode) {
                console.error('Selfie selection error:', response.errorCode)
            }
        });
    };


    const startRecording = () => {
        if (shouldShowModal) {
            setIsModalVisible(true)
            return;
        }
        setIsRecording(true);
        AudioRecord.start();
    };

    const stopRecording = async () => {
        setIsRecording(false);
        const audioFilePath = await AudioRecord.stop();

        try {
            // Upload the audio file to the server and get the file ID
            const fileId = await uploadAudioToServer(audioFilePath);
            console.log('Audio file uploaded with ID:', fileId);
            setAudioFile(fileId);
        } catch (error) {
            console.error('Error uploading audio file:', error);
        }
    };

    const uploadAudioToServer = async (audioFilePath) => {
        const token = await AsyncStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('file', {
            uri: `file://${audioFilePath}`,
            name: `audio_${Date.now()}.wav`,
            type: 'audio/wav',
        });


        try {
            const response = await axios.post('file/upload', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const fileId = response?.data?.data?._id;

            return fileId;
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error.message);
            if (error.response) {
                console.log('Response Error:', error.response);
            }
            throw error; // Re-throw to handle in the calling function
        }
    };




    const playAudio = (messageId) => {
        if (isPlaying && playingMessageId === messageId) return;

        setPlayingMessageId(messageId);
        setIsPlaying(true);

        const soundMessage = messages.find(msg => msg._id === messageId);
        const audioUri = soundMessage?.files?.[0]?.url;

        if (audioUri) {
            const newSound = new Sound(audioUri, '', (err) => {
                if (err) {
                    console.log('Failed to load the sound', err);
                } else {
                    setSound(newSound); // ✅ Store the sound globally
                    newSound.play((success) => {
                        setIsPlaying(false);
                        setPlayingMessageId(null);
                        newSound.release();
                    });
                }
            });
        }
    };


    const stopAudio = () => {
        if (sound) {
            sound.stop(() => {
                console.log('Stopped playback');
            });
            sound.release();
            setSound(null);
            setIsPlaying(false);
            setPlayingMessageId(null);
        }
    };


    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options);
    };

    const handleAcceptPicRequest = async (senderId) => {
        emit('picRequestEvent', {
            receiverId: userdetails?._id,
            targetUserId: senderId,
            status: 'Accepted',
        });
        setPrivatePicRequestStatus('accept')
    };

    const handleRejectPicRequest = async (senderId) => {
        emit('picRequestEvent', {
            receiverId: userdetails?._id,
            targetUserId: senderId,
            status: 'Rejected',
        });
        setPrivatePicRequestStatus('reject')
    };

    useEffect(() => {
        if (!userdetails?._id || !item?.participantId?._id) return;

        const getRequestDetailStatus = async () => {
            const token = await AsyncStorage.getItem('authToken');
            const headers = { Authorization: token };

            const picRequestMessage = messages?.find(msg => msg?.messageType === 'pic_request');
            // console.log('pic request message', picRequestMessage?.messageType === 'pic_request');

            const body = {
                receiverId: picRequestMessage?.messageType === 'pic_request' ? userdetails?._id : item?.participantId?._id,
                targetUserId: picRequestMessage?.messageType === 'pic_request' ? item?.participantId?._id : userdetails?._id,
            };
            // console.log('body of pic request', body);

            try {
                const response = await axios.post('home/private-pic-request-details', body, { headers });
                const status = response?.data?.data?.status?.toLowerCase();
                // console.log('Pic request status from API:', response?.data);
                setPrivatePicRequestStatus(status);
            } catch (error) {
                console.error('Error fetching pic request status:', error?.response?.data?.message);
            }
        };

        getRequestDetailStatus();
    }, [userdetails?._id, item?.participantId?._id, messages, privatePicRequestStatus]);


    useEffect(() => {
        on('privatePicRequestResponse', (data) => {
            console.log('private pic response', data);

            const status = data?.message?.status?.toLowerCase();
            if (status === 'accepted' || status === 'rejected' || status === 'removed') {
                setPrivatePicRequestStatus(status); // ✅ Set the real value
            }
        });

        return () => {
            removeListener('privatePicRequestResponse');
        };
    }, []);


    const handleSendPreview = async () => {
        setIsUploading(true);
        try {
            const uploadResponse = await uploadImageToServer(previewImage);
            setFileId(uploadResponse);
            sendMessage(uploadResponse, 'image');
            setIsPreviewVisible(false);
            setPreviewImage(null);
        } catch (error) {
            console.error('Error sending preview:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const userHide = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: 'HIDE'
        }
        console.log('body', body);

        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the HIDE', resp?.data);
            setIsModalVisible1(false)
            Toast.show('User Hide Succuessfully', Toast.SHORT)
            navigation.goBack('')
        } catch (error) {
            console.log('error from the hde api ', error.response.data.message);
        }

    }

    const userBlock = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            targetUserId: id,
            action: "BLOCK"
        }
        try {
            const resp = await axios.put(`home/update-activity-log/${userdetails?._id}`, body, { headers })
            console.log('response from the BLOCK button', resp.data);
            setIsModalVisible2(false)
            Toast.show('User Blocked Succuessfully', Toast.SHORT)
            navigation.goBack('')

        } catch (error) {
            console.log('error from the BLOCK ', error);
        }

    }

    if (loadingMessages || loadingProfile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <LottieView
                    source={require('../../assets/loaderr.json')}
                    autoPlay
                    loop
                    style={{ width: 100, height: 100 }}
                />
            </View>
        );
    }



    return (
        <View style={styles.container}>
            <View style={styles.cont}>
                {/* Back + Profile + Name */}
                <View style={styles.cont1}>
                    <TouchableOpacity onPress={() => navigation.goBack('')}>
                        <Image source={images.back} style={styles.back} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('UserProfileDetails', {
                                item: item?.participantId?._id || id,
                            })
                        }
                    >
                        <Image
                            source={{ uri: item?.participantId?.profilePicture || profilepic }}
                            style={styles.profile}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('UserProfileDetails', {
                                item: item?.participantId?._id || id,
                            })
                        }
                    >
                        <View style={styles.nameContainer}>
                            <Text style={styles.txt}>
                                {item?.participantId?.userName?.charAt(0).toUpperCase() +
                                    item?.participantId?.userName?.slice(1) ||
                                    userName?.charAt(0).toUpperCase() + userName?.slice(1)}
                            </Text>
                            <Text style={styles.txt1}>{otheruserprofiledata?.city}</Text>
                        </View>
                    </TouchableOpacity>

                    {isRecording && (
                        <LottieView
                            source={require('../../assets/recording.json')}
                            autoPlay
                            loop
                            style={styles.recordingAnimation}
                        />
                    )}
                </View>

                {/* Call + Video + More */}
                <View style={styles.rightIcons}>
                    <TouchableOpacity onPress={handleAudioCallClick} style={styles.iconBtn}>
                        <Image source={images.call} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleVideoCallClick} style={styles.iconBtn}>
                        <Image source={images.video} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => rbSheetRef.current.open()} style={styles.iconBtn}>
                        <Image source={images.dots} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.line} />

            {ispremiumuser ? (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => `${item._id}-${index}`}
                    removeClippedSubviews={false}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    style={{ marginTop: 20 }}
                    onContentSizeChange={(w, h) => {
                        setContentHeight(h);
                    }}
                    keyboardShouldPersistTaps="handled"
                    ListFooterComponent={<View style={{ marginBottom: 100 }} />}
                    renderItem={({ item }) => {
                        const isUserMessage = item.receiverId !== userdetails?._id;
                        const messageStyle = isUserMessage ? styles.userMessage : styles.receiverMessage;
                        const formattedTime = formatTime(item.timestamp);
                        const isAudioFile = item.files[0]?.fileType === 'audio/wav';
                        const isImageFile = item.files[0]?.fileType?.includes('image');
                        const isPicRequest = item?.messageType === 'pic_request';
                        const isCallRelated = ['call_request', 'call_request_accept', 'call_request_reject'].includes(item?.messageType);
                        const isReciever = item?.senderId !== userdetails?._id;
                        const messageStylee = isReciever ? styles.receiverMessage : styles.userMessage;

                        const getMessageTick = () => {
                            if (item.isRead && item.isDelivered) {
                                return images.bluetick;
                            } else if (item.isDelivered && !item.isRead) {
                                return images.doubletick;
                            } else {
                                return images.singletick;
                            }


                        };

                        if (isCallRelated) {
                            const iconSource = item?.message === 'video'
                                ? images.video
                                : item?.messageType === 'call_request_reject'
                                    ? images.missed
                                    : isReciever
                                        ? images.incoming
                                        : images.outgoing
                            const labelMap = {
                                call_request: 'Call',
                                call_request_accept: 'Call',
                                call_request_reject: 'Call Missed',
                            };
                            const label = `${item?.message === 'video' ? 'Video' : 'Voice'} ${labelMap[item?.messageType]}`;

                            return (
                                <View style={messageStyle}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={iconSource} style={{ width: 24, height: 24, marginRight: 8, tintColor: item?.messageType === 'call_request_reject' ? 'red' : 'green' }} />
                                        <Text style={styles.messageText}>{label}</Text>
                                    </View>
                                    <View style={styles.timeAndTickContainer}>
                                        <Text style={styles.timeText}>{formattedTime}</Text>
                                        {isUserMessage && <Image source={getMessageTick()} style={styles.doubleTick} />}
                                    </View>
                                </View>
                            );
                        }

                        if (isPicRequest) {
                            return (
                                <>
                                    {ispremiumuser ?
                                        <View>
                                            <View>
                                                {privatePicRequestStatus?.toLowerCase() === 'pending' && isReciever && (
                                                    <View>
                                                        <Image source={{ uri: requestPic }} style={{ height: 50, width: 50, alignSelf: 'center', borderRadius: 100 }} />
                                                        <Text style={{ color: 'black', fontSize: 16, textAlign: 'center', fontFamily: 'Poppins-Medium', marginTop: 20 }}>
                                                            Request for Private Photos
                                                        </Text>
                                                        <Text style={{ color: '#757575', fontSize: 14, fontFamily: 'Poppins-Italic', textAlign: 'center' }}>
                                                            Would you like to accept their request to view your private photos?
                                                        </Text>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20 }}>
                                                            <TouchableOpacity onPress={() => handleAcceptPicRequest(item?.senderId)} style={{ borderWidth: 1, height: 40, width: 100, borderRadius: 20, justifyContent: 'center', backgroundColor: '#916008', borderColor: '#916008' }}>
                                                                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: 14 }}>Accept</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => handleRejectPicRequest(item?.senderId)} style={{ borderWidth: 1, height: 40, width: 100, borderRadius: 20, justifyContent: 'center', borderColor: 'grey' }}>
                                                                <Text style={{ color: '#3C4043', textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: 14 }}>Reject</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                            {privatePicRequestStatus?.toLowerCase() === 'accepted' && isReciever && (
                                                <View style={messageStylee}>
                                                    <Text style={styles.messageText}>You have accepted the request. They can now view your private photos.</Text>
                                                </View>
                                            )}
                                            {privatePicRequestStatus?.toLowerCase() === 'rejected' && isReciever && (
                                                <View style={messageStylee}>
                                                    <Text style={styles.messageText}>You have rejected the request. They cannot view your private photos.</Text>
                                                </View>
                                            )}
                                            {privatePicRequestStatus?.toLowerCase() === 'accepted' && !isReciever && (
                                                <View style={messageStylee}>
                                                    <Text style={styles.messageText}>Your request was accepted! You can now view their private photos</Text>
                                                </View>
                                            )}
                                            {privatePicRequestStatus?.toLowerCase() === 'rejected' && !isReciever && (
                                                <View style={messageStylee}>
                                                    <Text style={styles.messageText}>Your request was rejected! You cannot view their private photos</Text>
                                                </View>
                                            )}
                                            {privatePicRequestStatus?.toLowerCase() === 'pending' && !isReciever && (
                                                <View style={messageStylee}>
                                                    <Text style={styles.messageText}>You've requested to view private photos. Waiting for response...</Text>
                                                </View>
                                            )}
                                        </View>
                                        :
                                        <View style={messageStyle}>
                                            <Text style={styles.messageText}>Upgrade to Read Messages</Text>
                                        </View>
                                    }
                                </>
                            )
                        }
                        return (
                            <>
                                {ispremiumuser ? (
                                    <View style={messageStyle}>
                                        {item.message && <Text style={styles.messageText}>{item.message}</Text>}
                                        {isImageFile && item.files[0]?.url && (
                                            <TouchableOpacity onPress={() => showImageModal(item.files[0]?.url)}>
                                                <Image source={{ uri: item.files[0]?.url }} style={styles.messageImage} resizeMode="cover" />
                                            </TouchableOpacity>
                                        )}
                                        {isAudioFile && item.files[0]?.url && (
                                            <View style={styles.audioMessageContainer}>
                                                <Text>🎙️ Audio File</Text>

                                                {isPlaying && playingMessageId === item._id ? (
                                                    <>
                                                        <TouchableOpacity onPress={stopAudio}>
                                                            <Text style={[styles.playButton, { color: 'red' }]}>Stop</Text>
                                                        </TouchableOpacity>
                                                        <LottieView
                                                            source={require('../../assets/recording.json')}
                                                            autoPlay
                                                            loop
                                                            style={styles.recordingAnimation}
                                                        />
                                                    </>
                                                ) : (
                                                    <TouchableOpacity onPress={() => playAudio(item._id)}>
                                                        <Text style={styles.playButton}>Play</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}

                                        {isPlaying && playingMessageId === item._id && (
                                            <LottieView
                                                source={require('../../assets/play.json')}
                                                autoPlay
                                                loop={false}
                                                style={styles.playAnimation}
                                            />
                                        )}
                                        <View style={styles.timeAndTickContainer}>
                                            <Text style={styles.timeText}>{formattedTime}</Text>
                                            {isUserMessage && <Image source={getMessageTick()} style={styles.doubleTick} />}
                                        </View>
                                    </View>
                                ) : (
                                    isReciever && (
                                        <View style={messageStyle}>
                                            <Text style={styles.messageText}>Upgrade to Read Messages</Text>
                                        </View>
                                    )
                                )}
                            </>
                        );


                    }}
                />
            ) : (
                <View>
                    {messages?.length > 0 ?
                        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.receiverMessage}>
                            <Text style={styles.messageText}>Upgrade to Read Messages</Text>
                        </TouchableOpacity>
                        :
                        null}
                </View>
            )}

            {isTyping && (
                <LottieView
                    source={require('../../assets/typing.json')}
                    autoPlay
                    loop
                    style={styles.typingAnimation}
                />
            )}

            <TouchableWithoutFeedback
                onPress={() => {
                    if (shouldShowModal) {
                        setIsModalVisible(true);
                        Keyboard.dismiss();
                    }
                }}
            >
                <View style={styles.bottomContainer}>
                    <View style={[styles.messageContainer, { height: message.length > 40 ? 100 : 45 }]}>
                        <TextInput
                            style={[styles.input, { height: message.length > 40 ? 100 : 45 }]}
                            placeholder="Message"
                            placeholderTextColor="#C4C4C4"
                            multiline
                            onContentSizeChange={handleContentSizeChange}
                            value={message}
                            onChangeText={setMessage}
                            editable={!shouldShowModal}

                        />
                        {!keyboardVisible && (
                            <>
                                <TouchableOpacity style={styles.iconButton} onPress={handleTakeSelfie}>
                                    <Image source={images.camera} style={styles.icon} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPressIn={startRecording}
                                    onPressOut={stopRecording}
                                >
                                    <Image source={images.mic} style={styles.icon} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconButton} onPress={handlePhotoSelection}>
                                    <Image source={images.gallery} style={styles.icon} />
                                </TouchableOpacity>
                            </>
                        )}
                        {keyboardVisible && (
                            <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
                                <View style={{ borderWidth: 1, height: 30, width: 46, justifyContent: 'center', right: 10, borderRadius: 70, backgroundColor: '#916008', borderColor: '#916008' }}>
                                    <Image source={images.send} style={[styles.icon, { tintColor: 'white', alignSelf: 'center', height: 18, width: 18 }]} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>

            <Modal
                isVisible={isImageModalVisible}
                onBackdropPress={hideImageModal}
                transparent={true}
                onRequestClose={hideImageModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={hideImageModal}>
                        <Image style={styles.modalCloseText} source={images.cross} />
                    </TouchableOpacity>
                    <ImageViewer
                        imageUrls={[{ url: selectedImageUri }]}
                        enableSwipeDown={true}
                        onSwipeDown={hideImageModal}
                        backgroundColor="rgba(0, 0, 0, 0.8)"
                    />
                </View>
            </Modal>

            <Modal isVisible={isModalVisible} style={styles.modal}>
                <View style={styles.overlay}>
                    <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.closeButton, { borderColor: 'white' }]}>
                        <Image source={images.cross} style={[styles.closeIcon, { tintColor: 'white' }]} />
                    </TouchableOpacity>
                    {userprofiledata?.country === 'India' ?
                        <TouchableOpacity onPress={() => {
                            setIsModalVisible(false);
                            navigation.navigate('RazorChat');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => {
                            setIsModalVisible(false);
                            navigation.navigate('Paypal');
                        }}>
                            <Image source={images.modal} style={{ height: 709, width: 363 }} />
                        </TouchableOpacity>}
                </View>
            </Modal>

            <Modal
                isVisible={isPreviewVisible}
                style={{ margin: 0, backgroundColor: 'black' }}
                backdropOpacity={0.9}
                onBackdropPress={() => setIsPreviewVisible(false)}
                onBackButtonPress={() => setIsPreviewVisible(false)}
            >
                <View style={{ flex: 1 }}>

                    <View style={{
                        height: 60,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <TouchableOpacity
                            onPress={() => setIsPreviewVisible(false)}
                            disabled={isUploading}
                            style={{ borderWidth: 1, height: 35, width: 35, justifyContent: "center", backgroundColor: '#888', borderColor: '#888', borderRadius: 100 }}
                        >
                            <Image
                                source={images.cross}
                                style={{ width: 15, height: 15, tintColor: '#fff', alignSelf: "center" }}
                            />
                        </TouchableOpacity>
                        <Text style={{ color: '#fff', fontSize: 16 }}>1 Selected</Text>
                    </View>


                    <Image
                        source={{ uri: previewImage }}
                        style={{
                            width: '100%',
                            height: Dimensions.get('window').height * 0.75,
                            marginBottom: 10,
                        }}
                        resizeMode="cover"
                    />

                    <View style={{
                        position: 'absolute',
                        bottom: 30,
                        left: 20,
                    }}>
                        <Text style={{ color: '#888', fontSize: 20, }}><Image source={images.uparrow} style={{ height: 15, width: 15, tintColor: '#DDDDDD' }} />  {item?.participantId?.userName.charAt(0).toUpperCase() + item?.participantId?.userName?.slice(1) || userName?.charAt(0).toUpperCase() + userName?.slice(1)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSendPreview}
                        disabled={isUploading}
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            backgroundColor: '#916008',
                            borderRadius: 50,
                            padding: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Image
                                source={images.rightarrow}
                                style={{ width: 24, height: 24, tintColor: '#fff' }}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </Modal>



            <RBSheet
                ref={rbSheetRef}
                height={150}
                closeOnPressMask={true}
                customStyles={{
                    container: {
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                }}
            >
                <View style={{ padding: 20, width: '100%' }}>
                    {/* Title text at the top */}
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 45, textAlign: 'center', textDecorationLine: 'underline' }}>
                        Choose Your Option
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', bottom: 20 }}>

                        {/* Camera Option */}
                        <TouchableOpacity
                            style={{ alignItems: 'center', flex: 1 }}
                            onPress={() => setIsModalVisible1(true)}
                        >
                            <Image source={images.hideuser} style={{ height: 40, width: 40, marginBottom: 8, left: 5 }} />
                            <Text>Hide</Text>
                        </TouchableOpacity>

                        {/* Gallery Option */}
                        <TouchableOpacity
                            style={{ alignItems: 'center', flex: 1 }}
                            onPress={() => setIsModalVisible2(true)}
                        >
                            <Image source={images.blockuser} style={{ height: 40, width: 40, marginBottom: 8 }} />
                            <Text>Block</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>

            <Modal
                transparent={true}
                animationType="slide"
                visible={isModalVisible1}
                onRequestClose={() => setIsModalVisible1(false)}

            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Hide</Text>
                        <Text style={styles.message}>
                            Are you sure you want to Hide?
                        </Text>
                        <View style={styles.buttons}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'white', borderColor: '#DDDDDD', borderWidth: 1 }]} onPress={() => setIsModalVisible1(false)}>
                                <Text style={[styles.buttonText1, { color: 'black' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => userHide(id || item?.participantId?._id)}>
                                <Text style={styles.buttonText1}>Hide</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                transparent={true}
                animationType="slide"
                visible={isModalVisible2}
                onRequestClose={() => setIsModalVisible2(false)}

            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Block</Text>
                        <Text style={styles.message}>
                            Are you sure you want to Block?
                        </Text>
                        <View style={styles.buttons}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'white', borderColor: '#DDDDDD', borderWidth: 1 }]} onPress={() => setIsModalVisible2(false)}>
                                <Text style={[styles.buttonText1, { color: 'black' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => userBlock(id || item?.participantId?._id)}>
                                <Text style={styles.buttonText1}>Block</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

export default OneToOneChatFromNav;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    cont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 20,
    },
    cont1: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    back: {
        height: 22,
        width: 22,
        marginRight: 10,
    },
    profile: {
        height: 45,
        width: 45,
        borderRadius: 100,
        marginRight: 12,
    },
    nameContainer: {
        justifyContent: 'center',
    },
    txt: {
        color: 'black',
        fontSize: 17,
        fontFamily: 'Poppins-Medium',
    },
    txt1: {
        color: '#C4C4C4',
        fontSize: 13,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        marginLeft: 25,
    },
    icon: {
        height: 25,
        width: 25,
    },
    recordingAnimation: {
        width: 30,
        height: 30,
        marginLeft: 10,
    },

    line: {
        borderWidth: 0.3,
        borderColor: '#C4C4C4',
        marginTop: 5,
        elevation: 3
    },
    bottomContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'white',
        borderTopWidth: 0.5,
        borderTopColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 45,
        backgroundColor: 'white',
        borderRadius: 25,
        paddingLeft: 15,
        paddingRight: 15,
        borderWidth: 0.7,
        borderColor: '#C4C4C4',
        elevation: 1
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: 'black',
    },
    iconButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        width: 30,
        height: 30,
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: '#3C4043'
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#D9FDD3',
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        maxWidth: '80%',
        marginRight: 20,
        marginTop: 20
    },
    receiverMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F1F1',
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        maxWidth: '80%',
        marginLeft: 10
    },
    messageText: {
        fontSize: 16,
        color: 'black',
    },
    typingAnimation: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        zIndex: 100,
        width: 50,
        height: 50,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    audioMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    playButton: {
        color: '#007BFF',
        marginLeft: 10,
    },
    recordingAnimation: {
        width: 40,
        height: 40,
    },
    playAnimation: {
        width: 60,
        height: 60,
    },
    timer: {
        fontSize: 12,
        color: 'black',
        textAlign: 'center',
        top: 2
    },
    timeAndTickContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 5,
    },

    timeText: {
        fontSize: 12,
        color: '#C4C4C4',
        marginRight: 5,
    },

    doubleTick: {
        width: 20, // Adjust size as needed
        height: 20, // Adjust size as needed
    },
    modalOverlay: {
        height: '110%',
        width: '130%',
        alignSelf: 'center',
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Full-screen dark background
    },
    modalCloseButton: {
        position: "absolute",
        top: 40,
        right: 50,
        backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent button
        padding: 10,
        borderRadius: 20,
        zIndex: 1, // Ensure it stays above the image
    },
    modalCloseText: {
        height: 20,
        width: 20
    },
    modalImage: {
        width: "100%", // Make the image take up the full width
        height: "100%", // Make the image take up the full height
        resizeMode: "contain", // Ensure the image maintains its aspect ratio
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    modalContent: {
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // Added background color for clarity
    },
    pay: {
        textAlign: 'center',
        color: 'green',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: "#916008",
        borderRadius: 25,
        paddingVertical: 10,
        width: "100%",
        marginTop: 20,
    },
    submitText: {
        fontSize: 16,
        color: "white",
        textAlign: "center",
        fontFamily: "Poppins-Medium",
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
    previewContainer: {
        // flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
    },
    cancelButton: {
        marginRight: 20,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 8,
    },
    sendButton: {
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    modalBackground: {
        height: '110%',
        width: '130%',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: 320,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignSelf: 'center',
        // height: 460
    },
    title: {
        fontSize: 23,
        marginBottom: 10,
        fontFamily: GARAMOND.bold,
        textAlign: 'center'
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#3C4043',
        fontFamily: POPPINSRFONTS.regular
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    button: {
        height: 40,
        width: 100,
        borderRadius: 5,
        backgroundColor: '#916008',
        borderColor: '#916008',
        marginTop: 30,
        alignSelf: 'center',
        justifyContent: "center"
    },
    buttonText1: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
    },




});
