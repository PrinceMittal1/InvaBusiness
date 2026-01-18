import FastImage from '@d11/react-native-fast-image';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet, Dimensions, TouchableWithoutFeedback, Pressable, TextInput, FlatList, TouchableOpacity, Platform, Image } from 'react-native';
import Images from '../Keys/Images';
import { hp, wp } from '../Keys/dimension';
import Dropdown from '../Components/DropDown';
import { useDispatch, useSelector } from 'react-redux';
import BottomButton from '../Components/BottomButton';
import ImageCropPicker from 'react-native-image-crop-picker';
import { setLoader } from '../Redux/Reducers/tempData';
import useFireStoreUtil from '../Functions/FireStoreUtils';
import RNFS from 'react-native-fs';
import storage from '@react-native-firebase/storage';
import AppFonts from '../Functions/Fonts';
import Colors from '../Keys/colors';
import { editProductApi, gettingProductTags, gettingProductType } from '../Api';
import { setProductType } from '../Redux/Reducers/userData';
import compressImage from '../Functions/compressing';


const { width: screen_Width, height: screen_Height } = Dimensions.get('window')

const EditingProductModal = ({ data, onClosePress, callApiAgain }: any) => {
    const [title, setTitle] = useState(data?.title);
    const [description, setDescription] = useState(data?.description);
    const [oldData, setOldData] = useState({ ...data })
    const [showViewer, setShowViewer] = useState<boolean>(false);
    const [mediaData, setMediaData] = useState<any>(null);
    const [images1, setImages] = useState<any>(data?.images);
    const [price, setPrice] = useState(String(data?.price) ?? '');
    const [allProductType, setAllProductType] = useState([]);
    const [selectedTags, setSelectedTags] = useState(data?.tags ?? [])
    const [allTags, setAllTags] = useState([])
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(false)
    const { user_id, userData, productType: productTypes } = useSelector((state: any) => state.userData);
    const [productTypeTemp, setProductTypeTemp] = useState(data?.productType)
    const [stateForUploadingModal, setStateForUploadingModal] = useState({
        percentage: '0',
        number: 1,
        total: 1,
        state: false
    })

    const gettingDataProudctType = async () => {
        try {
            const res = await gettingProductType();
            if (res?.status == 200) {
                dispatch(setProductType(res?.data?.product_types))
            } else {
                dispatch(setProductType([]))
            }
        } catch (error) {
            dispatch(setProductType([]))
        }
    }

    useEffect(()=>{
        setProductTypeTemp(data?.productType)
        gettingDataProudctTags(data?.productType)
    },[])

    const gettingDataProudctTags = async (type: string) => {
        try {
            const res = await gettingProductTags({
                product_type: type
            });
            if (res?.status == 200) {
                setAllTags(res?.data?.tags)
            } else {
            }
        } catch (error) {
        }
    }


    useEffect(() => {
        gettingDataProudctType();
    }, [])

    useEffect(() => {
        if (productTypes && productTypes?.length > 0) {
            setAllProductType(productTypes)
        }
    }, [productTypes])

    const removeItem = (itemToRemove: string) => {
        setSelectedTags(prevItems => prevItems.filter(item => item !== itemToRemove));
    };

    const removeImage = (index: any) => {
        const updatedImages = images1?.filter((_: any, i: any) => i !== index);
        setImages(updatedImages);
    };

    const RenderItemForSelectedProduct = ({ item }: { item: any }) => {
        return (
            <View style={styles.tagItem}>
                <Text style={styles.tagText}>{item}</Text>
                <Pressable onPress={() => { removeItem(item); }} style={styles.tagRemoveButton}>
                    <Image
                        source={Images?.Cancel}
                        style={styles.tagRemoveIcon}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        );
    };

    const renderItem = ({ item, index }: any) => {
        const isFirebaseImage = !item?.path && item?.startsWith("https://firebasestorage.googleapis.com/v0/b/");
        return (
            <Pressable
                onPress={() => {
                    setMediaData(item);
                    setTimeout(() => {
                        setShowViewer(true);
                    }, 200);
                }}
                style={[
                    styles.uploadView,
                    {
                        borderColor: "transparent",
                        marginRight: 20,
                    },
                ]}
            >
                <FastImage source={{ uri: isFirebaseImage ? item : item?.path }} style={styles.image}>
                    <TouchableOpacity
                        onPress={() => removeImage(index)}
                        style={styles.removeBlock}
                    >
                        <FastImage
                            source={Images?.delete}
                            style={styles.play}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </FastImage>
            </Pressable>
        );
    };

    const openGallery = () => {
        if (images1.length >= 3) {
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
            }).then(async (images: Image[] | Image) => {
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
                const percent = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
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

    const changingPrice = (t: string) => {
        const clean = t.replace(/^\₹/, "");

        if (clean.length > 0) {
            setPrice(`₹${clean}`);
        } else {
            setPrice("");
        }
    };

    const sendingTobackend = async () => {
        if (oldData?.price == price && oldData?.title == title && oldData?.description == description && oldData?.productType == productTypeTemp && oldData?.tags == selectedTags && oldData?.images == images1) {
            onClosePress();
            return true
        }
        try {
            let urlOfImages: string[] = [];
            for (const [index, image] of images1.entries()) {
                const isFirebaseImage = !image?.path && image?.startsWith("https://firebasestorage.googleapis.com/v0/b/");
                if (!isFirebaseImage) {
                    let imgPath = await compressImage(image?.path) 
                    const uploadedUrl = await uploadMediaToFirebase(imgPath, index + 1, images1.length);
                    if (uploadedUrl) {
                        urlOfImages.push(uploadedUrl);
                    }
                } else {
                    urlOfImages.push(image);
                }
            }
            let payload: any = {}
            if (oldData?.images != images1) {
                payload.images = urlOfImages;
            }
            if (oldData.title != title) {
                payload.title = title;
            }
            if (oldData?.tags != selectedTags) {
                payload.tags = selectedTags;
            }
            if (oldData.productType != productTypeTemp) {
                payload.productType = productTypeTemp;
            }
            if (oldData.price != price) {
                payload.price = Number(price.replace(/[^0-9.]/g, ""));
            }
            const res = await editProductApi(data?._id, payload);
            if (res.status == 200) {
                callApiAgain(res?.data?.product);
            }
        } catch (error) {
            console.error("⚠️ Catch Error:", error);
        } finally {
            setLoader(false)
            onClosePress();
        }
    };


    return (
        <Modal
            transparent
            animationType="fade"
            visible={true}
        >
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
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Pressable
                        style={{ alignSelf: 'flex-end', padding: 10, marginRight: 5 }}
                        onPress={onClosePress}
                    >
                        <FastImage
                            source={Images?.Cancel}
                            style={{
                                height: hp(4),
                                width: wp(4),
                            }}
                            resizeMode="contain"
                        />
                    </Pressable>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Title</Text>
                        <View style={[styles.dropdown]}>
                            <TextInput
                                blurOnSubmit={false}
                                maxFontSizeMultiplier={1.5}
                                placeholder={'Title'}
                                multiline
                                value={title}
                                style={styles.inputText}
                                onChangeText={(t: string) => setTitle(t)}
                                placeholderTextColor={Colors?.DarkText}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapperMargin}>
                        <Text style={styles.inputLabel}>Description</Text>
                        <View style={styles.dropdown}>
                            <TextInput
                                blurOnSubmit={false}
                                maxFontSizeMultiplier={1.5}
                                placeholder={'Description'}
                                multiline
                                value={description}
                                style={styles.inputText}
                                onChangeText={setDescription}
                                placeholderTextColor={Colors?.DarkText}
                            />
                        </View>
                    </View>

                    <View style={{ alignSelf: 'center', marginTop: hp(1), width: '100%' }}>
                        <Text style={styles.inputLabel}>Products Type</Text>

                        <Dropdown
                            options={allProductType}
                            selectedValue={productTypeTemp}
                            alreadySelectedOptions={[productTypeTemp]}
                            removeItem={(item) => {
                                if (item == productTypeTemp) {
                                    setProductTypeTemp('')
                                }
                            }}
                            onValueChange={(item: any) => {
                                setSelectedTags([])
                                setProductTypeTemp(item)
                                gettingDataProudctTags(item);
                            }}
                        />
                    </View>

                    <View style={{ alignSelf: 'center', marginTop: hp(1), width: '100%' }}>
                        <Text style={styles.inputLabel}>Price</Text>
                        <View style={styles.dropdown}>
                            <TextInput
                                blurOnSubmit={false}
                                placeholder={'Price'}
                                value={price}
                                style={[styles.inputPrice]}
                                keyboardType="numeric"
                                onChangeText={changingPrice}
                                placeholderTextColor={Colors?.DarkText}
                            />
                        </View>
                    </View>

                    <View style={{ alignSelf: 'center', marginTop: hp(1), width: '100%' }}>
                        <Text style={styles.inputLabel}>Products Tags</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {selectedTags?.map((item, index) => (
                                <RenderItemForSelectedProduct key={index} item={item} />
                            ))}
                        </View>
                        <Dropdown
                            options={allTags}
                            selectedValue={''}
                            alreadySelectedOptions={selectedTags}
                            onValueChange={(item) => {
                                let oldItems: any = [...selectedTags, item]
                                setSelectedTags(oldItems)
                            }}
                            removeItem={(item: any) => {
                                const newArr = selectedTags.filter((items: any) => items !== item);
                                setSelectedTags(newArr)
                            }}
                        />
                    </View>

                    <View style={{}}>
                        <FlatList
                            data={images1.length < 3 ? [...images1, "upload"] : images1}
                            numColumns={3}
                            keyExtractor={(item, index) => index?.toString()}
                            style={{ maxHeight: 120 }}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                return item == "upload" ? (
                                    <Pressable
                                        key={index}
                                        onPress={() => {
                                            openGallery();
                                        }}
                                        style={[
                                            styles.uploadView,
                                            {
                                                borderColor: 'grey',
                                            },
                                        ]}
                                    >
                                        <FastImage
                                            resizeMode={"contain"}
                                            source={Images?.upload}
                                            style={[
                                                styles.uploadImg,
                                                {
                                                    height: "40%",
                                                    width: "40%",
                                                    borderRadius: 0,
                                                    justifyContent: "flex-end",
                                                },
                                            ]}
                                        ></FastImage>
                                    </Pressable>
                                ) : (
                                    renderItem({ item, index })
                                );
                            }}
                        />
                    </View>



                    <BottomButton
                        title={'Save'}
                        clickable={() => {
                            setLoader(true)
                            sendingTobackend();
                        }}
                        txtStyle={{ fontSize: 20 }}
                        btnStyle={{ marginTop: 20, width: screen_Width * 0.85, backgroundColor: Colors?.buttonPrimaryColor }}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default EditingProductModal;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dropdown: {
        paddingHorizontal: 12,
        height: wp(12),
        borderWidth: 1,
        justifyContent: 'center',
        borderColor: Colors?.buttonPrimaryColor,
        borderRadius: 8,
    },
    tagItem: {
        padding: 10,
        paddingRight: 5,
        margin: 5,
        marginBottom: 0,
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0dedd',
        borderRadius: 10
    },
    tagText: {
        fontSize: 14,
        fontFamily: AppFonts.Regular
    },
    tagRemoveButton: {
        paddingHorizontal: 5
    },
    tagRemoveIcon: {
        width: 14,
        height: 14
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: screen_Width * 0.95,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    message: {
        marginTop: 15,
        fontSize: 16,
        color: '#333',
        textAlign: 'center'
    },
    uploadView: {
        height: 93,
        width: 93,
        borderWidth: 1.4,
        borderColor: 'grey',
        borderRadius: 10,
        borderStyle: "dashed",
        marginTop: hp(2),
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    inputWrapper: {
        width: '100%',
        alignSelf: 'center',
    },
    inputWrapperMargin: {
        width: '100%',
        alignSelf: 'center',
        marginTop: hp(1),
    },
    inputWrapperMarginSmall: {
        width: '100%',
        alignSelf: 'center',
        marginTop: hp(0),
    },
    inputText: {
        fontSize: 16,
    },
    inputPrice: {
        fontSize: 16,
        height: wp(12),
        alignItems: 'center'
    },
    inputLabel: {
        fontFamily: AppFonts.Regular,
        fontSize: 14,
        marginLeft: wp(1),
        color: Colors?.DarkText,
    },
    uploadImg: {
        height: "34%",
        width: "34%",
        resizeMode: "contain",

        overflow: "hidden",
    },
    uploadTxt: {
        color: 'black',
        fontSize: 12,
        textAlign: "center",
        marginTop: hp(1.5),
    },
    playBtn: {
        zIndex: 9999,
        position: "absolute",
        top: "40%",
        left: Platform.OS == "ios" ? "35%" : "30%",
    },
    play: { width: 25, height: 25 },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
        justifyContent: "flex-end",
    },
    reason: {
        padding: 12,
        borderRadius: 10,
        fontSize: 12,
        borderWidth: 1,
        borderColor: 'black',
        width: "100%",
        alignSelf: "center",
        color: 'black',
        marginTop: hp(1.2),
    },
    msgVew: {
        width: "95%",
        borderWidth: 1,
        borderColor: 'grey',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1.84,
        marginTop: hp(1.4),
        padding: 8,
        alignSelf: "center",
        borderRadius: 10,
    },
    picView: {
        minHeight: hp(7),
        width: "48%",
        backgroundColor: 'black',
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp(1.2),
        marginBottom: hp(2),
    },
    cameraIcon: {
        height: hp(3),
        width: hp(3),
        resizeMode: "contain",
    },
    picViewTxt: {
        color: 'white',
        fontSize: hp(1.3),
    },
    flexView: {
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
    },
    dropView: {
        marginTop: hp(3.5),
        alignSelf: "center",
        backgroundColor: 'black',
        width: "100%",
    },
    viewSty: {},
    subSty: {
        alignSelf: "center",
        backgroundColor: 'black',
        width: "100%",
    },
    playButtonContainer: {},
    playIcon: {
        width: 50,
        height: 50,
        tintColor: "red",
    },
    capturedImageStyle: {
        height: hp(30),
        width: "90%",
        alignSelf: "center",
        borderRadius: 5,
        overflow: "visible",
    },
    removeBlock: {
        width: 20,
        height: 20,
        opacity: 0.6,
        borderRadius: 10,
        position: "absolute",
        top: 2,
        right: 8,
    },
});
