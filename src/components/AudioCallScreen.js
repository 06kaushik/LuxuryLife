import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import {
    RTCView,
    mediaDevices,
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    MediaStream,
} from 'react-native-webrtc';
import useSocket from '../socket/SocketMain';
import images from './images';
import InCallManager from 'react-native-incall-manager';


const AudioCallScreen = ({ route, navigation }) => {

    const { selectedUser, videoRoomId, userId, profilePicture, userName } = route.params;
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [usingFrontCamera, setUsingFrontCamera] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [outgoingcall, setOutgoingCall] = useState(null)
 
    const timerRef = useRef(null);


    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const remoteStreamRef = useRef(null);

    const { emit, on, removeListener, socketId } = useSocket(() => { });

    const toggleSpeaker = () => {
        const newState = !isSpeakerOn;
        InCallManager.setSpeakerphoneOn(newState);
        setIsSpeakerOn(newState);
    };

    useEffect(() => {
        on('videoCallRequestResponse', (data) => {
            console.log('respone from the video call response', data);
            setOutgoingCall(data)
        })
    }, [socketId, on])

    useEffect(() => {
        const handleCallEnded = (data) => {
            // console.log('response from the call ended', data);
            hangUp();  // Automatically hang up the call when the event is received
        };

        on('callEnded', handleCallEnded);

        return () => removeListener('callEnded', handleCallEnded);
    }, [socketId, on, removeListener]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setLocalStream(stream);
                localStreamRef.current = stream;
                InCallManager.start({ media: 'audio' });
                InCallManager.setSpeakerphoneOn(false);
            } catch (error) {
                console.error('Error accessing media devices.', error);
            }
        };
        startCamera();

        return () => {
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    useEffect(() => {
        if (!socketId || !localStreamRef.current) return;

        const handleCallAccepted = ({ from }) => {
            console.log('handle Accepted', from);

            createPeerConnection(from, true);
        };

        on('videoCallAccepted', handleCallAccepted);
        return () => removeListener('videoCallAccepted', handleCallAccepted);
    }, [socketId, localStreamRef.current]);

    useEffect(() => {
        const handleSignal = async (data) => {
            const { from, signal, userToSignal = socketId } = data;
            console.log('handle signal', userToSignal, from, signal);
            if (!userToSignal || userToSignal !== socketId) return;

            const pc = peerConnectionRef.current;
            if (!pc) return;

            if (signal?.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                await new Promise((resolve) => {
                    if (pc.iceGatheringState === 'complete') return resolve();
                    const check = () => {
                        if (pc.iceGatheringState === 'complete') {
                            pc.removeEventListener('icegatheringstatechange', check);
                            resolve();
                        }
                    };
                    pc.addEventListener('icegatheringstatechange', check);
                });

                emit('signal', {
                    userToSignal: from,
                    from: socketId,
                    signal: {
                        type: pc.localDescription.type,
                        sdp: pc.localDescription.sdp,
                    },
                });
            }

            if (signal?.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                console.log('✅ Remote SDP (answer) set');
            }
        };

        on('signal', handleSignal);
        return () => removeListener('signal', handleSignal);
    }, [socketId, on, emit]);



    const createPeerConnection = async (userToSignal, isInitiator) => {
        if (!socketId) return;
        console.log('userToSignal,isInitiator', userToSignal, isInitiator);

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnectionRef.current = pc;

        localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
        });

        pc.ontrack = (event) => {
            console.log('🔥 ontrack fired:', event.streams);
            const inboundStream = event.streams[0];
            if (inboundStream) {
                remoteStreamRef.current = inboundStream;
                setRemoteStream(inboundStream);
                if (!timerRef.current) {
                    timerRef.current = setInterval(() => {
                        setCallDuration(prev => prev + 1);
                    }, 1000);
                }
            }
        };

        if (isInitiator) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                const waitForIceComplete = () =>
                    new Promise((resolve) => {
                        if (pc.iceGatheringState === 'complete') {
                            resolve();
                        } else {
                            const checkState = () => {
                                if (pc.iceGatheringState === 'complete') {
                                    pc.removeEventListener('icegatheringstatechange', checkState);
                                    resolve();
                                }
                            };
                            pc.addEventListener('icegatheringstatechange', checkState);
                        }
                    });

                await waitForIceComplete();

                emit('signal', {
                    userToSignal: userToSignal,
                    from: socketId,
                    signal: {
                        type: pc.localDescription.type,
                        sdp: pc.localDescription.sdp,
                    },
                });
            } catch (err) {
                console.error('Failed to create/send offer', err);
            }
        }
    };


    const hangUp = () => {
        // Inform remote peer
        emit('end-video-call', {
            roomId: videoRoomId,
            from: userId,
            logId: outgoingcall?.logId
        });

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Stop local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            localStreamRef.current.release?.();
            localStreamRef.current = null;
        }

        // Stop remote stream tracks
        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            remoteStreamRef.current.release?.();
            remoteStreamRef.current = null;
        }

        // Stop speaker and audio session
        InCallManager.stop(); // ⬅️ Important to release audio focus and routing

        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setCallDuration(0);

        // Reset state
        setLocalStream(null);
        setRemoteStream(null);
        setIsMuted(false); 
        setIsVideoEnabled(true);

        navigation.goBack();
    };

    const formatDuration = () => {
        const mins = Math.floor(callDuration / 60).toString().padStart(2, '0');
        const secs = (callDuration % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };


    return (
        <View style={styles.container}>
            <Image source={{ uri: profilePicture }} style={styles.backgroundImage} blurRadius={40} />
            <View style={styles.content}>
                <Image source={{ uri: profilePicture }} style={styles.avatar} />
                <Text style={styles.name}>{userName}</Text>
                <Text style={styles.callingText}>
                    {remoteStream ? formatDuration() : 'Ringing'}
                </Text>

            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.roundButton}>
                    <Image source={isMuted ? images.mute : images.mic} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleSpeaker} style={styles.roundButton}>
                    <Image source={isSpeakerOn ? images.speakeron : images.speakeroff} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={hangUp} style={[styles.roundButton, styles.hangup]}>
                    <Image source={images.hang} style={[styles.icon, { tintColor: 'white' }]} />
                </TouchableOpacity>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        position: 'relative',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 60,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },
    content: {
        marginTop: 100,
        alignItems: 'center',
    },
    avatar: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 3,
        borderColor: 'white',
    },
    name: {
        fontSize: 22,
        color: 'white',
        fontWeight: '600',
        marginTop: 20,
    },
    duration: {
        fontSize: 16,
        color: '#ddd',
        marginTop: 8,
    },
    callingText: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 4,
    },
    buttons: {
        flexDirection: 'row',
        gap: 50,
    },
    roundButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hangup: {
        backgroundColor: '#E53935',
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: 'white',
    },


});

export default AudioCallScreen;