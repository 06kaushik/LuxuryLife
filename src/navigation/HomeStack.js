import React from "react";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashBoardScreen from "../screens/DashBoard/DashBoardScreen";
import BottomTabNavigator from "./BottomStack";
import PreferencesScreen from "../components/PreferencesScreen";
import AccountSetting from "../screens/ProfileScreen/AccountSettingScreen";
import ManageAccount from "../screens/ProfileScreen/AccountSettingScreens/ManageAccountScreen";
import NotificationSettings from "../screens/ProfileScreen/AccountSettingScreens/NotificationSettingScreen";
import PhotoVideoPermission from "../screens/ProfileScreen/AccountSettingScreens/PhotoVideoPermission";
// import AdditionalSecurity from "../screens/ProfileScreen/AccountSettingScreens/AdditionalSecurityScreen";
import Verification from "../screens/ProfileScreen/AccountSettingScreens/VerificationScreen";
import VerifyIdentity from "../screens/ProfileScreen/AccountSettingScreens/VerifyIdentityScreen";
import IdentitySuccess from "../screens/ProfileScreen/AccountSettingScreens/IdentitySuccessScreen";
import VerifySelfie from "../screens/ProfileScreen/AccountSettingScreens/VerifyPhotoScreen";
import HelpCenter from "../screens/ProfileScreen/AccountSettingScreens/HelpCenter";
import HiddenMembers from "../screens/ProfileScreen/AccountSettingScreens/HiddenMembersScreen";
import BlockedMembers from "../screens/ProfileScreen/AccountSettingScreens/BlockedMembers";
import UserProfileDetails from "../components/UserProfileDetails";
import PreferenceTopNavigator from "./PreferenceTopScreen";
import OneToOneChat from "../screens/ChatScreen/OneToOneChat";
import ViewProfile from "../screens/ProfileScreen/ViewProfileScreen";
import AboutScreen from "../screens/ProfileScreen/AccountSettingScreens/AboutScreen";
// import ViewRequestScreen from "../screens/ProfileScreen/ViewRequestsScreen";
import MembershipScreen from "../screens/ProfileScreen/AccountSettingScreens/MembershipandBilling";
import BillingHistory from "../screens/ProfileScreen/AccountSettingScreens/BillingHistory";
import PaypalGateway from "../components/PaypalGateway";
import MySubscription from "../components/MySubsscriptionScreen";
import RazorPayGateway from "../components/RazorpayGateway";
import SearchingScreen from "../components/SearchingScreen";
import VideoCallScreen from "../components/VideoCallScreen";
import IncomingVideoCallScreen from "../components/IncomingVideoCallScreen";
import AudioCallScreen from "../components/AudioCallScreen";
import IncomingAudioCallScreen from "../components/IncomingAudioCallScreen";
import RazorPayGatewayChat from "../components/RazorPayFromChat";
import OneToOneChatFromNav from "../screens/ChatScreen/ChatfromOtherRoute";
import InstagramLogin from "../components/instaLoginConfig";
import InstagramBioVerify from "../components/instaLoginConfig";
import LinkedInLoginInline from "../components/LinkdinLogin";
import ChatScreen from "../screens/ChatScreen/ChatScreen";

const Stack = createNativeStackNavigator();

const HomeStack = () => {
    const navigation = useNavigation()

    return (

        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen name="Home" component={BottomTabNavigator} />
            <Stack.Screen name="Preference" component={PreferencesScreen} />
            <Stack.Screen name="AccountSetting" component={AccountSetting} />
            <Stack.Screen name="ManageAccount" component={ManageAccount} />
            <Stack.Screen name="NotificationSetting" component={NotificationSettings} />
            <Stack.Screen name="PhotoVideoPermission" component={PhotoVideoPermission} />
            {/* <Stack.Screen name="AdditionalSecurity" component={AdditionalSecurity} /> */}
            <Stack.Screen name="Verification" component={Verification} />
            <Stack.Screen name="VerifyIdentity" component={VerifyIdentity} />
            <Stack.Screen name="IdentitySuccess" component={IdentitySuccess} />
            <Stack.Screen name="VerifySelfie" component={VerifySelfie} />
            <Stack.Screen name="HelpCenter" component={HelpCenter} />
            <Stack.Screen name="HiddenMembers" component={HiddenMembers} />
            <Stack.Screen name="BlockedMembers" component={BlockedMembers} />
            <Stack.Screen name="UserProfileDetails" component={UserProfileDetails} />
            <Stack.Screen name="PreferenceTopScreen" component={PreferenceTopNavigator} />
            <Stack.Screen name="OneToOneChat" component={OneToOneChat} />
            <Stack.Screen name="ViewProfile" component={ViewProfile} />
            <Stack.Screen name="About" component={AboutScreen} />
            {/* <Stack.Screen name="ViewRequest" component={ViewRequestScreen} /> */}
            <Stack.Screen name="Membership" component={MembershipScreen} />
            <Stack.Screen name="BillingHistory" component={BillingHistory} />
            <Stack.Screen name="Paypal" component={PaypalGateway} />
            <Stack.Screen name="RazorPay" component={RazorPayGateway} />
            <Stack.Screen name="MySubscription" component={MySubscription} />
            <Stack.Screen name="Searching" component={SearchingScreen} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} />
            <Stack.Screen name="IncomingVideoCall" component={IncomingVideoCallScreen} />
            <Stack.Screen name="AudioCall" component={AudioCallScreen} />
            <Stack.Screen name="IncomingAudioCall" component={IncomingAudioCallScreen} />
            <Stack.Screen name="RazorChat" component={RazorPayGatewayChat} />
            <Stack.Screen name="OneToOneChatNav" component={OneToOneChatFromNav} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />

            {/* <Stack.Screen name="InstaLogin" component={InstagramBioVerify} />
            <Stack.Screen name="Linkdin" component={LinkedInLoginInline} /> */}




        </Stack.Navigator>
    )
}

export default HomeStack;