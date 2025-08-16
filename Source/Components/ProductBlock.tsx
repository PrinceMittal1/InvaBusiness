import {
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useContext, useRef, useState } from "react";
import { useNavigation, useTheme } from "@react-navigation/native";
import FastImage from "@d11/react-native-fast-image";
import moment from "moment";
import "moment/locale/es"; // Spanish
import "moment/locale/it"; // Italian
import "moment/locale/fr"; // French
import "moment/locale/en-gb"; // English (UK)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { hp, wp } from "../Keys/dimension";
// import CarouselMediaModal from "../modals/CarouselMediaModal";
import keys from "../Routes/AppRoutes";
import Images from "../Keys/Images";


const screenWidth = Dimensions.get("window").width;
const ProductBlock = ({
    item,
    index,
    onDeleting,
    onCommentPress,
    onEditing,
    onSharePress,

}: any) => {
    const styles = useStyles();
    const [blockItem, setBlockItem] = useState(item);
    const navigation = useNavigation() as any;
    const { token } = useSelector((state: any) => state.userData);
    const [activeIndex2, setActiveIndex2] = useState(0);


    const formatCount = (num: number): string => {
        if (num < 1000) return num.toString();
        if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    };


    let formatingDate = (timestamp: any) => {
        const date = new Date(timestamp * 1000); // multiply by 1000 to convert seconds to milliseconds

        const options: any = { day: '2-digit', month: 'short', year: 'numeric' };
        return (date.toLocaleDateString('en-US', options))
    }


    return (
        <>
            <View style={styles.mainView}>

                <Pressable onPress={onEditing} style={{ alignSelf: 'flex-end', marginBottom: 10, flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'grey', borderRadius: 50, padding: 5, paddingHorizontal: 10 }}>
                        <Text style={{ fontSize: 20 }}>Edit</Text>
                        <Image source={Images?.EditForProductBlock} style={{ width: 20, height: 20, marginLeft: 5 }} resizeMode="contain" />
                    </View>

                    <Pressable onPress={()=>{
                        onDeleting()
                    }} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'grey', borderRadius: 50, padding: 5, paddingHorizontal: 10, marginLeft:5 }}>
                        <Text style={{ fontSize: 20 }}>Delete</Text>
                        <Image source={Images?.delete} style={{ width: 20, height: 20, marginLeft: 5 }} resizeMode="contain" />
                    </Pressable>
                </Pressable>

                <View style={{ height: wp(120), width: screenWidth * 0.90, borderRadius: 10, alignSelf: "center" }} >

                    <FlatList
                        onMomentumScrollEnd={(event) => {
                            const contentOffsetX = event.nativeEvent.contentOffset.x;
                            const currentIndex = Math.round(contentOffsetX / wp(85));
                            setActiveIndex2(currentIndex)
                        }}
                        data={blockItem?.images}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index?.toString()}
                        bounces={false}
                        style={{ height: wp(120), width: '100%' }}
                        horizontal
                        pagingEnabled
                        renderItem={({ item, index }: any) => {
                            return (
                                <Pressable style={{ width: screenWidth * 0.90, height: wp(120), borderRadius: 10, overflow: "hidden", backgroundColor: 'grey' }}>
                                    <FastImage
                                        style={styles.carImg}
                                        source={{ uri: item }}
                                        resizeMode="contain">
                                    </FastImage>
                                </Pressable>
                            );
                        }}

                    />

                    <View style={{ flexDirection: "row", justifyContent: "center", position: "absolute", right: 0, left: 0, bottom: 4 }}>
                        {Array.isArray(blockItem?.images) &&
                            blockItem?.images.map((_: any, index: any) => (
                                <View
                                    key={index}
                                    style={{
                                        width: index === activeIndex2 ? 20 : 10,
                                        height: 4,
                                        borderRadius: 3,
                                        marginHorizontal: 4,
                                        backgroundColor: index === activeIndex2 ? 'orange' : '#ccc',
                                    }}
                                />
                            ))}
                    </View>
                </View>


                <View style={{ width: '95%', }}>
                    <Text style={{ fontSize: 18 }}>{blockItem?.title}</Text>
                    <Text style={{ fontSize: 18, color: 'grey', fontWeight: 700 }}>{blockItem?.productType}</Text>
                    <Text style={{ fontSize: 14 }}>{formatingDate(blockItem?.createdAt)}</Text>
                </View>

                <View style={[styles.bottomView, {}]}>
                    <View style={styles.bottomSubview}>
                        <Pressable>
                            <Image
                                source={Images.viewIcon}
                                style={styles.bottomIcon}
                                resizeMode="contain"
                            />
                        </Pressable>
                        <View style={{ marginLeft: 4 }} >
                            <Text style={{ color: 'black', fontSize: 18 }}>{blockItem?.like_count > 0 ? formatCount(blockItem?.viewsCount) : 0}</Text>
                        </View>

                        <Pressable style={{ marginLeft: 6 }}>
                            <Image
                                source={Images.Heart}
                                style={styles.bottomIcon}
                                resizeMode="contain"
                            />
                        </Pressable>
                        <View style={{ marginLeft: 4 }} >
                            <Text style={{ color: 'black', fontSize: 18 }}>{blockItem?.like_count > 0 ? formatCount(blockItem?.like_count) : 0}</Text>
                        </View>


                        <Pressable onPress={onCommentPress} style={{ marginLeft: 6 }}>
                            <Image
                                source={Images.comment}
                                style={styles.bottomIcon}
                                resizeMode="contain"
                            />
                        </Pressable>
                        <View style={{ marginLeft: 4 }} >
                            <Text style={{ color: 'black', fontSize: 18 }}>{blockItem?.like_count > 0 ? formatCount(blockItem?.like_count) : 0}</Text>
                        </View>
                    </View>

                    <Pressable onPress={onSharePress}>
                        <Image
                            source={Images.share}
                            style={styles.bottomIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>
            </View>

        </>
    );
};

