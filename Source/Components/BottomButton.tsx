import { Dimensions, Image, Platform, Pressable, StatusBar, Text, View } from "react-native"
import Images from "../Keys/Images";
import { hp, wp } from "../Keys/dimension";
import { useNavigation } from "@react-navigation/native";


const {width, height} = Dimensions.get('window')
const BottomButton = ({title = "Header", clickable, btnStyle , txtStyle } : any) =>{
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    return(
        <Pressable onPress={clickable} style={[{width:width *0.9, padding:12, borderRadius:5, alignSelf:'center', alignItems:'center', backgroundColor:'grey', flexDirection:'row'}, btnStyle]}>
            <View style={{flex:10, justifyContent:'center', alignItems:'center'}}>
                <Text style={[{color:'black', fontSize:16}, txtStyle]}>{title}</Text>
            </View>
        </Pressable>
    )
}

export default BottomButton