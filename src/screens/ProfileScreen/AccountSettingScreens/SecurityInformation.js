// import React, { useState, useEffect, useContext, useRef } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView, Alert, TextInput } from "react-native";
// import images from "../../../components/images";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import Toast from 'react-native-simple-toast'
// import { AuthContext } from "../../../components/AuthProvider";
// import RBSheet from "react-native-raw-bottom-sheet";
// import { Picker } from '@react-native-picker/picker';
// import { GARAMOND, POPPINSRFONTS } from "../../../components/GlobalStyle";



// const SecurityInformation = ({ navigation }) => {

//     const [securityQuestions, setSecurityQuestions] = useState(false);
//     const [twoFactorAuth, setTwoFactorAuth] = useState(false);
//     const [loginalert, setLoginAlert] = useState(false)
//     const [profileprivacy, setProfilePrivacy] = useState(false)
//     const [passwordreset, setPasswordReset] = useState(false)
//     const [showalldevices, setShowAllDevices] = useState(false)
//     const [showmobiledevices, setShowMobileDevices] = useState(false)
//     const [showonlydesktop, setShowOnlyDesktop] = useState(false)
//     const [allowlogin, setAllowLogin] = useState(false)
//     const [anyone, setAnyone] = useState(false)
//     const [membersonly, setMembersOnly] = useState(false)
//     const [matchesonly, setMatchesOnly] = useState(false)
//     const [nonmatches, setNonMatches] = useState(false)
//     const [browsingmode, setBrowsingMode] = useState(false)
//     const [tracking, setTracking] = useState(false)
//     const [onlinestatus, setOnlinetatus] = useState(false)
//     const [lasttimeactive, setLastTimeActive] = useState(false)
//     const [thirdparty, setThirdParty] = useState(false)
//     const [userdetails, setUserDetails] = useState(null)
//     const [isDeactivated, setIsDeactivated] = useState(false);
//     const { logout } = useContext(AuthContext);
//     const [confirmpassword, setConfirmPassword] = useState('')
//     const [confirmpassword1, setConfirmPassword1] = useState('')
//     const [question1, setQuestion1] = useState('');
//     const [answer1, setAnswer1] = useState('');
//     const [otherreason, setOtherReason] = useState('')
//     const [isPasswordVisible, setPasswordVisible] = useState(false);




//     const rbSheetRef = useRef();
//     const rbSheetRef1 = useRef();

//     const reasonList = [

//         { label: 'Found a Match', value: 'q1' },
//         { label: 'Taking a Break', value: 'q2' },
//         { label: 'I did not find the app useful', value: 'q3' },
//         { label: 'I experienced technical issues', value: 'q4' },
//         { label: 'I had concerns about privacy and safety', value: 'q5' },
//         { label: 'The subscription pricing is too high', value: 'q6' },
//         { label: 'Other', value: 'q7' },

//     ];

//     const renderDropdownWithInput = (label, selectedValue, setSelectedValue, answerValue, setAnswerValue) => (
//         <View style={styles.dropdownContainer}>
//             <View style={styles.dropdown}>
//                 <Picker
//                     selectedValue={selectedValue}
//                     onValueChange={(value) => setSelectedValue(value)}
//                     style={styles.picker}
//                     dropdownIconColor="transparent"
//                 >
//                     <Picker.Item label={label} value="" />
//                     {reasonList.map((question) => (
//                         <Picker.Item
//                             key={question.value}
//                             label={question.label}
//                             value={question.label}
//                         />
//                     ))}
//                 </Picker>
//                 {/* <Image source={images.dropdown} style={styles.downArrowIcon} /> */}
//             </View>

//         </View>
//     );


//     useEffect(() => {
//         const fetchUserDetails = async () => {
//             try {
//                 const data = await AsyncStorage.getItem('UserData');
//                 if (data !== null) {
//                     const parsedData = JSON.parse(data);
//                     setUserDetails(parsedData);
//                     setIsDeactivated(parsedData?.active === false);
//                 }
//             } catch (error) {
//                 console.log('Error fetching user data:', error);
//             }
//         };
//         fetchUserDetails();
//     }, []);


