import React from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import DashBoardScreen from "../screens/DashBoard/DashBoardScreen";
import BottomTabNavigator from "./BottomStack";
import PreferencesScreen from "../components/PreferencesScreen";
import AccountSetting from "../screens/ProfileScreen/AccountSettingScreen";
import ManageAccount from "../screens/ProfileScreen/AccountSettingScreens/ManageAccountScreen";
import NotificationSettings from "../screens/ProfileScreen/AccountSettingScreens/NotificationSettingScreen";
import PhotoVideoPermission from "../screens/ProfileScreen/AccountSettingScreens/PhotoVideoPermission";
import SecurityInformation from "../screens/ProfileScreen/AccountSettingScreens/SecurityInformation";
import AdditionalSecurity from "../screens/ProfileScreen/AccountSettingScreens/AdditionalSecurityScreen";
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
import ViewRequestScreen from "../screens/ProfileScreen/ViewRequestsScreen";
import MembershipScreen from "../screens/ProfileScreen/AccountSettingScreens/MembershipandBilling";
import LaodingScreen from "../components/LoadingScreen";


const Stack = createStackNavigator();

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
            <Stack.Screen name="SecurityInformation" component={SecurityInformation} />
            <Stack.Screen name="AdditionalSecurity" component={AdditionalSecurity} />
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
            <Stack.Screen name="ViewRequest" component={ViewRequestScreen} />
            <Stack.Screen name="Membership" component={MembershipScreen} />














        </Stack.Navigator>
    )
}

export default HomeStack;