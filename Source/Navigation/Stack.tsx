import React from "react";
import keys from "../Routes/AppRoutes";
import Login from "../Screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "../Screens/SplashScreen";
import { View } from "react-native";
import ScreenForUserDetails from "../Screens/ScreenForSellerDetails";
import { useSelector } from "react-redux";
import Loader from "../Components/Loader";
import Home from "../Screens/Home";
import BottomTabs from "./BottomNavigation";
import Chat from "../Screens/Chat";
import VerificationScreen from "../Screens/Verification";

const MainStack = () => {
    const Stack = createNativeStackNavigator();
    const { loading } = useSelector((state: any) => state?.tempData)
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name={keys.Splash} component={Splash} />
                <Stack.Screen name={keys.Login} component={Login} />
                <Stack.Screen name={keys.ScreenForUserDetail} component={ScreenForUserDetails} />
                <Stack.Screen name={keys.BottomBar} component={BottomTabs} />
                <Stack.Screen name={keys.Chat} component={Chat} />
                <Stack.Screen name={keys.VerificationScreen} component={VerificationScreen} />
            </Stack.Navigator>
            {loading && <Loader />}</>
    )
}

export default MainStack