//     useEffect(() => {
//         loadSettingsFromStorage();
//     }, []);

//     useEffect(() => {
//         handleSecurity()
//     }, [twoFactorAuth, loginalert, profileprivacy, passwordreset, showalldevices, showmobiledevices, showonlydesktop, allowlogin, anyone, membersonly, matchesonly, nonmatches, browsingmode, tracking, onlinestatus, lasttimeactive, thirdparty])


//     const handleSecurity = async () => {
//         const token = await AsyncStorage.getItem('authToken');
//         const headers = {
//             Authorization: token,
//         };
//         let body = {
//             privacyAndSecuritySetting: {
//                 securitySetting: {
//                     toFactorAuth: twoFactorAuth,
//                     loginAlert: loginalert,
//                     profilePrivacyMode: profileprivacy,
//                     passwordResetNotifications: passwordreset
//                 },
//                 deviceManagement: {
//                     showAllDevices: showalldevices,
//                     onlyMobileDevices: showmobiledevices,
//                     onlyDesktops: showonlydesktop,
//                     allowLoginFromAnyDevice: allowlogin
//                 },
//                 profileVisibility: {
//                     anyone: anyone,
//                     members: membersonly,
//                     matches: matchesonly,
//                     nonMembers: nonmatches
//                 },
//                 additionalPrivacySettings: {
//                     anonymousBrowsing: browsingmode,
//                     activityHistory: tracking
//                 },
//                 onlineStatus: {
//                     showOnlineStatus: onlinestatus,
//                     showLastActive: lasttimeactive
//                 },
//                 thirdPartyAccess: {
//                     thirdPartyServices: thirdparty
//                 }
//             },

//         }

//         try {
//             const resp = await axios.put(`account/update-account-settings/${userdetails?._id}`, body, { headers })
//             // console.log('response from handle security', resp.data.data);
//             await AsyncStorage.setItem('accountSecurity', JSON.stringify(body));

//         } catch (error) {
//             console.log('error from handle security', error.response.data.message);
//         }
//     }

//     const loadSettingsFromStorage = async () => {
//         try {
//             const storedSettings = await AsyncStorage.getItem('accountSecurity');
//             if (storedSettings) {
//                 const parsedSettings = JSON.parse(storedSettings);
//                 setTwoFactorAuth(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.toFactorAuth);
//                 setLoginAlert(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.loginAlert);
//                 setProfilePrivacy(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.profilePrivacyMode);
//                 setPasswordReset(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.passwordResetNotifications);
//                 setShowAllDevices(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.showAllDevices);
//                 setShowMobileDevices(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.onlyMobileDevices);
//                 setShowOnlyDesktop(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.onlyDesktops);
//                 setAllowLogin(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.allowLoginFromAnyDevice);
//                 setAnyone(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.anyone);
//                 setMembersOnly(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.members);
//                 setMatchesOnly(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.matches);
//                 setNonMatches(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.nonMembers);
//                 setBrowsingMode(parsedSettings?.privacyAndSecuritySetting?.additionalPrivacySettings?.anonymousBrowsing);
//                 setTracking(parsedSettings?.privacyAndSecuritySetting?.additionalPrivacySettings?.activityHistory);
//                 setOnlinetatus(parsedSettings?.privacyAndSecuritySetting?.onlineStatus?.showOnlineStatus);
//                 setLastTimeActive(parsedSettings?.privacyAndSecuritySetting?.onlineStatus?.showLastActive);
//                 setThirdParty(parsedSettings?.privacyAndSecuritySetting?.thirdPartyAccess?.thirdPartyServices);
//             } else {
//                 fetchAccountSettings();
//             }
//         } catch (error) {
//             console.error('Error loading settings from storage:', error.message);
//             fetchAccountSettings();
//         }
//     };

