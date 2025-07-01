import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, PanResponder, Animated } from 'react-native';
import {
    RTCView,
    mediaDevices,
    RTCPeerConnection,
    RTCSessionDescription,
} from 'react-native-webrtc';
import useSocket from '../socket/SocketMain';
import images from './images';
import InCallManager from 'react-native-incall-manager';

const IncomingVideoCallScreen = ({ route, navigation }) => {

    const { selectedUser, videoRoomId, userId, logId } = route.params;
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [usingFrontCamera, setUsingFrontCamera] = useState(true);
    const [localStreamVersion, setLocalStreamVersion] = useState(0);
    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                pan.flattenOffset(); // ✅ Apply final translation
            },
        })
    ).current;

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const { socketId, on, emit, removeListener } = useSocket(() => { });


    useEffect(() => {
        on('user-connected', (data) => {
            //('response from the user connedcted in incoming call ', data);
        })
    }, [socketId, on])


    useEffect(() => {
        const handleCallEnded = (data) => {
            // //('response from the call ended in incomimgvideo call ', data);
            hangUp();  // Automatically hang up the call when the event is received
        };

        on('callEnded', handleCallEnded);

        return () => removeListener('callEnded', handleCallEnded);
    }, [socketId, on, removeListener]);

    // Function to create the Peer Connection
    const createPeerConnection = (from, isAccepted) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnectionRef.current = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            remoteStreamRef.current = stream;
            setRemoteStream(stream);
        };

        // If the call is accepted, send the offer or answer
        if (isAccepted) {
            pc.createOffer().then((offer) => {
                pc.setLocalDescription(offer);
                emit('signal', {
                    userToSignal: from,
                    from: socketId,
                    signal: { type: offer.type, sdp: offer.sdp },
                });
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                emit('signal', {
                    userToSignal: from,
                    from: socketId,
                    signal: { type: 'candidate', candidate: event.candidate },
                });
            }
        };
    };

    // Handle incoming call acceptance and ensure speakerphone is on
    useEffect(() => {
        const handleCallAccepted = ({ from }) => {
            createPeerConnection(from, true);  // Create peer connection and accept the call
        };
        on('videoCallAccepted', handleCallAccepted);

        return () => removeListener('videoCallAccepted', handleCallAccepted);
    }, [socketId]);

    useEffect(() => {
        const startCamera = async () => {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: { facingMode: 'user' },
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            setLocalStreamVersion(prev => prev + 1);
            InCallManager.setForceSpeakerphoneOn(true); // Force speakerphone
            InCallManager.start(); // Start InCallManager to manage the call session
            InCallManager.setSpeakerphoneOn(true); // Explicitly ensure speakerphone is on
        };

        startCamera();

        return () => {
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    useEffect(() => {
        if (!localStreamRef.current || !socketId) return;

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnectionRef.current = pc;

        localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
        });

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            remoteStreamRef.current = stream;
            setRemoteStream(stream);
        };
    }, [socketId, localStreamRef.current]);

    useEffect(() => {
        const handleSignal = async ({ from, signal, userToSignal = socketId }) => {
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
            }

            if (signal?.type === 'candidate') {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate:', err);
                }
            }
        };

        on('signal', handleSignal);
        return () => removeListener('signal', handleSignal);
    }, [socketId, on, emit]);

    const hangUp = () => {
        emit('end-video-call', { roomId: videoRoomId, from: userId, logId: logId });

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current.release();
            localStreamRef.current = null;
        }

        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((track) => track.stop());
            remoteStreamRef.current.release?.();
            remoteStreamRef.current = null;
        }

        setLocalStream(null);
        setRemoteStream(null);
        setIsMuted(false);
        setIsVideoEnabled(true);

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {remoteStream ? (
                <RTCView
                    streamURL={remoteStream.toURL()}
                    style={styles.remoteVideo}
                    objectFit="cover"
                />
            ) : (
                <Text style={styles.loadingText}>Connecting</Text>
            )}

            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.localVideoWrapper,
                    { transform: pan.getTranslateTransform() },
                ]}
            >
                {localStream?.toURL?.() ? (
                    <RTCView
                        key={`local-${localStreamVersion}`}
                        streamURL={localStream.toURL()}
                        style={styles.localVideo}
                        objectFit="cover"
                        mirror={usingFrontCamera}
                        zOrder={1} // ✅ optional but helps on Android
                    />
                ) : (
                    <View style={[styles.localVideo, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#fff' }}>Loading camera...</Text>
                    </View>
                )}
            </Animated.View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
                        if (audioTrack) {
                            audioTrack.enabled = !audioTrack.enabled;
                            setIsMuted(!audioTrack.enabled);
                        }
                    }}
                >
                    <Image source={isMuted ? images.mute : images.mic} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
                        if (videoTrack) {
                            videoTrack.enabled = !videoTrack.enabled;
                            setIsVideoEnabled(videoTrack.enabled);
                        }
                    }}
                >
                    <Image source={isVideoEnabled ? images.video : images.videooff} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
                        if (videoTrack && typeof videoTrack._switchCamera === 'function') {
                            videoTrack._switchCamera();
                            setUsingFrontCamera(!usingFrontCamera);
                        }
                    }}
                >
                    <Image source={images.swap} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlButton, styles.hangup]} onPress={hangUp}>
                    <Text style={styles.controlIcon}>📞</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    remoteVideo: { flex: 1 },
    // localVideo: {
    //     position: 'absolute',
    //     width: 120,
    //     height: 160,
    //     bottom: 100,
    //     right: 20,
    //     borderRadius: 8,
    //     borderWidth: 1,
    //     borderColor: '#fff',
    //     zIndex: 10,
    // },
    localVideoWrapper: {
        position: 'absolute',
        width: 120,
        height: 160,
        bottom: 100,
        right: 20,
        borderRadius: 8,
        overflow: 'hidden',
        zIndex: 999,
        elevation: 10,
        backgroundColor: '#000', // ✅ MUST be here or Android shows transparent
    },

    localVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000', // ✅ Prevents transparent box
        borderRadius: 8,
        overflow: 'hidden',
    },
    loadingText: { color: '#fff', textAlign: 'center', marginTop: 20 },
    controls: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    controlButton: {
        backgroundColor: '#444',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hangup: { backgroundColor: '#E53935' },
    controlIcon: { color: '#fff', fontSize: 18 },
    icon: { width: 30, height: 30, tintColor: 'white' },
});

export default IncomingVideoCallScreen;


