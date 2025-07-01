// import RNCallKeep from 'react-native-callkeep';
// import uuid from 'react-native-uuid';

// const options = {
//   ios: {
//     appName: 'LuxuryLife',
//   },
//   android: {
//     alertTitle: 'Permissions Required',
//     alertDescription: 'This app needs permission to show call UI',
//     cancelButton: 'Cancel',
//     okButton: 'OK',
//     foregroundService: {
//       channelId: 'com.luxurylife.calls',
//       channelName: 'Call Notifications',
//       notificationTitle: 'LuxuryLife Video Call',
//       notificationIcon: 'ic_launcher', // in android/app/src/main/res/mipmap
//     },
//   },
// };

// let currentCallUUID = null;

// const setup = async () => {
//   await RNCallKeep.setup(options);
//   RNCallKeep.setAvailable(true);
// };

// const showIncomingCall = async (callerName, callerId) => {
//   currentCallUUID = uuid.v4();

//   RNCallKeep.displayIncomingCall(
//     currentCallUUID,
//     callerName,
//     callerId || 'LuxuryLife',
//     'generic',
//     true
//   );

//   return currentCallUUID;
// };

// const onAnswerCall = (callback) => {
//   RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
//     if (callUUID === currentCallUUID) {
//       callback();
//     }
//   });
// };

// const onEndCall = (callback) => {
//   RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
//     if (callUUID === currentCallUUID) {
//       callback();
//     }
//   });
// };

// export default {
//   setup,
//   showIncomingCall,
//   onAnswerCall,
//   onEndCall,
// };
