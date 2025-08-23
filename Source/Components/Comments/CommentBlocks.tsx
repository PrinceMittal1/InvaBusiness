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
import CommentBlocksNesting from "./CommentBlockNesting";
import { useSelector } from "react-redux";
import Images from "../../Keys/Images";
import useFireStoreUtil from "../../Functions/FireStoreUtils";

const CommentBlocks = ({ item, index, onCrossPress, onReplyPress, deletingComments, fetchingComments, setChatInputEnabledFunc, setChatInputEnabledIdfunc, chatInputEnabledId }: any) => {
  const { colors, images }: any = useTheme();
  const [itemSaved, setItemSaved] = useState(item);
  const [itemSavedReplies, setItemSavedReplies] = useState(item?.replies)
  const styles = useStyles(colors);
  const [showNested, setShowNested] = useState(false);
  const navigation: any = useNavigation();
  const [fromEdit, setFromEdit] = useState(false)
  const { userData, user_id } = useSelector((state: any) => state.userData);
  const [showReplyInput, setshowReplyInput] = useState(false);
  const [replyText, setreplyText] = useState("");


  const onReplyPressNesting = async (id: string, parent_id: string, messgae: string, productId : string) => {
    const fireUtils = useFireStoreUtil();
    console.log("adding comment ----- onReplyPressNestingonReplyPressNestingonReplyPressNestingonReplyPressNesting")
    const response: any = await fireUtils.addingCommentForNestedProduct(parent_id, productId, messgae, user_id, userData?.businessName ?? "", userData?.profile_picture)
    if (response?.state) {
      const commentData = {
        sellerId: user_id,
        id: response?.id,
        comment: messgae,
        productId: productId,
        parent_id: parent_id,
        sellerName: userData?.businessName ?? "",
        profile_picture: userData?.profile_picture,
        createdAt: moment().unix(),
      };
      setItemSavedReplies([commentData, ...itemSavedReplies]);
    }
  }



  const deletingCommentsNesting = async (item: any) => {
     try {
        const fireUtils = useFireStoreUtil();
        const response: any = fireUtils.deletingCommentForTheProductForNesting(item?.productId, item?.parent_id, item?.id)
        if(response){
          setItemSavedReplies(prev => prev.filter(product => product.id !== item?.id));
        }
      } catch (e: any) {
        return false;
      } finally {
      }
  }

  const updatingComment = async (item: any) => {
    const fireUtils = useFireStoreUtil();
    const response = await fireUtils.updatingCommentForTheProduct(item?.productId, replyText, item?.id)
    if (response) {
      setItemSaved({
        ...itemSaved,
        comment: replyText
      })
    }
  }

  const updatingCommentNested = async (id: any, message :any) => {
    setItemSavedReplies(prev =>
    prev.map(item =>
      item.id === id
        ? { ...item, comment: message }
        : item
    )
  );
  }

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

  return (
    <>
      <View style={styles.mainView}>
        <Pressable onPress={() => {
          onCrossPress();
        }}>
          <FastImage
            source={itemSaved?.profile_picture ? { uri: itemSaved?.profile_picture } : Images.person}
            style={styles.userIcon}
            resizeMode="contain"
          />
        </Pressable>
        <View style={{ marginLeft: 10, width: "87%" }}>
          <Text maxFontSizeMultiplier={1.5} style={styles.name}>{itemSaved?.sellerName ? `${itemSaved?.sellerName}(Seller)` : itemSaved?.name ? `${itemSaved?.name}` : ''}</Text>
          <Text maxFontSizeMultiplier={1.2} style={styles.comment}>{itemSaved?.comment}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              maxFontSizeMultiplier={1.5}
              style={[styles?.createdAtStyle]}
            >
              {formatTimeAgo(itemSaved?.createdAt)} <Text onPress={() => (setshowReplyInput(!showReplyInput), setFromEdit(false), setChatInputEnabledFunc(), setChatInputEnabledIdfunc(item?._id == chatInputEnabledId ? null : item?._id))}>{`   reply`}
              </Text>
            </Text>
            {userData?.user_id == itemSaved?.userId && <Text style={[styles?.createdAtStyle, { color: '#BD7005' }]} onPress={() => {
              setshowReplyInput(!showReplyInput)
              setFromEdit(true)
              setreplyText(itemSaved?.comment)
            }}> {"   "} Edit</Text>}
            {userData?.user_id == itemSaved?.userId && <Text style={[styles?.createdAtStyle, { color: '#FF2525' }]} onPress={
              async () => {
                const res = await deletingComments(itemSaved?.id);
                if (res) {
                  fetchingComments();
                }
              }
            }> {" "} | {" "} Delete</Text>}
          </View>

          {showReplyInput && (
            <View
              style={[styles?.replyInputContainer]}
            >
              <View style={{ borderRadius: 10, padding: 2 }}>
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
                  if (fromEdit) {
                    updatingComment(item);
                  } else if (onReplyPress) {
                    const res = await onReplyPress(itemSaved?.id, itemSaved?.productId, replyText)
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
                  source={Images?.send}
                  style={{ height: 28, width: 28 }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>
      {itemSavedReplies?.length > 0 && (
        <>
          <Pressable
            onPress={() => {
              setShowNested(!showNested);
            }}
            style={[styles.arrowView, {}]}
          >
            <Text maxFontSizeMultiplier={1.5} style={styles.seeResult}>{'reply'} {`(${itemSavedReplies?.length})`}</Text>
            <Pressable onPress={() => {
              setShowNested(!showNested);
            }}>
              <Image
                source={showNested ? Images.upArrow : Images.downArrow}
                style={styles.arrows}
                resizeMode="contain"
                tintColor={"black"}
              />
            </Pressable>
          </Pressable>
        </>
      )}
      {showNested &&
        <FlatList
          data={itemSavedReplies}
          style={{ marginLeft: 52, }}
          keyExtractor={(item) => `${item?.id}-${item.comment}`}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: any) => {
            return <CommentBlocksNesting item={item} chatInputEnabledId={chatInputEnabledId} setChatInputEnabledIdfunc={setChatInputEnabledIdfunc} index={index} setChatInputEnabledFunc={setChatInputEnabledFunc} onCrossPress={onCrossPress} onReplyPressNesting={onReplyPressNesting} deletingCommentsNesting={deletingCommentsNesting} updatingCommentNested={updatingCommentNested}/>;
          }}
        />
      }
    </>
  );
};

export default CommentBlocks;

const useStyles = (colors: any) =>
  StyleSheet.create({
    arrowView: { flexDirection: "row", alignItems: "center", marginTop: -15, marginLeft: 20 },
    arrows: {
      height: 15,
      width: 15,
      tintColor: "black",
      marginLeft: 4,
    },
    createdAtStyle: {
      color: colors?.white,
      fontSize: 12,
      marginTop: Platform.OS == "ios" ? 4 : 0,
    },
    replyInputContainer: {
      flexDirection: "row",
      alignItems: "center",
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
      marginLeft: 26,
    },
    comment: {
      color: colors?.white,
      fontSize: 12,
      marginTop: Platform.OS == "ios" ? 4 : 0,
    },
    mainView: {
      flexDirection: "row",
      width: "100%",
      //   alignItems: "center",
      marginBottom: 20,
    },
    name: { color: colors.white, fontSize: 13 },
    userIcon: { height: 36, width: 36, borderRadius: 100, },
  });
