import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, Text, Keyboard, FlatList } from 'react-native';
import images from '../../components/images';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';

const OneToOneChat = ({ navigation }) => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [inputHeight, setInputHeight] = useState(40);
    const [photos, setPhotos] = useState([]);
    const [cameraphot, setCamera] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isReceiverTyping, setIsReceiverTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(0);  // Add timer state
    const [intervalId, setIntervalId] = useState(null);


    const [audioFile, setAudioFile] = useState(null);

    const flatListRef = useRef();



    useEffect(() => {
        return () => {
            clearInterval(intervalId);  // Clean up interval when the component is unmounted
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
            selectionLimit: 1, // Only allow one photo at a time
        };

        launchImageLibrary(options, (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                // Add image as a separate message
                const newImageMessage = {
                    id: Date.now().toString(),
                    imageUri: response.assets[0].uri, // URI of the selected image
                    sender: 'user', // You can switch to 'receiver' for received images
                };
                setMessages((prevMessages) => [...prevMessages, newImageMessage]);
            } else if (response.error) {
                console.error('Image selection error:', response.error);
            }
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
                setCamera(response.assets[0].uri);
                const newSelfieMessage = {
                    id: Date.now().toString(),
                    imageUri: response.assets[0].uri,
                    sender: 'user',
                };
                setMessages((prevMessages) => [...prevMessages, newSelfieMessage]);
            }
        });
    };

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = {
                id: Date.now().toString(),
                text: message,
                sender: 'user',
                status: 'sent',
            };

            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setMessage('');

            setTimeout(() => {
                flatListRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const handleReceiverTyping = (text) => {
        setMessage(text);
        setIsReceiverTyping(text.length > 0);
    };

    const startRecording = () => {
        setIsRecording(true);
        AudioRecord.start();
    };

    const stopRecording = async () => {
        setIsRecording(false);
        const audioFilePath = await AudioRecord.stop();
        setAudioFile(audioFilePath);

        const newAudioMessage = {
            id: Date.now().toString(),
            audioUri: audioFilePath,
            sender: 'user',
        };
        setMessages((prevMessages) => [...prevMessages, newAudioMessage]);

        // Play the audio after it's recorded
        const newSound = new Sound(audioFilePath, '', (err) => {
            if (err) {
                console.log('Failed to load the sound', err);
            } else {
                setSound(newSound);
            }
        });
    };

    const playAudio = () => {
        setIsPlaying(true);
        if (sound) {
            sound.play((success) => {
                if (success) {
                    console.log('Audio played successfully');
                } else {
                    console.log('Audio playback failed');
                }
                setIsPlaying(false);  // Reset isPlaying when the audio finishes
                clearInterval(intervalId);  // Stop the timer when audio finishes
            });

            // Round the duration to the nearest whole number and then start the timer
            const roundedDuration = Math.round(sound._duration);  // Round the duration to an integer
            setTimer(roundedDuration);  // Set the timer to the rounded value
            const id = setInterval(() => {
                setTimer(prevTime => {
                    if (prevTime <= 0) {
                        clearInterval(id);  // Stop the timer if it reaches 0
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            setIntervalId(id);
        } else {
            Alert.alert('No Audio', 'No audio recorded yet');
            setIsPlaying(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cont}>
                <View style={styles.cont1}>
                    <TouchableOpacity onPress={() => navigation.goBack('')}>
                        <Image source={images.back} style={styles.back} />
                    </TouchableOpacity>
                    <Image source={images.dummy} style={styles.profile} />
                    <View style={{ marginLeft: 15 }}>
                        <Text style={styles.txt}>Loreum Ipsum</Text>

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
                <View>
                    <Image source={images.dots} style={{ height: 35, width: 35, top: 3 }} />
                </View>
            </View>
            <View style={styles.line} />



            <FlatList
                ref={flatListRef}
                data={messages}
                ListFooterComponent={<View style={{marginBottom:100}}/>}
                renderItem={({ item }) => (
                    <View style={item.sender === 'user' ? [styles.userMessage, { backgroundColor: isPlaying === false ? '#D9FDD3' : 'white' }] : styles.receiverMessage}>
                        {item.text && <Text style={styles.messageText}>{item.text}</Text>}
                        {item.imageUri && (
                            <TouchableOpacity>
                                <Image source={{ uri: item.imageUri }} style={styles.messageImage} resizeMode='contain' />
                            </TouchableOpacity>
                        )}
                        {isPlaying === false ?
                            <View>
                                {item.audioUri && (
                                    <View style={styles.audioMessageContainer}>
                                        <Text>🎙️ Audio Message</Text>
                                        <TouchableOpacity onPress={playAudio}>
                                            <Text style={styles.playButton}>Play</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            :
                            <LottieView
                                source={require('../../assets/play.json')}
                                autoPlay
                                loop={false}
                                style={styles.playAnimation}
                            />

                        }
                        {isPlaying && (
                            <Text style={styles.timer}>{timer.toFixed(1)}sec</Text>
                        )}
                    </View>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 10 }}
            />

            <View style={styles.bottomContainer}>
                <View style={styles.messageContainer}>
                    <TextInput
                        style={[styles.input, { height: inputHeight }]}
                        placeholder="Message"
                        placeholderTextColor="#C4C4C4"
                        multiline
                        onContentSizeChange={handleContentSizeChange}
                        value={message}
                        onChangeText={handleReceiverTyping}
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
                        <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
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
    },
    messageText: {
        fontSize: 16,
        color: 'black',
    },
    typingAnimation: {
        alignSelf: 'center',
        marginTop: 10,
        height: 30,
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
});
