import {
    FlatList,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from "react-native";
  import React, { useContext, useEffect, useState } from "react";
  import { useNavigation, useTheme } from "@react-navigation/native";
  import FastImage from "@d11/react-native-fast-image";
  import moment from "moment";
import { useSelector } from "react-redux";
import Images from "../../Keys/Images";
import useFireStoreUtil from "../../Functions/FireStoreUtils";
  
  const CommentBlocksNesting = ({ item, index,chatInputEnabledId,setChatInputEnabledIdfunc, onCrossPress, onReplyPressNesting,setChatInputEnabledFunc, deletingCommentsNesting, updatingCommentNested }: any) => {
    const { colors, images }: any = useTheme();
    const [itemSaved, setItemSaved] = useState(item);
    const { token , userData} = useSelector((state: any) => state.userData);
    const [itemSavedReplies, setItemSavedReplies] = useState(item?.replies)
    const styles = useStyles(colors);
    const [showNested, setShowNested] = useState(false);
    const [fromEdit, setFromEdit] = useState(false)
    const navigation: any = useNavigation();
    const [showReplyInput, setshowReplyInput] = useState(false);
    const [replyText, setreplyText] = useState("");
  
  
    const formatTimeAgo = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp * 1000); // convert from seconds to milliseconds
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds

    if (diff < 10) return "just now";
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options); // e.g., Jul 05, 2025
  };

    const updatingComment = async (item:any) =>{
        const fireUtils = useFireStoreUtil();
        const response = await fireUtils.updatingCommentForTheProductNested(item?.productId, replyText, item?.parent_id, item?.id)
        if (response) {
          updatingCommentNested(item?.id, replyText)
        }
    }

    // useEffect(()=>{
    //     setshowReplyInput(itemSaved?._id == chatInputEnabledId ? true : false)
    // },[chatInputEnabledId])



    return (
      <>
        <View style={[styles.mainView, {}]}>
          <Pressable onPress={() => {
          }}>
            <FastImage
              source={itemSaved?.profile_picture ? {uri : itemSaved?.profile_picture} : Images.person}
              style={styles.userIcon}
              resizeMode="contain"
            />
          </Pressable>
          <View style={{ marginLeft: 10, width:"84%" }}>
            <Text maxFontSizeMultiplier={1.5} style={styles.name}>{itemSaved?.sellerName ? `${itemSaved?.sellerName}(Seller)` : itemSaved?.name ? `${itemSaved?.name}` : ''}</Text>
            <Text maxFontSizeMultiplier={1.2} style={styles.comment}>{itemSaved?.comment}</Text>
            
            <View style={{flexDirection:'column', alignItems:'flex-start'}}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={[styles?.createdAtStyle]}
              >
                {formatTimeAgo(itemSaved?.createdAt)} <Text onPress={()=>(setshowReplyInput(!showReplyInput),setFromEdit(false),setreplyText(''), setChatInputEnabledFunc(), setChatInputEnabledIdfunc(itemSaved?._id == chatInputEnabledId ? null : itemSaved?._id))}>{`   reply`}
                </Text>
              </Text>
              <View style={{flexDirection:"row",justifyContent:"center"}} >
              {userData?.user_id == itemSaved?.userId &&<Text style={[ styles?.createdAtStyle, {color:'#BD7005'}]} onPress={()=>{
                setshowReplyInput(!showReplyInput)
                setFromEdit(true)
                setreplyText(itemSaved?.comment)
              }}>Edit</Text>}
              {userData?.user_id == itemSaved?.userId &&<Text style={[ styles?.createdAtStyle, {color:'#FF2525'}]} onPress={()=>{
                deletingCommentsNesting(itemSaved)
              }}> {"  "}| {"  "} Delete</Text>}
              </View>

            </View>
  
            {showReplyInput && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <View style={{borderRadius:10, padding:2 }}>
                  <TextInput
                    placeholder={'reply'}
                    placeholderTextColor={'#FFFFFF99'}
                    style={[styles.replyInput]}
                    value={replyText}
                    onChangeText={setreplyText}
                  />
                  </View>
                  <Pressable
                    onPress={async () => {
                      if(fromEdit){
                        updatingComment(item);
                      } else if(onReplyPressNesting){
                        const res = await onReplyPressNesting(item?.id, item?.parent_id, replyText, item?.productId)
                      }
                      setChatInputEnabledIdfunc(null)
                      setshowReplyInput(false)
                      setTimeout(() => {
                        setreplyText("");
                      }, 200);
                    }}
                    style={{ marginLeft: 7 }}
                  >
                    <FastImage
                      source={Images.send}
                      style={{ height: 28, width: 28}}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              )}
          </View>
        </View>
      </>
    );
  };
  
  export default CommentBlocksNesting;
  
  const useStyles = (colors: any) =>
    StyleSheet.create({
      arrowView: { flexDirection: "row", alignItems: "center" },
      arrows: {
        height: 8,
        width: 8,
        tintColor: "black",
        marginTop: -18,
        marginLeft: 4,
      },
      createdAtStyle: {
        color: colors?.white,
        fontSize: 12,
        marginTop: Platform.OS == "ios" ? 4 : 0,
      },
      replyInput: {
        padding: 0,
        paddingHorizontal: 10,
        height: 28,
        width: 200,
        backgroundColor: "rgba(0,0,0,0.75)",
        borderRadius: 8,
        color: "white",
        fontSize: 12,
      },
      seeResult: {
        color: colors?.white,
        fontSize: 12,
        marginBottom: 10,
        marginTop: -14,
        marginLeft: 26,
      },
      comment: {
        color: colors?.white,
        fontSize: 12,
        marginTop: Platform.OS == "ios" ? 4 : 0,
      },
      mainView: {
        flexDirection: "row",
        width: "90%",
        //   alignItems: "center",
        marginBottom: 20,
      },
      name: { color: colors.white, fontSize: 13,  },
      userIcon: { height: 36, width: 36,  borderRadius:18, marginTop:5 },
    });
  