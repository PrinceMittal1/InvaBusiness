import { Dimensions, Image, Platform, Pressable, StatusBar, Text, View } from "react-native"
import Images from "../Keys/Images";
import { hp, wp } from "../Keys/dimension";
import { useNavigation } from "@react-navigation/native";


const {width, height} = Dimensions.get('window')
const Header = ({title = "Header", headerStyle,  } : any) =>{
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const navigation = useNavigation();
    return(
        <View style={[{width:width *0.9, padding:12, borderRadius:5, alignSelf:'center', alignItems:'center', backgroundColor:'grey', flexDirection:'row'}, headerStyle,]}>
            <Pressable onPress={()=>{
                navigation.goBack();
            }} style={{flex:1}}>
                <Image source={Images.back} style={{width:wp(5), height:hp(3)}} resizeMode="contain"/>
            </Pressable>
            <View style={{flex:10, justifyContent:'center', alignItems:'center'}}>
                <Text style={{color:'black', fontSize:16}}>{title}</Text>
            </View>
            <View style={{flex:1}}>
            
            </View>
        </View>
    )
}

export default Header