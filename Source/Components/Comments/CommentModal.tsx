import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useIsFocused, useTheme } from "@react-navigation/native";
import CommentBlocks from "./CommentBlocks";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import Images from "../../Keys/Images";
import useFireStoreUtil from "../../Functions/FireStoreUtils";
import moment from "moment";

const CommentModal = ({ visible, onCrossPress, productId }: any) => {
  const styles = useStyles();
  const [allComments, setAllComments] = useState([]);
  const [refresh, setRefresh] = useState(false)
  const focus = useIsFocused();
  const { user_id, userData } = useSelector((state: any) => state.userData);
  const [chatInputEnabled, setChatInputEnabled] = useState(true)
  const [chatInputEnabledId, setChatInputEnabledId] = useState(null)
  const dispatch = useDispatch();


  const fetchingComments = async () => {
    try {
      const fireUtils = useFireStoreUtil();
      const response: any = await fireUtils.gettingAllCommentsWithReplies(productId)
      setAllComments(response)
    } catch (e: any) {
    } finally {

    }
  }

  const addingComments = async (productId: string, comment: string) => {
    const fireUtils = useFireStoreUtil();
    const response = await fireUtils.addingCommentForTheProduct(productId, comment, user_id, userData?.businessName ?? "", userData?.profile_picture ?? '')
    if (response?.state) {
      let obj = {
        userId: user_id,
        id: response.id,
        comment: comment,
        productId: productId,
        sellerName : userData?.businessName ?? "",
        name: userData?.name ?? "",
        profile_picture: userData?.profile_picture,
        createdAt: moment().unix(),
      }
      setAllComments(prev => [obj, ...prev]);
    }
  }

  const onReplyPress = async (parent_id: string, productId: string, comment: string) => {
    const fireUtils = useFireStoreUtil();
    const response : any = await fireUtils.addingCommentForNestedProduct(parent_id, productId, comment, user_id, userData?.businessName ?? "", userData?.profile_picture)
    if (response?.state) {
      const commentData = {
        sellerId : user_id,
        id : response?.id,
        comment: comment,
        productId: productId,
        parent_id: parent_id,
        sellerName : userData?.businessName ?? "",
        profile_picture: userData?.profile_picture,
        createdAt: moment().unix(),
      };

      setAllComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === parent_id) {
            if (comment.replies?.length > 0) {
              return {
                ...comment,
                replies: [commentData, ...comment.replies]
              }
            } else {
              return {
                ...comment,
                replies: [commentData]
              }
            }
          }
          return comment;
        })
      );
    }
  }

  const removingItem = (comment_id: string) => {
    const filteredUsers = allComments.filter((item, index) => item?._id !== comment_id);
    setAllComments(filteredUsers)
  };


  const deletingComments = async (comment_id: string) => {
    try {
      const fireUtils = useFireStoreUtil();
      const response: any = fireUtils.deletingCommentForTheProduct(productId, comment_id)
      if (response) {
        setAllComments(prev => prev.filter(comment => comment.id !== comment_id));
      }
    } catch (e: any) {
      return false;
    } finally {
    }
  }

  useEffect(() => {
    if (focus) fetchingComments();
  }, [focus])


  const setChatInputEnabledFunc = () => {
    // setChatInputEnabled(!chatInputEnabled)
  }

  const setChatInputEnabledIdfunc = (id) => {
    setChatInputEnabledId(id)
    setChatInputEnabled(id == null ? true : false)
  }



  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : null}
        style={styles.mainView}
      >
        <View style={[styles.whiteView, { height: chatInputEnabled ? '56%' : '66%' }]}>
          <View style={styles.headView}>
            <Text maxFontSizeMultiplier={1.5} style={styles.count}>
              {allComments?.length}<Text style={{}}> {allComments?.length > 1 ? 'comments' : 'comment'}</Text>
            </Text>
            <Pressable hitSlop={20} onPress={onCrossPress}>
              <Image
                source={Images?.Cancel}
                style={styles?.crossIcon}
                resizeMode="contain"
              />
            </Pressable>
          </View>
          <View style={styles.seprator} />
          <View></View>
          {refresh ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View> :
            <FlatList
              data={allComments}
              style={{ marginTop: 18 }}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => `${item?.id}${item?.replies?.length}`}
              renderItem={({ item, index }: any) => {
                return <CommentBlocks item={item} chatInputEnabledId={chatInputEnabledId} setChatInputEnabledIdfunc={setChatInputEnabledIdfunc} setChatInputEnabledFunc={setChatInputEnabledFunc} index={index} onCrossPress={onCrossPress} fetchingComments={fetchingComments} onReplyPress={onReplyPress} deletingComments={deletingComments} />;
              }}
              removeClippedSubviews={true}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>
                  {'no comments'}
                </Text>
              )}
            />
          }
          <View style={styles?.seprator} />
        </View>
        {
          chatInputEnabled &&
          <ChatInput chatInputEnabled={chatInputEnabled} onPressSend={(text: string) => {
            return addingComments(productId, text)
          }} />
        }

      </KeyboardAvoidingView>
    </Modal>
  );
};

export default React.memo(CommentModal);

const useStyles = () =>
  StyleSheet.create({
    inputStyle: {
      padding: 0,
      marginLeft: 10,
      color: 'white',
    },
    emptyText: {
      alignSelf: "center",
      color: "black",
    },
    bottomView: {
      marginVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    textView: {
      height: 42,
      width: "84%",
      backgroundColor: 'grey',
      borderWidth: 1,
      borderColor: 'grey',
      borderRadius: 10,
      marginLeft: 4,
      justifyContent: "center",
    },
    seprator: {
      height: 1,
      backgroundColor: 'grey',
      width: "96%",
      alignSelf: "center",
      marginTop: 11,
    },
    crossIcon: { height: 14, width: 14 },
    headView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 2,
    },
    count: { color: 'black' },
    whiteView: {
      width: "100%",
      backgroundColor: '#FFF6F3',
      height: "56%",
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      padding: 16,
    },
    mainView: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.75)",
      justifyContent: "flex-end",
    },
  });
