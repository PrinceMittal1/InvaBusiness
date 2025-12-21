import { useEffect, useState } from "react"
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TouchableWithoutFeedback, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useSelector } from "react-redux";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp } from "../Keys/dimension";
import FastImage from "@d11/react-native-fast-image";
import Header from "../Components/Header";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AppRoutes from "../Routes/AppRoutes";
import Images from "../Keys/Images";

const ChatListing = () => {
    const [allChat, setAllChats] = useState<any>([]);
    const fireUtils = useFireStoreUtil();
    const { user_id } = useSelector((state: any) => state.userData);
    const focus = useIsFocused();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();


    const gettingAllChats = async () => {
        const result = await fireUtils?.gettingAllChats(user_id);
        if (result) {
            setAllChats(result)
        }
    }

    console.log("bjbvjhbvj", allChat?.[0]?.customer_name)


    useEffect(() => {
        if (focus) gettingAllChats();


    }, [focus])

    const RenderItem = ({ item, index }: any) => {
        return (
            <Pressable onPress={() => {
                navigation.navigate(AppRoutes?.Chat, {
                    user_id: item?.sellerId,
                    customerId: item?.customerId,
                    customerDisplayName: item?.customer_name
                })
            }} style={{ backgroundColor: "rgba(128, 128, 128, 0.5)", flexDirection: 'row', alignItems: 'center', padding: 5, marginTop: 10, borderRadius: 5 }}>
                <View style={{ flex: 1 }}>
                    <FastImage source={{ uri: `${item?.customer_profile}` }} style={{ width: wp(12), height: wp(12), borderRadius: 25 }} resizeMode="contain" />
                </View>

                <View style={{ flex: 7, marginLeft: wp(5) }}>
                    <Text style={{ fontSize: 18 }}>{item?.customer_name}</Text>
                    <Text>{item?.lastMessage}</Text>
                </View>

                <View style={{ flex: 1 }}>
                    {
                        item?.unseenMessages &&
                        <Text>{item?.unseenMessages}</Text>
                    }
                </View>
            </Pressable>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + hp(1) : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <>
                        <Header title={'Chats'} showbackIcon={true} />

                        <FlatList
                            data={allChat}
                            style={{ width: wp(90), alignSelf: 'center' }}
                            renderItem={RenderItem}
                            ListEmptyComponent={()=>{
                                return(
                                    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                                        <FastImage source={Images?.emptyMessage} style={{width:wp(100), height:wp(100)}} resizeMode="contain"/>
                                    </View>
                                )
                            }}
                        />
                    </>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default ChatListing