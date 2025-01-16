import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, ScrollView } from "react-native";
import images from "../../../components/images";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationSettings = ({ navigation }) => {


  const userId = '677687b24cd0469415aa2c8a'
  const [messageAlert, setMessageAlert] = useState(false);
  const [favoriteAlert, setFavoriteAlert] = useState(false);
  const [emailMessage, setEmailMessage] = useState(false);
  const [emailFavorite, setEmailFavorite] = useState(false);
  const [emailViewProfile, setEmailViewProfile] = useState(false);
  const [newMatches, setNewMatches] = useState(false);
  const [profileApproved, setProfileApproved] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState(false);
  const [specialEvents, setSpecialEvents] = useState(false);
  const [newsUpdates, setNewsUpdates] = useState(false);
  const [promotions, setPromotions] = useState(false);
  const [unsubscribeAll, setUnsubscribeAll] = useState(false);
  const [userdetails, setUserDetails] = useState(null)




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

  const toggleUnsubscribeAll = (value) => {
    setUnsubscribeAll(value);
    if (value) {

      setMessageAlert(false);
      setFavoriteAlert(false);
      setEmailMessage(false);
      setEmailFavorite(false);
      setEmailViewProfile(false);
      setNewMatches(false);
      setProfileApproved(false);
      setVerificationRequests(false);
      setSpecialEvents(false);
      setNewsUpdates(false);
      setPromotions(false);
    }
  };

  const toggleIndividualSwitch = (setter, value) => {
    setter(value);
    if (value) {
      setUnsubscribeAll(false);
    }
  };

  ///// API INTERATION //////

  useEffect(() => {
    loadSettingsFromStorage();
  }, []);

  useEffect(() => {
    handleNotification()
  }, [messageAlert, favoriteAlert, emailMessage, emailFavorite, emailViewProfile, newMatches, profileApproved, verificationRequests, specialEvents, newsUpdates, promotions, unsubscribeAll])

  const handleNotification = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const headers = {
      Authorization: token,
    };
    let body = {
      notificationSetting: {
        appAlertMessage: {
          onceSendMeMessage: messageAlert,
          onceAddMeFavorite: favoriteAlert
        },
        emailAlert: {
          onceSendMeMessage: emailMessage,
          onceAddMeFavorite: emailFavorite,
          onceViewMyProfile: emailViewProfile,
          onNewMembers: newMatches,
          onceProfileApprove: profileApproved,
          onVerificationAndInformation: verificationRequests,
          onSpecialEvent: specialEvents,
          onNewsEvent: newsUpdates,
          onPromotionOtherOffer: promotions
        }
      }
    }
    console.log('body of handleNotification', body);

    try {
      const resp = await axios.put(`account/update-account-settings/${userdetails?._id}`, body, { headers })
      console.log('response from handle notification', resp.data.data);
      await AsyncStorage.setItem('notificationData', JSON.stringify(body));

    } catch (error) {
      console.log('error from handle notification', error.message);
    }
  }


  const loadSettingsFromStorage = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('notificationData');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setMessageAlert(parsedSettings.notificationSetting.appAlertMessage.onceSendMeMessage);
        setFavoriteAlert(parsedSettings.notificationSetting.appAlertMessage.onceAddMeFavorite);
        setEmailMessage(parsedSettings.notificationSetting.emailAlert.onceSendMeMessage);
        setEmailFavorite(parsedSettings.notificationSetting.emailAlert.onceAddMeFavorite);
        setEmailViewProfile(parsedSettings.notificationSetting.emailAlert.onceViewMyProfile);
        setNewMatches(parsedSettings.notificationSetting.emailAlert.onNewMembers);
        setProfileApproved(parsedSettings.notificationSetting.emailAlert.onceProfileApprove);
        setVerificationRequests(parsedSettings.notificationSetting.emailAlert.onVerificationAndInformation);
        setSpecialEvents(parsedSettings.notificationSetting.emailAlert.onSpecialEvent);
        setNewsUpdates(parsedSettings.notificationSetting.emailAlert.onNewsEvent);
        setPromotions(parsedSettings.notificationSetting.emailAlert.onPromotionOtherOffer);

      } else {
        fetchAccountSettings();
      }
    } catch (error) {
      console.error('Error loading settings from storage:', error.message);
      fetchAccountSettings();
    }
  };


  const fetchAccountSettings = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = { Authorization: token };
      const response = await axios.get(`account/get-account-settings/${userdetails?._id}`, { headers });
      const data = response.data.data;
      setMessageAlert(data.notificationSetting.appAlertMessage.onceSendMeMessage);
      setFavoriteAlert(data.notificationSetting.appAlertMessage.onceAddMeFavorite);
      setEmailMessage(data.notificationSetting.emailAlert.onceSendMeMessage);
      setEmailFavorite(data.notificationSetting.emailAlert.onceAddMeFavorite);
      setEmailViewProfile(data.notificationSetting.emailAlert.onceViewMyProfile);
      setNewMatches(data.notificationSetting.emailAlert.onNewMembers);
      setProfileApproved(data.notificationSetting.emailAlert.onceProfileApprove);
      setVerificationRequests(data.notificationSetting.emailAlert.onVerificationAndInformation);
      setSpecialEvents(data.notificationSetting.emailAlert.onSpecialEvent);
      setNewsUpdates(data.notificationSetting.emailAlert.onNewsEvent);
      setPromotions(data.notificationSetting.emailAlert.onPromotionOtherOffer);


      await AsyncStorage.setItem('notificationData', JSON.stringify(data));

    } catch (error) {
      console.error('Error fetching account settings:', error.message);
    }
  }

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.cont}>
          <Image source={images.back} style={styles.backIcon} />
          <Text style={styles.txt}>Notification Settings</Text>
        </View>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 40 }}>
        {/* In-app Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Show me in-app alerts when someone...</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Sends me a message</Text>
            <Switch
              value={messageAlert}
              onValueChange={(value) => toggleIndividualSwitch(setMessageAlert, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Adds me as a favorite</Text>
            <Switch
              value={favoriteAlert}
              onValueChange={(value) => toggleIndividualSwitch(setFavoriteAlert, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
        </View>

        {/* Email Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Send me an email when someone...</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Sends me a message</Text>
            <Switch
              value={emailMessage}
              onValueChange={(value) => toggleIndividualSwitch(setEmailMessage, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Adds me as a favorite</Text>
            <Switch
              value={emailFavorite}
              onValueChange={(value) => toggleIndividualSwitch(setEmailFavorite, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Views my profile</Text>
            <Switch
              value={emailViewProfile}
              onValueChange={(value) => toggleIndividualSwitch(setEmailViewProfile, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
        </View>

        {/* Email Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Also email me about...</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>New members & matches</Text>
            <Switch
              value={newMatches}
              onValueChange={(value) => toggleIndividualSwitch(setNewMatches, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>When my profile changes are approved</Text>
            <Switch
              value={profileApproved}
              onValueChange={(value) => toggleIndividualSwitch(setProfileApproved, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Verification & information requests</Text>
            <Switch
              value={verificationRequests}
              onValueChange={(value) => toggleIndividualSwitch(setVerificationRequests, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Special events</Text>
            <Switch
              value={specialEvents}
              onValueChange={(value) => toggleIndividualSwitch(setSpecialEvents, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>News and updates</Text>
            <Switch
              value={newsUpdates}
              onValueChange={(value) => toggleIndividualSwitch(setNewsUpdates, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Promotions and other offers</Text>
            <Switch
              value={promotions}
              onValueChange={(value) => toggleIndividualSwitch(setPromotions, value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
        </View>

        {/* Unsubscribe All */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[styles.sectionHeader, { fontFamily: "Poppins-Bold" }]}>Unsubscribe All</Text>
          <View style={{ bottom: 40 }}>
            <Switch
              value={unsubscribeAll}
              onValueChange={(value) => toggleUnsubscribeAll(value)}
              trackColor={{ false: "#C4C4C4", true: "#916008" }}
              thumbColor={"#FFF"}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
  },
  backIcon: {
    height: 20,
    width: 20,
    marginTop: 10,
  },
  cont: {
    flexDirection: "row",
    marginTop: 40,
  },
  txt: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    marginLeft: 12,
    top: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "black",
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
  },
});
