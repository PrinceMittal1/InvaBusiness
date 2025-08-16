import React, { useState } from "react"
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, Image, Dimensions, TextInput, Pressable, Platform, StatusBar, ActivityIndicator, Alert } from "react-native"
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from "@react-native-firebase/auth";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import Images from "../Keys/Images";
import { hp, wp } from "../Keys/dimension";
import { useNavigation } from "@react-navigation/native";
import AppRoutes from "../Routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setUserId } from "../Redux/Reducers/userData";
import { setLoader } from "../Redux/Reducers/tempData";
import Colors from "../Keys/colors";
import AppFonts from "../Functions/Fonts";
import FastImage from "@d11/react-native-fast-image";
import { creatingUserApi } from "../Api";


const { width, height } = Dimensions.get('window')
const Login = () => {
    const [numberForLogin, setNumberForLogin] = useState("");
    const navigation = useNavigation();
     const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const dispatch = useDispatch();
    const loading = useSelector((state: any) => state.tempData.loader);
     const { user_id } = useSelector((state: any) => state.userData);
     const [loader, setLoader] = useState(false)

    GoogleSignin.configure({
        webClientId:
            "505647175641-pt780qgtf1folf9e73nk9r17mrf5l1ib.apps.googleusercontent.com",
    });

   const signInWithPhoneNumber = async () => {
        setLoader(true)
        if (!numberForLogin.trim() || numberForLogin.length != 10) {
            Alert.alert("Add phone number of 10 digit")
            setLoader(false)
            return
        }
        try {
            const confirmation: any = await auth().signInWithPhoneNumber(`+91${numberForLogin}`);
            navigation.navigate(AppRoutes?.VerificationScreen, { confimration: confirmation, phoneNumber: numberForLogin  })
        } catch (error) {
            console.log('Phone Sign-In Error:', error);
        }
        setLoader(false)
    };

    async function onGoogleButtonPress() {
        setLoader(true)
        try {
            await GoogleSignin.signOut();
            await auth().signOut();
        } catch (error: any) { }

        try {
            const data: any = (await GoogleSignin.signIn()) || {};
            if (data?.data) {
                const googleCredential = auth?.GoogleAuthProvider.credential(data?.data?.idToken);
                const res = await auth().signInWithCredential(googleCredential);
                const additionalUserInfo: any = res.additionalUserInfo ?? {};
                if (additionalUserInfo?.profile?.email) {
                    let data = {
                        profile_picture : additionalUserInfo?.profile?.picture,
                        name : additionalUserInfo?.profile?.name,
                        email : additionalUserInfo?.profile?.email
                    }
                    const res : any = await creatingUserApi(data)
                    if(res?.status == 201){
                        dispatch(setUserId(res?.data?.user?._id));
                        navigation.replace(AppRoutes?.BottomBar);
                    }
                    if (res?.status == 200) {
                        dispatch(setUserId(res?.data?.user?._id));
                        navigation.replace(AppRoutes?.ScreenForUserDetail);
                    }
                }
            }
        } catch (error) { }
        finally {
            setLoader(false)
        }
    }



    return (
        <>
            {loader && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 999
                }}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
            <SafeAreaView style={[styles.safeArea, { marginTop: statusBarHeight }]}>
                <View style={styles.logoWrapper}>
                    <Image source={Images.logoForInva} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.welcomeWrapper}>
                    <Text style={styles.welcomeTitle}>Welcome to Inva</Text>
                    <Text style={styles.welcomeSubtitle}>Sign in to explore</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            value={numberForLogin}
                            placeholder="Phone Number"
                            placeholderTextColor={Colors?.DarkText}
                            maxLength={10}
                            style={styles.input}
                            onChangeText={setNumberForLogin}
                            onSubmitEditing={signInWithPhoneNumber}
                            keyboardType="numeric"
                        />
                    </View>

                    <Pressable onPress={signInWithPhoneNumber} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </Pressable>

                    <View style={styles.orCircle}>
                        <Text>OR</Text>
                    </View>
                </View>

                <View style={styles.socialCard}>
                    <Pressable onPress={onGoogleButtonPress} style={styles.googleButton}>
                        <FastImage source={Images?.googleLogo} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </>
    )
}

export default Login

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors?.PrimaryBackground,
    },
    logoWrapper: {
        alignSelf: 'center',
        marginTop: wp(5),
    },
    logo: {
        width: width / 2.5,
        height: width / 2.5,
    },
    welcomeWrapper: {
        alignSelf: 'center',
    },
    welcomeTitle: {
        color: Colors?.AccentPink,
        fontFamily: AppFonts.Bold,
        fontSize: 28,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        color: Colors?.AccentPink,
        fontFamily: AppFonts.Regular,
        fontSize: 20,
        textAlign: 'center',
    },
    card: {
        borderRadius: wp(5),
        backgroundColor: '#FFFFFF',
        width: wp(85),
        alignSelf: 'center',
        padding: wp(4),
        paddingVertical: wp(7),
        marginTop: hp(3),
        position: 'relative',
    },
    label: {
        fontFamily: AppFonts.Regular,
        fontSize: 16,
        lineHeight: 20,
        marginLeft: wp(1),
        color: Colors?.DarkText,
    },
    inputWrapper: {
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors?.buttonPrimaryColor,
        marginTop: hp(1),
    },
    input: {
        borderRadius: 15,
        height: 45,
        fontSize: 16,
        paddingLeft: 10,
        color: Colors?.DarkText,
    },
    submitButton: {
        borderWidth: 1,
        borderColor: Colors?.buttonPrimaryColor,
        marginTop: hp(2),
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        padding: 10,
        backgroundColor: Colors?.buttonPrimaryColor,
    },
    submitButtonText: {
        color: 'white',
        fontFamily: AppFonts.SemiBold,
        fontSize: 16,
    },
    orCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -20,
    },
    socialCard: {
        borderRadius: wp(5),
        backgroundColor: '#FFFFFF',
        marginTop: hp(4),
        width: wp(85),
        alignSelf: 'center',
        padding: wp(4),
    },
    googleButton: {
        borderWidth: 1,
        borderColor: Colors?.buttonPrimaryColor,
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
    },
    googleIcon: {
        width: 22,
        height: 22,
        marginRight: 20,
    },
    googleButtonText: {
        color: Colors?.DarkText,
        fontFamily: AppFonts.Regular,
        fontSize: 18,
    },
});