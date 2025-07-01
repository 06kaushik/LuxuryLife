import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, ScrollView } from "react-native";
import images from "../../../components/images";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from "../../../components/GlobalStyle";

const NotificationSettings = ({ navigation }) => {

  const [messagealert, setMessageAlert] = useState(true)
  const [profileviews, setProfileViews] = useState(true)
  const [favalert, setFavAlert] = useState(true)
  const [requestphotoalert, setRequestPhotoAlert] = useState(true)
  const [promotionalalert, setPromotionalAlert] = useState(true)

  const [messageemailalert, setMessageEmailAlert] = useState(true)
  const [emailprofileviews, setEmailProfileViews] = useState(true)
  const [emailfavalerts, setEmailFavAlerts] = useState(true)
  const [emailrequestphoto, setEmailRequestPhoto] = useState(true)
  const [emailpromotion, setEmailPromotion] = useState(true)
  const [profileinfo, setProfileinfo] = useState(true)
  const [verificationandrequest, setVerificationandRequest] = useState(true)
  const [newsandupdate, setNewsandUpdates] = useState(true)
  const [promotionandoffer, setPromotionandOffers] = useState(true)
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



  ///// API INTERATION //////

  useEffect(() => {
    loadSettingsFromStorage();
  }, []);

  useEffect(() => {
    handleNotification();
  }, [
    messagealert,
    profileviews,
    favalert,
    requestphotoalert,
    promotionalalert,
    messageemailalert,
    emailprofileviews,
    emailfavalerts,
    emailrequestphoto,
    emailpromotion,
    profileinfo,
    verificationandrequest,
    newsandupdate,
    promotionandoffer,
    userdetails
  ]);


  const handleNotification = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const headers = {
      Authorization: token,
    };
    let body = {
      notificationSetting: {
        appAlertMessage: {
          onceSendMeMessage: messagealert,
          onceProfileViews: profileviews,
          onceAddMeFavorite: favalert,
          oncePrivatePhotoRequest: requestphotoalert,
          oncePromotionalEmails: promotionalalert
        },
        emailAlert: {
          onceSendMeMessage: messageemailalert,
          onceProfileViews: emailprofileviews,
          onceAddMeFavorite: emailfavalerts,
          oncePrivatePhotoRequest: emailrequestphoto,
          oncePromotionalEmails: emailpromotion,
          onceProfileApprove: profileinfo,
          onVerificationAndInformation: verificationandrequest,
          onNewsEvents: newsandupdate,
          onPromotionOtherOffer: promotionandoffer
        }
      }
    }
    console.log('body of handleNotification', body);

    try {
      const resp = await axios.put(`account/update-account-settings/${userdetails?._id}`, body, { headers })
      console.log('response from handle notification', resp.data.data);
      await AsyncStorage.setItem('notificationData', JSON.stringify(body));

    } catch (error) {
      console.log('error from handle notification', error.response.data.message);
    }
  }


  const loadSettingsFromStorage = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('notificationData');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);

        // App Alerts
        setMessageAlert(parsedSettings.notificationSetting.appAlertMessage.onceSendMeMessage);
        setProfileViews(parsedSettings.notificationSetting.appAlertMessage.onceProfileViews);
        setFavAlert(parsedSettings.notificationSetting.appAlertMessage.onceAddMeFavorite);
        setRequestPhotoAlert(parsedSettings.notificationSetting.appAlertMessage.oncePrivatePhotoRequest);
        setPromotionalAlert(parsedSettings.notificationSetting.appAlertMessage.oncePromotionalEmails);

        // Email Alerts
        setMessageEmailAlert(parsedSettings.notificationSetting.emailAlert.onceSendMeMessage);
        setEmailProfileViews(parsedSettings.notificationSetting.emailAlert.onceProfileViews);
        setEmailFavAlerts(parsedSettings.notificationSetting.emailAlert.onceAddMeFavorite);
        setEmailRequestPhoto(parsedSettings.notificationSetting.emailAlert.oncePrivatePhotoRequest);
        setEmailPromotion(parsedSettings.notificationSetting.emailAlert.oncePromotionalEmails);
        setProfileinfo(parsedSettings.notificationSetting.emailAlert.onceProfileApprove);
        setVerificationandRequest(parsedSettings.notificationSetting.emailAlert.onVerificationAndInformation);
        setNewsandUpdates(parsedSettings.notificationSetting.emailAlert.onNewsEvents);
        setPromotionandOffers(parsedSettings.notificationSetting.emailAlert.onPromotionOtherOffer);

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
      const parsedSettings = response.data.data;
      setMessageAlert(parsedSettings.notificationSetting.appAlertMessage.onceSendMeMessage);
      setProfileViews(parsedSettings.notificationSetting.appAlertMessage.onceProfileViews);
      setFavAlert(parsedSettings.notificationSetting.appAlertMessage.onceAddMeFavorite);
      setRequestPhotoAlert(parsedSettings.notificationSetting.appAlertMessage.oncePrivatePhotoRequest);
      setPromotionalAlert(parsedSettings.notificationSetting.appAlertMessage.oncePromotionalEmails);

      // Email Alerts
      setMessageEmailAlert(parsedSettings.notificationSetting.emailAlert.onceSendMeMessage);
      setEmailProfileViews(parsedSettings.notificationSetting.emailAlert.onceProfileViews);
      setEmailFavAlerts(parsedSettings.notificationSetting.emailAlert.onceAddMeFavorite);
      setEmailRequestPhoto(parsedSettings.notificationSetting.emailAlert.oncePrivatePhotoRequest);
      setEmailPromotion(parsedSettings.notificationSetting.emailAlert.oncePromotionalEmails);
      setProfileinfo(parsedSettings.notificationSetting.emailAlert.onceProfileApprove);
      setVerificationandRequest(parsedSettings.notificationSetting.emailAlert.onVerificationAndInformation);
      setNewsandUpdates(parsedSettings.notificationSetting.emailAlert.onNewsEvents);
      setPromotionandOffers(parsedSettings.notificationSetting.emailAlert.onPromotionOtherOffer);
      await AsyncStorage.setItem('notificationData', JSON.stringify(parsedSettings));

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
      <ScrollView style={{}}>
        <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20 }}>Display in-app alerts for:</Text>
        <View style={[styles.toggleContainer, { marginTop: 10 }]}>
          <Text style={styles.toggleText}>Incoming Messages</Text>
          <Switch
            value={messagealert}
            onValueChange={() => setMessageAlert((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Profile Views</Text>
          <Switch
            value={profileviews}
            onValueChange={() => setProfileViews((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Being Flagged as a Favorite</Text>
          <Switch
            value={favalert}
            onValueChange={() => setFavAlert((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Private Photo Requests</Text>
          <Switch
            value={requestphotoalert}
            onValueChange={() => setRequestPhotoAlert((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Promotional Emails</Text>
          <Switch
            value={promotionalalert}
            onValueChange={() => setPromotionalAlert((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>
        <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', marginTop: 20 }} />

        <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20 }}>Send email alerts for:</Text>
        <View style={[styles.toggleContainer, { marginTop: 10 }]}>
          <Text style={styles.toggleText}>Incoming Messages</Text>
          <Switch
            value={messageemailalert}
            onValueChange={() => setMessageEmailAlert((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Profile Views</Text>
          <Switch
            value={emailprofileviews}
            onValueChange={() => setEmailProfileViews((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Being Flagged as a Favorite</Text>
          <Switch
            value={emailfavalerts}
            onValueChange={() => setEmailFavAlerts((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Private Photo Requests</Text>
          <Switch
            value={emailrequestphoto}
            onValueChange={() => setEmailRequestPhoto((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Promotional Emails</Text>
          <Switch
            value={emailpromotion}
            onValueChange={() => setEmailPromotion((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>
        <View style={{ borderWidth: 0.5, borderColor: '#DDDDDD', marginTop: 20 }} />
        <Text style={{ fontSize: 23, fontFamily: GARAMOND.bold, marginLeft: 16, marginTop: 20 }}>Also send me emails about:</Text>
        <View style={[styles.toggleContainer, { marginTop: 20 }]}>
          <Text style={styles.toggleText}>My Profile's Approval Status</Text>
          <Switch
            value={profileinfo}
            onValueChange={() => setProfileinfo((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Verification Requests</Text>
          <Switch
            value={verificationandrequest}
            onValueChange={() => setVerificationandRequest((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>News and Updates</Text>
          <Switch
            value={newsandupdate}
            onValueChange={() => setNewsandUpdates((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
        </View>

        <View style={[styles.toggleContainer, { marginBottom: 40 }]}>
          <Text style={styles.toggleText}>Promotions and Other Offers</Text>
          <Switch
            value={promotionandoffer}
            onValueChange={() => setPromotionandOffers((prev) => !prev)}
            trackColor={{ false: "#C4C4C4", true: "#916008" }}
            thumbColor={"#FFF"}
          />
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
    fontSize: 23,
    fontFamily: POPPINSRFONTS.medium,
    marginLeft: 12,
    top: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: POPPINSRFONTS.semibold,
    color: "black",
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginTop: 20
  },
  toggleText: {
    fontSize: 16,
    fontFamily: POPPINSRFONTS.regular,
    color: "black",
    marginLeft: 16,
  },
});
