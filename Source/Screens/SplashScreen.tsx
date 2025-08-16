import React, { useEffect } from "react"
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text } from "react-native"
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import keys from "../Routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setLoader } from "../Redux/Reducers/tempData";
import { setUserId } from "../Redux/Reducers/userData";

const Splash = () => {
    const navigation = useNavigation();
    const { user_id } = useSelector((state: any) => state.userData)

    useEffect(() => {
        if (user_id) {
            navigation.navigate(keys.BottomBar)
        } else {
            navigation.navigate(keys?.Login)
        }
    }, [user_id])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

        </View>
    )
}

export default Splash
const styles = StyleSheet.create({
})