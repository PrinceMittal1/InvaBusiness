import { useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, Text, TextInput, TouchableWithoutFeedback, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import Images from "../Keys/Images";
import Header from "../Components/Header";
import AppRoutes from "../Routes/AppRoutes";
import { hp, wp } from "../Keys/dimension";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import ImageCropPicker from "react-native-image-crop-picker";
import RNFS from 'react-native-fs';
import storage from '@react-native-firebase/storage';
import FastImage from "@d11/react-native-fast-image";
import compressImage from "../Functions/compressing";


const PAGE_SIZE = 15;
const Chat = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const route: any = useRoute();
    const dispatch = useDispatch();
    const fireUtils = useFireStoreUtil();
    const [stateForUploadingModal, setStateForUploadingModal] = useState({
        percentage: '0',
        number: 1,
        total: 1,
        state: false
    })
    const sendingLock = useRef(false);
    const [chatRoomRef, setChatRoomRef] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loader, setLoader] = useState(false);
    const { user_id } = useSelector((state: any) => state.userData);
    const [lastDoc, setLastDoc] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const firstPageLoaded = useRef(false);
    const [textMessage, setTextMessage] = useState('')
    const navigation = useNavigation();
    const [images1, setImages] = useState<any>([]);
    const insets = useSafeAreaInsets();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    const initalisingChat = async () => {
        const result = await fireUtils?.createOrGetChatRoom(route?.params?.user_id, route?.params?.customerId);
        setChatRoomRef(result);
    }

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardOpen(true);
        });

        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardOpen(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        initalisingChat();
    }, [])

    useEffect(() => {
        if (!chatRoomRef) return;

        const unsubscribe = chatRoomRef
            .collection("messages")
            .orderBy("timestamp", "desc")
            .limit(PAGE_SIZE)
            .onSnapshot(snapshot => {
                const docs = snapshot.docs;
                const newMessages = docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(newMessages);
                setLastDoc(docs[docs.length - 1] || null);
                firstPageLoaded.current = true;
            });

        return () => unsubscribe();
    }, [chatRoomRef]);


    const loadMoreMessages = async () => {
        if (loadingMore || !lastDoc || !chatRoomRef || !firstPageLoaded.current) return;
        setLoadingMore(true);
        const nextPage = await chatRoomRef
            .collection("messages")
            .orderBy("timestamp", "desc")
            .startAfter(lastDoc)
            .limit(PAGE_SIZE)
            .get();

        const docs = nextPage.docs;
        const newMessages = docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setMessages(prev => [...prev, ...newMessages]);
        setLastDoc(docs[docs.length - 1] || null);
        setLoadingMore(false);
    };

    const uploadMediaToFirebase = async (data: any, currentNumber: any, totalNumber: any) => {
        try {
            const uri = data;
            if (!uri) throw new Error("No file URI");
            const fileName = `file_${Date.now()}.jpg`;
            const pathToFile = Platform.OS === 'ios' ? uri.replace('file://', '') : uri.replace('file://', '');
            const fileExists = await RNFS.exists(pathToFile);
            if (!fileExists) {
                return;
            }
            const uploadRef = storage().ref(`uploads/${fileName}`);
            const task = uploadRef.putFile(pathToFile);

            task.on('state_changed', taskSnapshot => {
                const percent = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100
                setStateForUploadingModal({
                    ...stateForUploadingModal,
                    percentage: String(percent),
                    number: currentNumber,
                    total: totalNumber,
                    state: true
                })
            });

            await task; // wait for completion
            const downloadURL = await uploadRef.getDownloadURL();
            return downloadURL;
        } catch (err: any) {
            console.error('❌ Upload failed:', err.code, err.message);
        }
    };

    const sendingMessageToBackend = async () => {
        if (sendingLock.current) return;
        sendingLock.current = true
        try {
            if (images1.length > 0) {
                setLoader(true)
                sendingImagesTobackend();
            } else {
                let textMessageDummy = textMessage;
                setTextMessage('')
                const res = await fireUtils?.sendMessageToRoom(chatRoomRef, route?.params?.user_id, textMessageDummy, [])
                if (res) {
                    setTextMessage('')
                    setImages([])
                }
            }
        } catch (error) {

        } finally {
            setLoader(false)
            sendingLock.current = false
        }
    }


    const sendingImagesTobackend = async () => {
        try {
            let urlOfImages: string[] = [];
            for (const [index, image] of images1.entries()) {
                let imgPath = await compressImage(image?.path)
                const uploadedUrl = await uploadMediaToFirebase(imgPath, index + 1, images1.length);
                if (uploadedUrl) {
                    urlOfImages.push(uploadedUrl);
                }
            }
            if (urlOfImages?.length > 0) {
                let textMessageDummy = textMessage;
                let urlOfImagesDummy = urlOfImages;
                setTextMessage('')
                setImages([])
                const res = await fireUtils?.sendMessageToRoom(chatRoomRef, route?.params?.user_id, textMessageDummy, urlOfImagesDummy)
                if (res) {
                    setTextMessage('')
                    setImages([])
                }
            }
        } catch (error) {
            console.error("⚠️ Catch Error:", error);
        } finally {
            setLoader(false)
        }
    };


    const openGallery = () => {
        if (images1.length >= 3) {
            console.log("Maximum image limit reached");
            return;
        }
        try {
            ImageCropPicker.openPicker({
                width: 400,
                height: 400,
                cropping: false,
                mediaType: 'photo',
                multiple: images1.length >= 2 ? false : true,
                maxFiles: 3 - images1.length,
            }).then(async (images) => {
                const selectedFiles = Array.isArray(images) ? images : [images];
                const finalFiles = selectedFiles.slice(0, 3 - images1.length);
                if (finalFiles.length) {
                    setImages([...images1, ...finalFiles]);
                }
            });
        } catch (error: any) {
            console.log("Error opening picker", error);
        }
    };

    const RenderItem = ({ item, index }: any) => {
        return (
            <View
                style={{
                    padding: 10,
                    maxWidth: wp(60),
                    backgroundColor: '#eee',
                    marginVertical: 5,
                    borderRadius: 4,
                    alignSelf: item?.senderId == user_id ? 'flex-end' : 'flex-start',
                }}
            >
                <FlatList data={item?.imagesUrl}
                    renderItem={(items: any) => {
                        return (
                            <FastImage source={{ uri: `${items?.item}` }} style={{ width: wp(55), height: wp(45), marginBottom: hp(1) }} resizeMode="cover" />
                        )
                    }} />
                <Text>{item.text}</Text>
            </View>
        )
    }

    const removingImage = (i: any) => {
        const updatedArr = images1.filter((_, index) => index !== i);
        setImages(updatedArr)
    }

    const RenderItemForUploadingImage = ({ item, index }: any) => {
        return (
            <View
                style={{
                    padding: 10,
                    backgroundColor: '#eee',
                    marginVertical: 5,
                    borderRadius: 4,
                    alignSelf: item?.senderId == user_id ? 'flex-end' : 'flex-start',
                }}
            >
                <Pressable onPress={() => { removingImage(index) }} style={{ position: 'absolute', right: 18, top: 18, zIndex: 10 }}>
                    <FastImage source={Images?.Cancel} style={{ width: wp(4), height: wp(4) }} resizeMode="contain" />
                </Pressable>
                <FastImage source={{ uri: `${item?.path}` }} style={{ width: wp(25), height: wp(25) }} resizeMode="cover" />
            </View>
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
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + hp(1) : isKeyboardOpen ? -hp(0) : -hp(4)}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <>
                            <Header title={route?.params?.customerDisplayName} showbackIcon={true} />

                            <FlatList
                                style={{ flex: 1 }}
                                data={messages}
                                contentContainerStyle={{ padding: 10, paddingBottom: hp(12) }}
                                keyExtractor={(item, index) => `${item.id}_${index}`}
                                renderItem={RenderItem}
                                inverted
                                onEndReached={loadMoreMessages}
                                onEndReachedThreshold={0.1}
                                ListFooterComponent={() =>
                                    loadingMore ? <ActivityIndicator size="small" color="#000" /> : null
                                }
                            />

                            <View
                                style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 8,
                                    width: wp(100),
                                    backgroundColor: '#f1f1f1',
                                    alignItems: 'center',
                                    borderTopWidth: 1,
                                    borderColor: '#ccc',
                                }}
                            >
                                <FlatList
                                    data={images1}
                                    horizontal
                                    style={{ alignSelf: 'flex-start' }}
                                    renderItem={RenderItemForUploadingImage}
                                />
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{
                                        flex: 1,
                                        paddingHorizontal: 12,
                                        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
                                        backgroundColor: 'white',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: '#ddd',
                                    }}>
                                        <TextInput
                                            value={textMessage}
                                            onChangeText={setTextMessage}
                                            placeholder="Type a message..."
                                            style={{
                                            }}
                                            onSubmitEditing={sendingMessageToBackend}
                                        />

                                        <Pressable onPress={openGallery}>
                                            <FastImage source={Images?.attach} style={{ width: wp(5), height: wp(5) }} resizeMode="contain" />
                                        </Pressable>
                                    </View>


                                    <Pressable
                                        onPress={sendingMessageToBackend}
                                        style={{
                                            marginLeft: 10,
                                            backgroundColor: '#00b894',
                                            paddingVertical: 10,
                                            paddingHorizontal: 16,
                                            borderRadius: 20,
                                        }}
                                    >
                                        <Text style={{ color: 'white' }}>Send</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    )
}

export default Chat