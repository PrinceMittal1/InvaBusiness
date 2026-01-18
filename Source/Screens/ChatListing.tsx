import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TouchableWithoutFeedback, View } from "react-native"
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
    const [loader, setLoader] = useState(false)
    const fireUtils = useFireStoreUtil();
    const { user_id } = useSelector((state: any) => state.userData);
    const focus = useIsFocused();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();


    const gettingAllChats = async () => {
        setLoader(true)
        const result = await fireUtils?.gettingAllChats(user_id);
        if (result) {
            setAllChats(result)
            setLoader(false)
        } else {
            setLoader(false)
        }
    }

    useEffect(() => {
        if (focus) gettingAllChats();
    }, [focus])

    const RenderItem = ({ item, index }: any) => {
        const imageForProfile = item?.customer_profile?.length > 0 ? { uri: `${item?.customer_profile}` } :
            item?.customer_picture?.length > 0 ? { uri: `${item?.customer_picture}` } : Images?.person

        return (
            <Pressable onPress={() => {
                navigation.navigate(AppRoutes?.Chat, {
                    user_id: item?.sellerId,
                    customerId: item?.customerId,
                    customerDisplayName: item?.customer_name
                })
            }} style={{ backgroundColor: "rgba(128, 128, 128, 0.5)", flexDirection: 'row', alignItems: 'center', padding: 5, marginTop: 10, borderRadius: 5, }}>
                <View style={{ width: wp(12.5), height: wp(12.5) , borderWidth:1, justifyContent:'center', alignItems:'center', borderRadius:wp(7)}}>
                    <FastImage source={imageForProfile} style={{ width: wp(12), height: wp(12), borderRadius: 25 }} resizeMode="contain" />
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
                                ListEmptyComponent={() => {
                                    return (
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            <FastImage source={Images?.emptyMessage} style={{ width: wp(100), height: wp(100) }} resizeMode="contain" />
                                        </View>
                                    )
                                }}
                            />
                        </>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    )
}

export default ChatListing