export default ProductBlock;

const useStyles = () =>
    StyleSheet.create({
        viewBlock: { flexDirection: "row", alignItems: "center", marginTop: 10 },
        viewtext: { fontSize: 10, marginLeft: 4 },
        viewIcon: { height: 12, width: 12 },
        time: {
            //   fontFamily: AppFonts.MediumItalic,
            fontSize: 11,
            marginTop: Platform.OS == "ios" ? 6 : 4,
        },
        comments: {
            //   fontFamily: AppFonts.Medium,
            fontSize: 12,
            marginTop: 0,
        },
        tags: {
            //   fontFamily: AppFonts.Medium,
            fontSize: 12,
            marginTop: -6,
        },
        desc: {
            fontSize: 12,
            lineHeight: 14,
            marginBottom: 2,
            marginTop: Platform.OS == "ios" ? 12 : 10,
        },
        carImg: {
            height: "100%",
            width: "100%",
            borderRadius: 10
        },
        shopView: {
            backgroundColor: "rgb(196,194,190)",
            minWidth: 90,
            minHeight: 30,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 10,
            position: "absolute",
            bottom: 16,
            right: 5,
            zIndex: 999,
        },
        shopNowText: {
            //   fontFamily: AppFonts?.Medium,
            fontSize: 12,
        },
        bottomSubview: {
            flexDirection: "row",
            alignItems: "center",
        },
        bottomIcon: { height: 20, width: 20 },
        bottomView: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: '100%',
            alignSelf: 'center',
            marginTop: 10,
        },
        btn: { height: 25, width: 80 },
        nestedView: { flexDirection: "row", alignItems: "center", flex: 4 },
        name: {
            fontSize: 15
        },
        date: {
            fontSize: 11,
            marginTop: Platform.OS == "ios" ? 6 : 2,
            width: "100%",
        },
        userIcon: { height: 50, width: 50, borderRadius: 100, flex: 1 },
        userIconForNullFolowed: {
            height: 180,
            width: 180,
            borderRadius: 100,
        },
        subView: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
        },
        mainView: {
            width: screenWidth * 0.95,
            alignSelf: "center",
            padding: 10,
            marginTop: 10,
            borderWidth: 1,
            borderColor: 'grey',
            marginBottom: 10,
            borderRadius: 10,
        },
        findView: {
            minHeight: 26,
            backgroundColor: "rgba(0,0,0,0.65)",
            // width: "90%",
            alignSelf: "flex-end",
            borderRadius: 5,
            position: "absolute",
            top: 10,
            paddingHorizontal: 8,
            justifyContent: "center",
            right: 10,
        },
        findText: {
            fontSize: 12,
            textAlign: "right",
            alignSelf: "flex-end",
            // marginTop: 5
        },

        sliderView: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
            position: "absolute",
            bottom: 28,
        },
        activeIndex: {
            height: hp(0.8),
            borderRadius: 1000,
            marginRight: 8,
        },
        adImg: {
            width: "100%",
            height: "100%",
            borderRadius: 100,
        },
    });
