import { ActivityIndicator, View } from "react-native"

const Loader = () =>{
    return(
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <ActivityIndicator color={'red'}/>
        </View>
    )
}

export default Loader