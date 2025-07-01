import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, PanResponder, Animated } from 'react-native';
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


const VideoCallScreen = ({ route, navigation }) => {

  const { selectedUser, videoRoomId, userId } = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [usingFrontCamera, setUsingFrontCamera] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [outgoingcall, setOutgoingCall] = useState(null)
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
        pan.setValue({ x: 0, y: 0 }); // ✅ Reset current value before dragging
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

  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const { emit, on, removeListener, socketId } = useSocket(() => { });


  useEffect(() => {
    on('user-connected', (data) => {
      console.log('response fromt he user connedcted', data);
    })
  }, [socketId, on])


  useEffect(() => {
    on('videoCallRequestResponse', (data) => {
      console.log('respone from the video call response', data);
      setOutgoingCall(data)
    })
  }, [socketId, on])

  useEffect(() => {
    const handleCallEnded = (data) => {
      console.log('response from the call ended', data);
      hangUp();
    };

    on('callEnded', handleCallEnded);

    return () => removeListener('callEnded', handleCallEnded);
  }, [socketId, on, removeListener]);


  useEffect(() => {
    InCallManager.start({ media: 'video' });

    // Delay helps force audio to speaker on Android
    const timeout = setTimeout(() => {
      InCallManager.setForceSpeakerphoneOn(true);
    }, 500);

    return () => {
      clearTimeout(timeout);
      InCallManager.stop();
    };
  }, []);


  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user' },
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        setLocalStreamVersion(prev => prev + 1);
        console.log('Set localStreamVersion to', localStreamVersion + 1);

      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };
    startCamera();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
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

      // console.log('handle signal', userToSignal, from, signal);

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
        // console.log('✅ Remote stream tracks:', inboundStream.getTracks()); 
        // console.log('🔊 Remote audio tracks:', inboundStream.getAudioTracks());
        remoteStreamRef.current = inboundStream;
        setRemoteStream(inboundStream);
        setLocalStreamVersion(prev => prev + 1);
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
      localStreamRef.current.release(); // Important on Android
      localStreamRef.current = null;
    }

    // Stop remote stream tracks
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      remoteStreamRef.current.release?.(); // optional
      remoteStreamRef.current = null;
    }

    // Clear component state
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoEnabled(true);

    // Navigate back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Remote Video Fullscreen */}
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.loadingText}>
            {
              outgoingcall?.isReceiverInCall === true
                ? 'Busy'
                : outgoingcall?.isReceiverAvailable === false
                  ? 'Unavailable'
                  : outgoingcall?.isReceiverOnline === true
                    ? 'Ringing'
                    : 'Calling'
            }
          </Text>
        </View>

      )}

      {/* Local Video Preview (Small box) */}
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




      {/* Bottom Buttons */}
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
          <Image source={isMuted ? images.mute : images.mic} style={{ height: 30, width: 30, tintColor: 'white' }} />
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
          {/* <Text style={styles.controlIcon}>{isVideoEnabled ? '🎥' : '🚫🎥'}</Text> */}
          <Image source={isVideoEnabled ? images.video : images.videooff} style={{ height: 30, width: 30, tintColor: 'white' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={async () => {
            const videoTrack = localStreamRef.current?.getVideoTracks()[0];
            if (videoTrack && typeof videoTrack._switchCamera === 'function') {
              videoTrack._switchCamera();
              setUsingFrontCamera(!usingFrontCamera);
            }
          }}
        >
          <Image source={images.swap} style={{ height: 30, width: 30, tintColor: 'white' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.hangupButton]}
          onPress={hangUp}
        >
          <Text style={styles.controlIcon}>📞</Text>
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
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  // localVideo: {
  //   position: 'absolute',
  //   width: 120,
  //   height: 160,
  //   bottom: 100,
  //   right: 20,
  //   borderRadius: 8,
  //   overflow: 'hidden',
  //   borderWidth: 1,
  //   borderColor: '#fff',
  //   zIndex: 10, // ✅ this ensures it's above remote video
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
    backgroundColor: '#000',
  },

  localVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },

  loadingText: {
    color: '#fff',
    alignSelf: 'center',
    marginTop: 20,
    fontSize: 20
  },
  topBar: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  calleeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  callingText: {
    color: '#bbb',
    fontSize: 14,
  },

  controls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hangupButton: {
    backgroundColor: '#E53935',
  },

  controlIcon: {
    color: '#fff',
    fontSize: 20,
  },

});

export default VideoCallScreen;