import React, { useState } from "react"
import { Dimensions, Platform, Pressable, SafeAreaView, StatusBar, Text, View } from "react-native"
import Header from "../Components/Header"
import ImagePickerModal from "../Components/ImagePickerModal"
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import AddingProduct from "../Components/AddingProduct";

const { width, height } = Dimensions.get('window')
const Home = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [showPicker, setShowPicker] = useState(false)
    const [images1, setImages] = useState<any>([]);
    const [mediaData, setMediaData] = useState<any>(null);


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: 25 }}>
            <Header title={'Home'} />


            {showPicker ?
                <AddingProduct ClosingModal={()=>setShowPicker(false)}/>
                :
                <Pressable onPress={() => setShowPicker(true)} style={{ backgroundColor: 'red', width: width * 0.9, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 10 }}>
                    <Text>Add Post</Text>
                </Pressable>
            }

        </SafeAreaView>
    )
}
export default Home