import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import FastImage from "@d11/react-native-fast-image";
import Images from "../../Keys/Images";

const { width, height } = Dimensions.get('window')
const ChatInput = ({ onPressAttachment, onPressSend, onWishlistClicked, allowedWithoutText, wishListAllowed, replyTo, imagesMedia, removingImage, setReplyTo }: any) => {
  const [imagesMedias, setImagesMedias] = useState(imagesMedia);
  const [wishlistSuggestions, setwishlistSuggestions] = useState([]);
  const [val, setVal] = useState("");
  const textInputRef = useRef<TextInput>(null);
  const styles = useStyles();

  useEffect(() => {
    setImagesMedias(imagesMedia);
  }, [imagesMedia]);

  const isVideo = (url: string) => {
    const videoExtensions = ["mp4", "mov", "avi", "mkv"];
    return (
      url &&
      videoExtensions.some((ext) => url?.toLowerCase()?.endsWith(`.${ext}`))
    );
  };

  // console.log("total number of medias are", imagesMedias)

  return (
    <KeyboardAvoidingView style={{}}>
      <View style={[styles.sendView]}>
        {
          replyTo &&
          <View style={styles?.replyToContainer}>
            <View style={{ paddingVertical: 2, flex: 9 }}>
              <View><Text style={[styles?.replyNametext]}>{replyTo?.name}</Text></View>
              <View><Text style={[styles?.replyMessageText]}>{replyTo?.message}</Text></View>
            </View>
            <Pressable style={{ flex: 0.5 }} onPress={() => { setReplyTo(null) }}>
              <FastImage source={Images.Cancel} style={styles?.crossImageStyle} resizeMode="contain" />
            </Pressable>
          </View>
        }
        {
          imagesMedias?.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles?.mediaContainer}
            >
              {imagesMedias?.map((item: any, index: number) => (
                <View key={index} style={{ marginRight: 10 }}>
                  {
                    isVideo(item?.path) ?
                      <>
                        <Video
                          removeClippedSubviews={false}
                          source={{ uri: item?.path }}
                          style={[
                            styles.uploadView,
                            {
                              borderColor: "transparent",
                              overflow: "hidden",
                            },
                          ]}
                          resizeMode="cover"
                          muted={false}
                          paused={true}
                          controls={false}
                        >
                        </Video>
                        <TouchableOpacity
                          onPress={() => { removingImage(index) }}
                          style={[styles.removeBlock, {}]}
                        >
                          <FastImage
                            source={Images?.delete}
                            style={[styles?.delIconStyle]}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </>
                      :
                      <>
                        <FastImage
                          source={{ uri: item?.path }}
                          style={styles?.mediaContainerImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => { removingImage(index) }}
                          style={[styles.removeBlock, {}]}
                        >
                          <FastImage
                            source={Images?.delete}
                            style={[styles?.delIconStyle]}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </>
                  }
                </View>
              ))}
            </ScrollView>
          )
        }
        {wishlistSuggestions.length > 0 &&
          <FlatList
            horizontal
            data={wishlistSuggestions}
            style={styles?.wishlistContainer}
            renderItem={({ item, index }: any) => {
              return (
                <View style={[styles?.wishlistContainerItemOuter]}>
                  <Pressable onPress={() => {
                    textInputRef.current?.focus()
                    setVal(item?.name)
                    textInputRef.current?.focus()
                  }} style={[styles?.wishlistContainerItempressable]}>
                    <Text style={[styles?.wishListText]}>{item?.name}</Text>
                  </Pressable>
                </View>
              )
            }} />
        }
        <View style={[styles?.sendView2, { flexDirection: 'row' }]}>
          <View style={[styles.subView, {}]}>
            <TextInput
              maxFontSizeMultiplier={1.5}
              value={val}
              ref={textInputRef}
              onChangeText={async (t) => {
                setVal(t)
              }}
              style={styles?.textInputForMessage}
              placeholderTextColor={"white"}
              placeholder={"Message..."}
            />
            {onPressAttachment &&
              <Pressable onPress={() => {
                setImagesMedias([])
                onPressAttachment();
              }}>
                <Image
                  source={Images?.attach}
                  style={styles.attachmentIcon}
                  resizeMode="contain"
                />
              </Pressable>
            }
          </View>
          <Pressable onPress={async () => {
            let valu = val;
            let tempvalue = valu
            setVal("");
            const res = await onPressSend(tempvalue);
            if (res) setVal("");
          }}>
            <Image
              source={Images.send}
              style={styles.sendIcon}
              tintColor={'grey'}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatInput;

const useStyles = () =>
  StyleSheet.create({
    replyToContainer: {  flexDirection: 'row', justifyContent: 'space-between', width: "90%", alignSelf: 'flex-start', marginLeft: 20, marginTop: 5, alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingLeft: 15 },
    replyNametext: {
      color: 'white', fontSize: 12
    },
    wishlistContainer: {
      marginHorizontal: width * 0.05, marginTop: 5
    },
    textInputForMessage:{
      padding: 0, fontSize: 12, color: 'white', width: "68%", height: "100%", marginLeft: 5
    },
    wishlistContainerItemOuter: {
      marginRight: 5, borderRadius: 25, justifyContent: 'center', alignItems: 'center', padding: 0.6
    },
    wishlistContainerItempressable: {
      justifyContent: 'center', alignItems: 'center', borderRadius: 15, padding: 5, paddingHorizontal: 10, backgroundColor: 'grey',
    },
    mediaContainerImage: {
      width: 100, height: 110, borderRadius: 10
    },
    delIconStyle: {
      width: 22, height: 22
    },
    crossImageStyle: {
      width: 15, height: 15
    },
    replyMessageText: {
      color: 'white',  fontSize: 15
    },
    mediaContainer: {
      paddingHorizontal: width * 0.05, marginTop: 5
    },
    attachmentIcon: { height: 16, width: 16 },
    sendIcon: { height: 35, width: 35 },
    subView: {
      width: "86%",
      height: 40,
      backgroundColor: 'grey',
      borderRadius: 100,
      borderWidth: 1,
      borderColor: 'grey',
      paddingHorizontal: 5,
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
    },
    uploadView: {
      width: 100, height: 110,
      borderWidth: 1.4,
      borderColor: 'bluw',
      borderRadius: 10,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 'grey',
      alignSelf: "center",
    },
    removeBlock: {
      width: 20,
      height: 20,
      opacity: 0.6,
      borderRadius: 10,
      top: 2, right: 2,
      position: "absolute",
    },
    sendView: {
      width: "100%",
      justifyContent: "space-between",
      backgroundColor: 'black',
    },
    sendView2: {
      alignItems: "center",
      width: "100%",
      alignSelf: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10
    },
    wishListgardient: {
      borderRadius: 25, justifyContent: 'center', alignItems: 'center', height: 4, width: 22
    },
    wishListgardientInner: {
      justifyContent: 'center', alignItems: 'center', height: 5, width: 25, borderRadius: 18, padding: 5, paddingHorizontal: 10
    },
    wishListText: {
      color: 'white', fontSize: 12
    }
  });