//     const fetchAccountSettings = async () => {
//         try {
//             const token = await AsyncStorage.getItem('authToken');
//             const headers = { Authorization: token };
//             const response = await axios.get(`account/get-account-settings/${userdetails?._id}`, { headers });
//             const data = response.data.data;
//             setTwoFactorAuth(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.toFactorAuth);
//             setLoginAlert(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.loginAlert);
//             setProfilePrivacy(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.profilePrivacyMode);
//             setPasswordReset(parsedSettings?.privacyAndSecuritySetting?.securitySetting?.passwordResetNotifications);
//             setShowAllDevices(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.showAllDevices);
//             setShowMobileDevices(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.onlyMobileDevices);
//             setShowOnlyDesktop(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.onlyDesktops);
//             setAllowLogin(parsedSettings?.privacyAndSecuritySetting?.deviceManagement?.allowLoginFromAnyDevice);
//             setAnyone(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.anyone);
//             setMembersOnly(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.members);
//             setMatchesOnly(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.matches);
//             setNonMatches(parsedSettings?.privacyAndSecuritySetting?.profileVisibility?.nonMembers);
//             setBrowsingMode(parsedSettings?.privacyAndSecuritySetting?.additionalPrivacySettings?.anonymousBrowsing);
//             setTracking(parsedSettings?.privacyAndSecuritySetting?.additionalPrivacySettings?.activityHistory);
//             setOnlinetatus(parsedSettings?.privacyAndSecuritySetting?.onlineStatus?.showOnlineStatus);
//             setLastTimeActive(parsedSettings?.privacyAndSecuritySetting?.onlineStatus?.showLastActive);
//             setThirdParty(parsedSettings?.privacyAndSecuritySetting?.thirdPartyAccess?.thirdPartyServices)
//             await AsyncStorage.setItem('accountSecurity', JSON.stringify(data));
//         } catch (error) {
//             console.error('Error fetching account settings:', error.message);
//         }
//     }


//     const showConfirmDialog = () => {
//         return Alert.alert(
//             isDeactivated ? "Reactivate?" : "Deactivate?",
//             `Are you sure you want to ${isDeactivated ? "reactivate" : "deactivate"} your account?`,
//             [
//                 {
//                     text: "Yes",
//                     onPress: () => {
//                         // userDeactivateAccount();
//                         rbSheetRef?.current?.open();
//                     },
//                 },
//                 {
//                     text: "No",
//                 },
//             ]
//         );
//     };

//     const showConfirmDialogPermanentDelete = () => {
//         return Alert.alert(
//             "Permanent Delete?",
//             `Are you sure you want to permanent delete your account?`,
//             [
//                 {
//                     text: "Yes",
//                     onPress: () => {
//                         // userPermanentDeleteAccount();
//                         rbSheetRef1?.current?.open();
//                     },
//                 },
//                 {
//                     text: "No",
//                 },
//             ]
//         );
//     };

//     const confirmDeactivate = async () => {
//         userDeactivateAccount()
//     }

//     const confirmPermanentDelete = async () => {
//         userPermanentDeleteAccount()
//     }

//     const userDeactivateAccount = async () => {
//         const token = await AsyncStorage.getItem('authToken');
//         const headers = { Authorization: token };
//         let body = {
//             status: false,
//             password: confirmpassword
//         };
//         try {
//             const resp = await axios.post('auth/deactivate-account', body, { headers });
//             console.log('response from the deactivate/reactivate account', resp.data);
//             Toast.show(resp?.data?.message, Toast.SHORT)
//             rbSheetRef.current?.close();
//             logout()
//             // const updatedUserDetails = { ...userdetails, active: !userdetails?.active };
//             // await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserDetails));
//             // setUserDetails(updatedUserDetails);
//             // setIsDeactivated(!userdetails?.active);
//         } catch (error) {
//             Toast.show(error.response.data.message, Toast.SHORT)
//             rbSheetRef.current?.close();
//             console.log('error from the deactivate/reactivate account', error.response.data.message);
//         }
//     };


