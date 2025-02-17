import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, Text, Keyboard, FlatList, Alert } from 'react-native';
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

const OneToOneChat = ({ navigation, route }) => {
    const { roomId, initialMessages, item, useronline, userName, profilepic, id } = route.params;

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
    const { emit, on, removeListener } = useSocket(onSocketConnect);

    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };

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
            console.log('ebent in reall all', event);

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
    }, [isTyping, on, removeListener]);


    // useEffect(() => {
    //     emit("checkRoom", { users: { participantId: item?.participantId?._id, userId: userdetails?._id } });
    // }, [emit])

    // useEffect(() => {
    //     on('readAllMessagesResponse', (event) => {
    //         console.log('response from the read akk messages', event);
    //     })
    // }, [initialMessages])

    const handleLayout = () => {
        setTimeout(() => {
            if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
            }
        }, 100);
    };

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleScroll = (event) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        const contentOffsetY = event.nativeEvent.contentOffset.y;
        const contentHeightThreshold = 100;
        setIsAtBottom(contentHeight - contentOffsetY - contentHeightThreshold <= 0);
    };

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
    }, [emit]);

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
            setFileId(null);  // Reset fileId after sending the message
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

    const handlePhotoSelection = async () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 1,
        };
        launchImageLibrary(options, async (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const imageUri = response.assets[0].uri;
                console.log('imageuriii', imageUri);

                try {
                    const uploadResponse = await uploadImageToServer(imageUri);
                    console.log('response from upload response', uploadResponse);
                    setFileId(uploadResponse)
                    // sendMessage(uploadResponse, 'image');
                } catch (error) {
                    console.error('Error during photo selection:', error);
                }
            } else if (response.error) {
                console.error('Image selection error:', response.error);
            };
        });
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


    const handleTakeSelfie = async () => {
        const options = {
            mediaType: 'photo',
            cameraType: 'front',
            saveToPhotos: true,
            quality: 1,
        };

        launchCamera(options, async (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const imageUri = response.assets[0].uri;
                try {
                    const uploadResponse = await uploadImageToServer(imageUri);
                } catch (error) {
                    console.log('error from uploadinf ');

                }
            }
        });
    };

    const startRecording = () => {
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
        console.log('message id', messageId);

        // Prevent playing a new audio if another is already playing
        if (isPlaying && playingMessageId !== messageId) {
            // Stop the previous audio if it's still playing
            setIsPlaying(false);
            setPlayingMessageId(null);
        }

        // Set the playing message ID and start the audio
        setPlayingMessageId(messageId);
        setIsPlaying(true);

        const soundMessage = messages.find(msg => msg._id === messageId);
        console.log('sound message', soundMessage);

        if (soundMessage) {
            const audioUri = soundMessage.files[0]?.url; // Get the audio URI from the message field

            if (audioUri) {
                const sound = new Sound(audioUri, '', (err) => {
                    if (err) {
                        console.log('Failed to load the sound', err);
                    } else {
                        sound.play((success) => {
                            if (success) {
                                console.log('Audio played successfully');
                            } else {
                                console.log('Audio playback failed');
                            }
                            // Reset isPlaying and playingMessageId after audio finishes
                            setIsPlaying(false);
                            setPlayingMessageId(null);
                        });
                    }
                });
            } else {
                console.log('Audio URI is undefined');
            }
        } else {
            console.log('Message not found');
        }
    };




    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options);
    };


    return (
        <View style={styles.container}>
            <View style={styles.cont}>
                <View style={styles.cont1}>
                    <TouchableOpacity onPress={() => navigation.goBack('')}>
                        <Image source={images.back} style={styles.back} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item?.participantId?._id || id })}>
                        <Image source={{ uri: item?.participantId?.profilePicture || profilepic }} style={styles.profile} />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 15 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item?.participantId?._id || id })}>
                            <Text style={styles.txt}>{item?.participantId?.userName || userName}</Text>
                            <Text style={styles.txt1}>New Delhi</Text>
                        </TouchableOpacity>
                        {isRecording === true ?
                            <LottieView
                                source={require('../../assets/recording.json')}
                                autoPlay={isRecording}
                                loop
                                style={styles.recordingAnimation}
                            />
                            :
                            null
                        }
                    </View>
                </View>
            </View>
            <View style={styles.line} />

            <FlatList
                ref={flatListRef}
                data={messages}
                onScroll={handleScroll}
                style={{ marginTop: 20 }}
                ListFooterComponent={<View style={{ marginBottom: 100 }} />}
                renderItem={({ item }) => {
                    const isUserMessage = item.receiverId !== userdetails?._id;
                    const messageStyle = isUserMessage ? styles.userMessage : styles.receiverMessage;
                    const formattedTime = formatTime(item.timestamp);

                    // Check if the file is audio or image
                    const isAudioFile = item.files[0]?.fileType === 'audio/wav';
                    const isImageFile = item.files[0]?.fileType?.includes('image');

                    const getMessageTick = () => {
                        if (item.isRead && item.isDelivered) {
                            return images.bluetick;
                        } else if (item.isDelivered && !item.isRead) {
                            return images.doubletick;
                        } else {
                            return images.singletick;  // Single tick (pending)
                        }
                    };

                    return (
                        <View style={messageStyle}>
                            {item.message && <Text style={styles.messageText}>{item.message}</Text>}

                            {/* Handle Image File */}
                            {isImageFile && item.files[0]?.url && (
                                <TouchableOpacity onPress={() => showImageModal(item.files[0]?.url)}>
                                    <Image
                                        source={{ uri: item.files[0]?.url }}
                                        style={styles.messageImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            )}

                            {/* Handle Audio File */}
                            {isAudioFile && item.files[0]?.url && (
                                <View style={styles.audioMessageContainer}>
                                    <Text>🎙️ Audio File</Text>
                                    <TouchableOpacity onPress={() => playAudio(item._id)}>
                                        <Text style={styles.playButton}>Play</Text>
                                    </TouchableOpacity>

                                    {isPlaying && playingMessageId === item._id && (
                                        <LottieView
                                            source={require('../../assets/recording.json')}
                                            autoPlay
                                            loop
                                            style={styles.recordingAnimation}
                                        />
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

                                {isUserMessage && (
                                    <Image source={getMessageTick()} style={styles.doubleTick} />
                                )}
                            </View>
                        </View>
                    );
                }}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingBottom: 10 }}
                onLayout={handleLayout}
            />


            {isTyping && (
                <LottieView
                    source={require('../../assets/typing.json')}
                    autoPlay
                    loop
                    style={styles.typingAnimation}
                />
            )}

            <View style={styles.bottomContainer}>
                <View style={styles.messageContainer}>
                    <TextInput
                        style={[styles.input, { height: inputHeight }]}
                        placeholder="Message"
                        placeholderTextColor="#C4C4C4"
                        multiline
                        onContentSizeChange={handleContentSizeChange}
                        value={message}
                        onChangeText={setMessage}
                    />
                    {!keyboardVisible && (
                        <>
                            {/* <TouchableOpacity style={styles.iconButton} onPress={handleTakeSelfie}>
                                <Image source={images.camera} style={styles.icon} />
                            </TouchableOpacity> */}
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
                    <Image
                        source={{ uri: selectedImageUri }}
                        style={styles.modalImage}
                    />
                </View>
            </Modal>
        </View>
    );
};

export default OneToOneChat;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    cont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30
    },
    cont1: {
        flexDirection: "row",
    },
    back: {
        height: 22,
        width: 22,
        top: 10
    },
    profile: {
        height: 45,
        width: 45,
        borderRadius: 100,
        marginLeft: 16
    },
    txt: {
        color: 'black',
        fontSize: 17,
        fontFamily: 'Poppins-Medium'
    },
    txt1: {
        color: '#C4C4C4',
        bottom: 3
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


});
