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

const OneToOneChat = ({ navigation, route }) => {
    const { roomId, initialMessages, item } = route.params;
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
    const { emit, on, removeListener } = useSocket(onSocketConnect);

    const onSocketConnect = () => {
        console.log('Socket connected in chat screen');
    };

    useEffect(() => {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Start a new debounce timer
        const newTypingTimeout = setTimeout(() => {
            emit('typing', {
                senderId: userdetails?._id,
                receiverId: item?.participantId?._id,
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


    const sendMessage = async () => {
        try {
            const messageToSend = audioFile !== null ? audioFile : message;
            let data = {
                roomId: roomId,
                senderId: userdetails?._id,
                receiverId: item?.participantId?._id,
                message: messageToSend,
                messageType: audioFile !== null ? "audio" : "text",
                userAgentSent: null,
                files: [],
            };
            console.log('Data being sent:', data);
            emit('message', data);
            setMessage('')
            setAudioFile(null)
        } catch (error) {
            console.log('sendMessage error ', error);
        }
    };

    const handleContentSizeChange = (contentWidth, contentHeight) => {
        if (contentHeight <= 100) {
            setInputHeight(contentHeight);
        } else {
            setInputHeight(100);
        }
    };

    const handlePhotoSelection = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 1,
        };

        launchImageLibrary(options, (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const newImageMessage = {
                    id: Date.now().toString(),
                    imageUri: response.assets[0].uri,
                    sender: 'user',
                };
                setMessages((prevMessages) => [...prevMessages, newImageMessage]);
            } else if (response.error) {
                console.error('Image selection error:', response.error);
            };
        });
    };


    const handleTakeSelfie = () => {
        const options = {
            mediaType: 'photo',
            cameraType: 'front',
            saveToPhotos: true,
            quality: 1,
        };

        launchCamera(options, (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const newSelfieMessage = {
                    id: Date.now().toString(),
                    imageUri: response.assets[0].uri,
                    sender: 'user',
                };
                setMessages((prevMessages) => [...prevMessages, newSelfieMessage]);
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
        setAudioFile(audioFilePath);

        console.log('audio file after stop', audioFilePath)

    };


    const playAudio = (messageId) => {
        console.log('message id', messageId);

        // Set the playing message ID to show the Lottie animation
        setPlayingMessageId(messageId);
        setIsPlaying(true);  // Set audio to be playing

        const soundMessage = messages.find(msg => msg._id === messageId);
        console.log('sound message', soundMessage);

        if (soundMessage) {
            const audioUri = soundMessage.message; // Get the audio URI from the message field

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
                    <Image source={{ uri: item?.participantId?.profilePicture }} style={styles.profile} />
                    <View style={{ marginLeft: 15 }}>
                        <Text style={styles.txt}>{item?.participantId?.userName}</Text>
                        <Text style={styles.txt1}>New Delhi</Text>

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
                    const isAudioFile = item.message && item.message.startsWith('/data/user/');

                    return (
                        <View style={messageStyle}>
                            {item.message && !isAudioFile && <Text style={styles.messageText}>{item.message}</Text>}

                            {item.imageUri && (
                                <TouchableOpacity>
                                    <Image source={{ uri: item.imageUri }} style={styles.messageImage} resizeMode='contain' />
                                </TouchableOpacity>
                            )}

                            {isAudioFile && (
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

                            {isPlaying && playingMessageId === item._id && (
                                <Text style={styles.timer}>{timer.toFixed(1)} sec</Text>
                            )}

                            <View style={styles.timeAndTickContainer}>
                                <Text style={styles.timeText}>{formattedTime}</Text>

                                {isUserMessage && (
                                    <Image source={images.doubletick} style={styles.doubleTick} />
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
        width: 250,
        height: 250,
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
        // marginTop: 5,
    },
    playAnimation: {
        width: 60,
        height: 60,
    },
    timer: {
        // marginLeft: 10,
        fontSize: 12,
        color: 'black',
        textAlign: 'center',
        top: 2
    },
    timeAndTickContainer: {
        flexDirection: 'row', // Place time and double tick on the same row
        justifyContent: 'flex-end', // Align them as needed, or change this for the positioning
        alignItems: 'center', // Center vertically
        marginTop: 5, // Adjust spacing as necessary
    },

    timeText: {
        fontSize: 12,
        color: '#C4C4C4',
        marginRight: 5, // Adds space between time and double tick
        // You can also adjust alignSelf if needed
    },

    doubleTick: {
        width: 20, // Adjust size as needed
        height: 20, // Adjust size as needed
    },
});