//     const userPermanentDeleteAccount = async () => {
//         const token = await AsyncStorage.getItem('authToken')
//         const headers = {
//             Authorization: token,
//         }
//         let body = {
//             password: confirmpassword1,
//             reason: question1,
//             otherReason: otherreason
//         }
//         console.log('body of permanent delete', body);
//         try {
//             const resp = await axios.post('auth/delete-account', body, { headers })
//             console.log('response from the permanent delete account', resp?.data?.message);
//             Toast.show(resp?.data?.message, Toast.SHORT)
//             rbSheetRef1.current?.close();
//             logout()
//         } catch (error) {
//             Toast.show(error?.response?.data?.message, Toast.SHORT)
//             rbSheetRef1.current?.close();
//             console.log('error from the permanent deete account', error?.response?.data?.message);
//         }
//     }


//     return (
//         <View style={styles.mainContainer}>
//             {/* Header */}
//             <View style={styles.headerContainer}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Image source={images.back} style={styles.backIcon} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerText}>Security Information</Text>
//             </View>
//             <ScrollView>
//                 {/* Security Information Section */}
//                 <Text style={styles.sectionTitle}>Security Information</Text>
//                 <Text style={styles.sectionDescription}>
//                     Here are our options to give your account some additional security:
//                 </Text>
//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', bottom: 10 }} />

//                 {/* Two-Factor Authentication */}
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={styles.subHeader}>Two-Factor Authentication</Text>
//                         <Switch
//                             value={twoFactorAuth}
//                             onValueChange={() => setTwoFactorAuth((prev) => !prev)}
//                             trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                             thumbColor={"#FFF"}
//                         />
//                     </View>
//                 </View>
//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', bottom: 10 }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={styles.subHeader}>Login Alerts</Text>
//                         <Switch
//                             value={loginalert}
//                             onValueChange={() => setLoginAlert((prev) => !prev)}
//                             trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                             thumbColor={"#FFF"}
//                         />
//                     </View>
//                 </View>

//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', bottom: 10 }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={styles.subHeader}>Profile privacy Mode</Text>
//                         <Switch
//                             value={profileprivacy}
//                             onValueChange={() => setProfilePrivacy((prev) => !prev)}
//                             trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                             thumbColor={"#FFF"}
//                         />
//                     </View>
//                 </View>


//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', bottom: 10 }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={styles.subHeader}>Password Reset Notifications</Text>
//                         <Switch
//                             value={passwordreset}
//                             onValueChange={() => setPasswordReset((prev) => !prev)}
//                             trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                             thumbColor={"#FFF"}
//                         />
//                     </View>
//                 </View>

//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', bottom: 10 }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={styles.subHeader}>Device Management</Text>
//                     </View>
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Show all devices</Text>
//                     <Switch
//                         value={showalldevices}
//                         onValueChange={() => setShowAllDevices((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}
//                     />
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Show only mobile devices</Text>
//                     <Switch
//                         value={showmobiledevices}
//                         onValueChange={() => setShowMobileDevices((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}

//                     />
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Show only desktops</Text>
//                     <Switch
//                         value={showonlydesktop}
//                         onValueChange={() => setShowOnlyDesktop((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}

//                     />
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Allow login from any device</Text>
//                     <Switch
//                         value={allowlogin}
//                         onValueChange={() => setAllowLogin((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}

//                     />
//                 </View>
//                 {/*PROFILE VISIBILITY*/}

//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={[styles.subHeader, { top: 10 }]}>Profile Visibility</Text>
//                     </View>
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Anyone</Text>
//                     <Switch
//                         value={anyone}
//                         onValueChange={() => setAnyone((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}

//                     />
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Members Only</Text>
//                     <Switch
//                         value={membersonly}
//                         onValueChange={() => setMembersOnly((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}

//                     />
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Matches Only</Text>
//                     <Switch
//                         value={matchesonly}
//                         onValueChange={() => setMatchesOnly((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}

