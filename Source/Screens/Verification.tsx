import { useNavigation, useRoute } from "@react-navigation/native"
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import Header from "../Components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../Keys/colors";
import { hp, wp } from "../Keys/dimension";
import { useState } from "react";
import AppFonts from "../Functions/Fonts";
import AppRoutes from "../Routes/AppRoutes";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useDispatch } from "react-redux";
import { setUserId } from "../Redux/Reducers/userData";
import { creatingUserApi } from "../Api";

const VerificationScreen = () => {
    const insets = useSafeAreaInsets();
    const route: any = useRoute();
    const [otpValue, SetOtpValue] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const confirm = route?.params?.confimration
    const phoneNumber = route?.params?.phoneNumber

    const confirmCode = async () => {
        if (!otpValue.trim() || otpValue.length != 6) {
            Alert.alert("Please enter 6 digit otp")
            return
        }
        try {
            await confirm.confirm(otpValue);
            let data = {
                phoneNumber: phoneNumber
            }
            const res : any = await creatingUserApi(data)
            console.log("res is ---------- ", res)
            if(res?.status == 201){
                dispatch(setUserId(res?.data?.user?._id));
                navigation.navigate(AppRoutes?.BottomBar);
            }
            if (res?.status == 200) {
                dispatch(setUserId(res?.data?.user?._id));
                navigation.navigate(AppRoutes?.ScreenForUserDetail);
            }
        } catch (error) {
            console.log('Invalid code.', error);
        }
    };


    return (
        <View style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: Colors?.PrimaryBackground,
        }}>
            <Header title={"Verification"}/>

            <View style={{ width: wp(90), alignSelf: 'center', alignItems: 'center', marginVertical: hp(2) }}>
                <Text style={{ textAlign: 'center', marginHorizontal: wp(5), fontFamily: AppFonts.Regular, fontSize: 15, lineHeight: 22 }}>Please verify your phone number by adding 6 digit OTP</Text>

                <View style={{ borderWidth: 1, borderColor: Colors?.buttonPrimaryColor, width: wp(90), borderRadius: 10, height: 45, marginTop: hp(2) }}>
                    <TextInput
                        value={otpValue}
                        maxLength={6}
                        keyboardType="numeric"
                        placeholder="Otp"
                        style={styles.input}
                        placeholderTextColor={Colors?.DarkText}
                        onChangeText={SetOtpValue}
                    />
                </View>
            </View>

            <View style={{ flex: 1 }} />

            <Pressable onPress={confirmCode} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </Pressable>


        </View>
    )
}

export default VerificationScreen


const styles = StyleSheet.create({
    submitButton: {
        borderWidth: 1,
        borderColor: Colors?.buttonPrimaryColor,
        marginVertical: hp(5),
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        padding: 10,
        backgroundColor: Colors?.buttonPrimaryColor,
    },
    submitButtonText: {
        color: '#000000',
        fontFamily: AppFonts.Medium,
        fontSize: 16,
    },
    input: {
        borderRadius: 15,
        height: 45,
        fontSize: 16,
        paddingLeft: 10,
        color: Colors?.DarkText,
    },

});