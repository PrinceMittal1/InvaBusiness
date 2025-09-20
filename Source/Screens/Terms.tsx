import React, { useEffect, useState } from "react"
import { Platform, StatusBar, StyleSheet, View } from "react-native"
import Header from "../Components/Header"
import RenderHtml from 'react-native-render-html';
import { wp } from "../Keys/dimension";
import Colors from "../Keys/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { gettingTerms } from "../Api";

const Terms = () => {
    const [content, SetContent] = useState<any>(``)
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
   
    const fetchingContent = async () => {
        const res = await gettingTerms()
            console.log("conetnt is 0---- ", res)
        if (res?.data) {
            SetContent(
                {
                    html: `${res?.data}`
                }
            )
        }
    }

    useEffect(() => {
        fetchingContent();
    }, [])


    return (
        <SafeAreaView style={[styles.safeArea, { marginTop: statusBarHeight }]}>
            <Header title={'Terms & Condition'} />

            <View style={{width:wp(95), marginTop:wp(4), alignSelf:'center', borderWidth:1, borderColor:Colors?.buttonPrimaryColor, borderRadius:wp(2), padding:wp(3)}}>
                <RenderHtml
                contentWidth={wp(95)}
                source={content}
            />
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors?.PrimaryBackground,
    },

})

export default Terms