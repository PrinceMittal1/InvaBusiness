import React, { useState } from "react"
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, Image, Dimensions, TextInput, Pressable, Platform, StatusBar } from "react-native"
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from "@react-native-firebase/auth";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import Images from "../Keys/Images";
import { hp } from "../Keys/dimension";
import { useNavigation } from "@react-navigation/native";
import keys from "../Routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setUserId } from "../Redux/Reducers/userData";
import { setLoader } from "../Redux/Reducers/tempData";


const { width, height } = Dimensions.get('window')
const Login = () => {
    const [numberForLogin, setNumberForLogin] = useState("");
    const navigation = useNavigation();
     const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const dispatch = useDispatch();
    const loading = useSelector((state: any) => state.tempData.loader);
     const { user_id } = useSelector((state: any) => state.userData);

    GoogleSignin.configure({
        webClientId:
            "505647175641-pt780qgtf1folf9e73nk9r17mrf5l1ib.apps.googleusercontent.com",
    });

    async function onGoogleButtonPress() {
        dispatch(setLoader(true))
        try {
            await GoogleSignin.signOut();
            await auth().signOut();
        } catch (error: any) {
        }
        try {
            const data: any = (await GoogleSignin.signIn()) || {};
            if (data?.data) {
                const googleCredential = auth?.GoogleAuthProvider.credential(
                    data?.data?.idToken
                );
                const res = await auth().signInWithCredential(googleCredential);
                const additionalUserInfo: any = res.additionalUserInfo ?? {};
                if (additionalUserInfo?.profile?.email) {
                    console.log("fireUtils.creatingCustomerUser", additionalUserInfo);
                    const fireUtils = useFireStoreUtil();
                    const user_id = await fireUtils.creatingCustomerUser(additionalUserInfo?.profile?.picture, additionalUserInfo?.profile?.name, additionalUserInfo?.profile?.email)
                    if(user_id){
                        dispatch(setUserId(user_id))
                        navigation.navigate(keys?.ScreenForUserDetail)
                    }
                } else {
                }
            }
        } catch (error) {
            console.log("response of google sging in is error ----- ", error)
        } finally {
            dispatch(setLoader(false))
        }
    }



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
            <View style={{ alignSelf: 'center', marginTop: 50 }}>
                <Image source={Images.logoForInva} style={{ width: width / 2, height: width / 2 }} />
            </View>


            <View style={{ height: 2, marginTop: hp(8), }}>
                <View style={{ width: width * 0.9, height: 2, alignSelf: 'center', backgroundColor: 'grey', borderWidth: 1, borderColor: 'grey' }} />
                <View style={{ backgroundColor: 'white', position: 'absolute', alignSelf: 'center', marginTop: -10, paddingHorizontal: 10 }}><Text>Sign In with Phone Number</Text></View>
            </View>


            <View style={{ alignSelf: 'center', width: width * 0.9,marginTop:hp(3) }}>
                <Text>Phone Number</Text>
                <View style={{borderRadius:15 }}>
                    <TextInput
                        value={numberForLogin}
                        placeholder="Phone Number"
                        style={{ backgroundColor: 'grey',marginTop:5, borderRadius:15, paddingLeft:10, color:'black' }}
                        onChangeText={(t) => setNumberForLogin(t)}
                        keyboardType="numeric"
                    />
                </View>
            </View>


            <View style={{ height: 2, marginTop: hp(4), }}>
                <View style={{ width: width * 0.9, height: 2, alignSelf: 'center', backgroundColor: 'grey', borderWidth: 1, borderColor: 'grey' }} />
                <View style={{ backgroundColor: 'white', position: 'absolute', alignSelf: 'center', marginTop: -10, paddingHorizontal: 10 }}><Text>Sign In with Google</Text></View>
            </View>

            <Pressable onPress={onGoogleButtonPress} style={{borderWidth:1, borderColor:'green', marginTop:hp(2), width:width*0.9, alignSelf:'center', justifyContent:'center', alignItems:'center', borderRadius:15, padding:10, backgroundColor:'green'}}>
                <Text>Google</Text>
            </Pressable>
        </SafeAreaView>
    )
}

export default Login
const styles = StyleSheet.create({
})