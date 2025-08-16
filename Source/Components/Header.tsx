import { Dimensions, Image, Platform, Pressable, StatusBar, Text, View } from "react-native"
import Images from "../Keys/Images";
import { hp, wp } from "../Keys/dimension";
import { useNavigation } from "@react-navigation/native";
import Colors from "../Keys/colors";
import AppFonts from "../Functions/Fonts";


const { width, height } = Dimensions.get('window')
const Header = ({ title = "Header", headerStyle, leftClick, rightClick, rightIcon, showbackIcon = true }: any) => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const navigation = useNavigation();
    return (
        <View style={[{ width: wp(95), paddingVertical: 12, borderRadius: 5, alignSelf: 'center', alignItems: 'center', backgroundColor: Colors?.buttonPrimaryColor, flexDirection: 'row' }, headerStyle,]}>
            <View style={{ width:wp(10), alignItems:'center', justifyContent:'center' }}>
                {showbackIcon && <Pressable onPress={() => {
                    if (leftClick) {
                        leftClick();
                    } else {
                        navigation.goBack();
                    }
                }}>
                    <Image source={Images.back} style={{ width: wp(5), height: hp(3) }} resizeMode="contain" />
                </Pressable>}
            </View>
            <View style={{ width:wp(75), justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#000000', fontSize: 16, fontFamily:AppFonts.Medium }}>{title}</Text>
            </View>
            <View style={{ width:wp(10) }}>
                {rightIcon && <Pressable onPress={() => {
                    if (rightClick) {
                        rightClick();
                    }
                }}>
                    <Image source={rightIcon} style={{ width: wp(5), height: hp(3) }} resizeMode="contain" />
                </Pressable>}
            </View>
        </View>
    )
}

export default Header