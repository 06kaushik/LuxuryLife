import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen/Login";
import LoginWithEmail from "../screens/LoginScreen/LoginWithEmail";
import SignUp from "../screens/SignupScreen/SignUp";
import ForgotPassword from "../screens/ForgotPassword/ForgotPassword";
import VerifyEmail from "../screens/LoginScreen/VerifyYourEmail";
import CreatePassword from "../screens/LoginScreen/CreatePasswordScreen";
import ResetPassWithSecurityQstn from "../screens/LoginScreen/ResetPassWithSecurity";
import AnswerSecurityQstn from "../screens/LoginScreen/AnswerSecurityQstn";
import PasswordResttingGudance from "../screens/LoginScreen/ResettingGuidance";
import ProfileSignUp from "../screens/SignupScreen/SignUpProfile";



const Stack = createStackNavigator();


const AuthStack = () => {

    return (

        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="LoginWithEmail" component={LoginWithEmail} />
            <Stack.Screen name="ProfileSignUp" component={ProfileSignUp} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
            <Stack.Screen name="CreatePassword" component={CreatePassword} />
            <Stack.Screen name="ResetWithSecurity" component={ResetPassWithSecurityQstn} />
            <Stack.Screen name="AnswerSecurityQstn" component={AnswerSecurityQstn} />
            <Stack.Screen name="PasswordResettingGudance" component={PasswordResttingGudance} />







        </Stack.Navigator>
    )
}


export default AuthStack;