//                     />
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Non-Members Only</Text>
//                     <Switch
//                         value={nonmatches}
//                         onValueChange={() => setNonMatches((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}

//                     />
//                 </View>

//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={[styles.subHeader, { top: 5 }]}>Anonymous Browsing Mode</Text>
//                         <Switch
//                             value={browsingmode}
//                             onValueChange={() => setBrowsingMode((prev) => !prev)}
//                             trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                             thumbColor={"#FFF"}
//                             style={{}}
//                         />
//                     </View>
//                 </View>

//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={[styles.subHeader, { top: 5 }]}>Activity History Tracking</Text>
//                         <Switch
//                             value={tracking}
//                             onValueChange={() => setTracking((prev) => !prev)}
//                             trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                             thumbColor={"#FFF"}
//                             style={{}}
//                         />
//                     </View>
//                 </View>


//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', top: 10 }} />
//                 <Text style={[styles.subHeader, { fontSize: 25, top: 15 }]}>Privacy Settings </Text>
//                 <Text style={[styles.privacyDescription, { top: 5, fontSize: 14 }]}>
//                     Here are our options to give your account some additional security:
//                 </Text>


//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', top: 10 }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={[styles.subHeader, { top: 20 }]}>Online Status</Text>
//                     </View>
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={[styles.toggleText, { top: 10 }]}>Online Status</Text>
//                     <Switch
//                         value={onlinestatus}
//                         onValueChange={() => setOnlinetatus((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}

//                     />
//                 </View>
//                 <View style={styles.toggleContainer}>
//                     <Text style={styles.toggleText}>Show Last Active Time</Text>
//                     <Switch
//                         value={lasttimeactive}
//                         onValueChange={() => setLastTimeActive((prev) => !prev)}
//                         trackColor={{ false: "#C4C4C4", true: "#916008" }}
//                         thumbColor={"#FFF"}
//                         style={{ bottom: 4 }}
//                     />
//                 </View>


//                 <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', }} />
//                 <View style={styles.sectionContainer}>
//                     <View style={styles.toggleContainer}>
//                         <Text style={[styles.subHeader, { top: 20 }]}>Account Deactivation/Deletion</Text>
//                     </View>
//                 </View>
//                 <View>
//                     <Text style={[styles.toggleText, { marginTop: 20 }]}>Temporarily disable your account while retaining all data.</Text>
//                 </View>

//                 <TouchableOpacity onPress={() => rbSheetRef?.current?.open()} style={{ borderWidth: 1, height: 50, width: '90%', justifyContent: 'center', alignSelf: 'center', borderRadius: 100, borderColor: '#916008', backgroundColor: '#916008', top: 10 }}>
//                     <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-Medium' }}>{isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}</Text>
//                 </TouchableOpacity>

//                 <View style={{ marginTop: 30, }}>
//                     <Text style={styles.toggleText}>Delete Account</Text>
//                 </View>

//                 <TouchableOpacity onPress={() => rbSheetRef1?.current?.open()} style={{ borderWidth: 1, height: 50, width: '90%', justifyContent: 'center', alignSelf: 'center', borderRadius: 100, borderColor: '#916008', backgroundColor: '#916008', top: 10, marginBottom: 30 }}>
//                     <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-Medium' }}>Delete Account</Text>
//                 </TouchableOpacity>
//             </ScrollView>


//             <RBSheet
//                 ref={rbSheetRef}
//                 height={400}
//                 openDuration={250}
//                 closeOnDragDown={true}
//                 customStyles={{
//                     container: {
//                         borderTopLeftRadius: 20,
//                         borderTopRightRadius: 20,
//                     },
//                     draggableIcon: {
//                         backgroundColor: "#C4C4C4",
//                     },
//                 }}
//             >
//                 <View style={{ marginLeft: 16, marginRight: 16 }}>
//                     <Text style={{ textAlign: 'center', fontSize: 24, color: "black", fontFamily: GARAMOND.bold, marginTop: 10 }}>Are you sure you want to deactivate your account?</Text>
//                     <Text style={{ color: '#3C4043', fontSize: 14, fontFamily: POPPINSRFONTS.regular, textAlign: "center", marginTop: 10 }}>Your account will be temporarily disabled. You can log in again anytime using the same credentials to reactivate it.</Text>

//                     <View style={styles.inputContainer1}>
//                         <TextInput
//                             style={[styles.input1, { flex: 1 }]}
//                             placeholder="Enter Password"
//                             placeholderTextColor="#B0B0B0"
//                             secureTextEntry={!isPasswordVisible}
//                             value={confirmpassword}
//                             onChangeText={setConfirmPassword}
//                         />
//                         <TouchableOpacity
//                             onPress={() => setPasswordVisible(!isPasswordVisible)}
//                             style={styles.eyeIconContainer}
//                         >
//                             <Image
//                                 source={isPasswordVisible ? images.openeye : images.closeeye}
//                                 style={styles.eyeIcon}
//                             />
//                         </TouchableOpacity>
//                     </View>
//                     <TouchableOpacity onPress={() => rbSheetRef.current.close()} style={{ top: 40, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#DDDDDD', backgroundColor: 'white' }}>
//                         <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Cancel</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={() => confirmDeactivate()} style={{ top: 60, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#916008', backgroundColor: '#916008' }}>
//                         <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Confirm Deactivate</Text>
//                     </TouchableOpacity>
//                 </View>
//             </RBSheet>
//             <RBSheet
//                 ref={rbSheetRef1}
//                 height={520}
//                 openDuration={250}
//                 closeOnDragDown={true}
//                 customStyles={{
//                     container: {
//                         borderTopLeftRadius: 20,
//                         borderTopRightRadius: 20,
//                     },
//                     draggableIcon: {
//                         backgroundColor: "#C4C4C4",
//                     },
//                 }}
//             >
//                 <View style={{ marginRight: 16, marginLeft: 16 }}>
//                     <Text style={{ textAlign: 'center', fontSize: 24, color: "black", fontFamily: GARAMOND.bold, marginTop: 10 }}>Are you sure you want to delete your account?</Text>
//                     <Text style={{ color: '#3C4043', fontSize: 14, fontFamily: POPPINSRFONTS.regular, textAlign: "center", marginTop: 10 }}>This action is irreversible. All your data will be lost, and you'll need to create a new account to use our services again.</Text>
//                     <View style={{ marginTop: 20 }}>
//                         {renderDropdownWithInput('select your reason', question1, setQuestion1, answer1, setAnswer1)}
//                     </View>
//                     {question1 === 'Other' ?
//                         <TextInput
//                             placeholder="Enter your reason here "
//                             placeholderTextColor='grey'
//                             value={otherreason}
//                             maxLength={100}
//                             onChangeText={setOtherReason}
//                             style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', paddingLeft: 20, borderColor: '#DDDDDD', color: 'black', borderRadius: 10, }}

//                         />
//                         :
//                         null}

//                     <View style={[styles.inputContainer1, {}]}>
//                         <TextInput
//                             style={[styles.input1, { flex: 1 }]}
//                             placeholder="Enter Password"
//                             placeholderTextColor="#B0B0B0"
//                             secureTextEntry={!isPasswordVisible}
//                             value={confirmpassword1}
//                             onChangeText={setConfirmPassword1}
//                         />
//                         <TouchableOpacity
//                             onPress={() => setPasswordVisible(!isPasswordVisible)}
//                             style={styles.eyeIconContainer}
//                         >
//                             <Image
//                                 source={isPasswordVisible ? images.openeye : images.closeeye}
//                                 style={styles.eyeIcon}
//                             />
//                         </TouchableOpacity>
//                     </View>
//                     <View style={{ marginTop: question1 !== 'Other' ? 20 : null }}>
//                         <TouchableOpacity onPress={() => rbSheetRef1.current.close()} style={{ top: 30, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#DDDDDD', backgroundColor: 'white' }}>
//                             <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Cancel</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => confirmPermanentDelete()} style={{ top: 50, borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 100, justifyContent: "center", borderColor: '#916008', backgroundColor: '#916008' }}>
//                             <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Confirm Delete</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </RBSheet>

//         </View>
//     );
// };

// export default SecurityInformation;

// const styles = StyleSheet.create({
//     mainContainer: {
//         flex: 1,
//         backgroundColor: "#FFF",
//         paddingHorizontal: 20,
//         paddingTop: 40,
//     },
//     headerContainer: {
//         flexDirection: "row",
//         alignItems: "center",
//         marginBottom: 20,
//     },
//     backIcon: {
//         width: 20,
//         height: 20,
//         marginRight: 10,
//     },
//     headerText: {
//         fontSize: 23,
//         fontFamily: POPPINSRFONTS.medium,
//         color: "black",
//         top: 3
//     },
//     sectionTitle: {
//         fontSize: 24,
//         fontFamily: POPPINSRFONTS.semibold,
//         color: "black",
//         // marginBottom: 10,
//     },
//     sectionDescription: {
//         fontSize: 14,
//         fontFamily: "Poppins-Regular",
//         color: "#5F6368",
//         marginBottom: 20,
//     },
//     sectionContainer: {
//         // marginBottom: 20,
//     },
//     toggleContainer: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         marginBottom: 5,
//     },
//     subHeader: {
//         fontSize: 16,
//         fontFamily: "Poppins-SemiBold",
//         color: "black",
//     },
//     descriptionText: {
//         fontSize: 12,
//         fontFamily: "Poppins-Regular",
//         color: "#5F6368",
//         marginTop: 5,
//     },
//     privacyContainer: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         marginTop: 20,
//     },
//     arrowIcon: {
//         width: 20,
//         height: 20,
//         tintColor: "#916008",
//     },
//     privacyDescription: {
//         fontSize: 12,
//         fontFamily: "Poppins-Regular",
//         color: "#5F6368",
//         marginTop: 5,
//     },

//     toggleText: {
//         fontSize: 16,
//         fontFamily: "Poppins-Regular",
//         color: "black",
//     },
//     dropdownContainer: {
//         marginBottom: 20,
//     },
//     dropdown: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         backgroundColor: 'white',
//         height: 50,
//         paddingHorizontal: 10,
//         position: 'relative',
//         width: '90%',
//         alignSelf: 'center'
//     },
//     picker: {
//         flex: 1,
//         color: '#000',
//     },
//     downArrowIcon: {
//         width: 20,
//         height: 20,
//         position: 'absolute',
//         right: 15,
//         tintColor: '#999',
//     },
//     textInput: {
//         marginTop: 10,
//         height: 50,
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         paddingHorizontal: 10,
//         fontSize: 14,
//         color: '#000',
//     },
//     inputContainer1: {
//         flexDirection: 'row', // Aligns the text input and eye icon horizontally
//         alignItems: 'center',
//         borderColor: '#DDDDDD',
//         borderRadius: 10, // Rounded corners for the container
//         borderWidth: 1, // Border for the input container
//         height: 50, // Adjust height for consistent input size
//         width: '90%', // Take full width
//         marginTop: 20, // Add space from the previous element
//         position: 'relative',
//         alignSelf: 'center'
//     },
//     input1: {
//         flex: 1, // The input takes up the remaining space
//         paddingLeft: 20,
//         height: '100%',
//         borderRadius: 100,
//         color: '#000',
//         fontFamily: 'Poppins-Regular',
//         fontSize: 14,
//     },

//     eyeIconContainer: {
//         position: 'absolute',
//         right: 10, // Positions the eye icon at the far right of the container
//         top: '50%',
//         transform: [{ translateY: -10 }], // Centers the icon vertically
//     },

//     eyeIcon: {
//         height: 20,
//         width: 20,
//     },

// });
