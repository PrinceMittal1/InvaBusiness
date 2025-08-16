import { useFocusEffect, useNavigation, useTheme } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  FlatList,
  Alert,
  Linking,
  Dimensions,
} from "react-native";
import RNFS from 'react-native-fs';
import storage from '@react-native-firebase/storage';
import { hp, wp } from "../Keys/dimension";
import { useDispatch, useSelector } from "react-redux";
import FastImage from "@d11/react-native-fast-image";
import moment from "moment";
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import BottomButton from "./BottomButton";
import { setLoader } from "../Redux/Reducers/tempData";
import Images from "../Keys/Images";
import ImageCropPicker from "react-native-image-crop-picker";
import ShowMediaModal from "./ShowMediaModal";
import Dropdown from "./DropDown";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import ProductUploadingModal from "../Modal/productUploadingModal";
import { createVectorForUser } from "../Api";
import AppFonts from "../Functions/Fonts";
import Colors from "../Keys/colors";



interface props {
  cameraOnpress?: () => void;
  videoOnpress?: () => void;
  fetchingAllFeed?: any;
  ClickedOnPost?: any;
  ClosingModal?: any;
}
const { width, height } = Dimensions.get('window')
const AddingProduct: React.FC<props> = ({
  cameraOnpress,
  videoOnpress,
  fetchingAllFeed,
  ClickedOnPost,
  ClosingModal,
}) => {
  const { user_id } = useSelector((state: any) => state.userData);
  const { colors, images } = useTheme() as any;
  const [title, setTitle] = useState("");
  const [showViewer, setShowViewer] = useState<boolean>(false);
  const [mediaData, setMediaData] = useState<any>(null);
  const navigation: any = useNavigation();
  const [images1, setImages] = useState<any>([]);
  const [stateForUploadingModal, setStateForUploadingModal] = useState({
    percentage: '0',
    number: 1,
    total: 1,
    state: false
  })
  const [selectedTags, setSelectedTags] = useState([])
  const dispatch = useDispatch();
  const [productType, setProductType] = useState('')
  const styles = createStyles(colors);

  const removeImage = (index: any) => {
    const updatedImages = images1?.filter((_: any, i: any) => i !== index);
    setImages(updatedImages);
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

  const sendingTobackend = async () => {
    try {
      let urlOfImages: string[] = [];
      for (const [index, image] of images1.entries()) {
        const uploadedUrl = await uploadMediaToFirebase(image?.path, index + 1, images1.length);
        if (uploadedUrl) {
          urlOfImages.push(uploadedUrl);
        }
      }
      const fireUtils = useFireStoreUtil();
      const ref: any = await fireUtils.createProduct(user_id, urlOfImages, title, productType, selectedTags)
      if (ref) {
        ClosingModal();
        setStateForUploadingModal({
          ...stateForUploadingModal,
          state: false
        })
        createVectorForUser(ref, title, productType, selectedTags, "")
      }
    } catch (error) {
      console.error("⚠️ Catch Error:", error);
    } finally {
      dispatch(setLoader(false));
    }
  };


  const openGallery = () => {
    if (images1.length >= 3) {
      console.log("Maximum image limit reached");
      return;
    }
    const allowMultiple = images1.length < 2;
    try {
      ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: false,
        mediaType: 'photo',
        multiple: allowMultiple, // true only when needed
        maxFiles: allowMultiple ? 3 - images1.length : 1, // ensure no mismatch
        compressImageQuality: 0.8, // reduces iOS memory crash risk
        forceJpg: true, // prevents HEIC decoding issues
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


  const renderItem = ({ item, index }: any) => {
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
        <FastImage source={{ uri: item?.path }} style={styles.image}>
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

  const removeItem = (itemToRemove: string) => {
    setSelectedTags(prevItems => prevItems.filter(item => item !== itemToRemove));
  };

  const RenderItemForSelectedProduct = ({ item }: { item: any }) => {
    return (
      <View style={styles.tagItem}>
        <Text style={styles.tagText}>{item}</Text>
        <Pressable onPress={() => { removeItem(item) }} style={styles.tagRemoveButton}>
          <Image
            source={Images?.Cancel}
            style={styles.tagRemoveIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    );
  };


  return (
    <View style={styles?.msgVew}>

      <Pressable
        style={{ alignSelf: 'flex-end', padding: 10, marginRight: 5 }}
        onPress={ClosingModal}
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

      <View style={{ width: '100%', alignSelf: 'center' }}>
        <Text style={styles.inputLabel}>Title</Text>
        <View style={styles?.dropdown}>
          <TextInput
            blurOnSubmit={false}
            maxFontSizeMultiplier={1.5}
            placeholder={'Title'}
            multiline
            value={title}
            style={{ fontFamily: AppFonts.Regular, fontSize: 16 }}
            onChangeText={(t: string) => setTitle(t)}
            placeholderTextColor={Colors?.DarkText}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={{ alignSelf: 'center', marginTop: hp(2), width: '100%' }}>
        <Text style={styles.inputLabel}>Products Type</Text>

        <Dropdown
          options={['Saree', 'Suits', 'Toys', 'Dinner Set', 'Crockery', 'Pants', 'Shirts']}
          selectedValue={productType}
          onValueChange={(item) => {
            setProductType(item)
          }}
        />
      </View>


      <View style={{ alignSelf: 'center', marginTop: hp(2), width: '100%' }}>
        <Text style={styles.inputLabel}>Products Tags</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {selectedTags.map((item, index) => (
            <RenderItemForSelectedProduct key={index} item={item} />
          ))}
        </View>

        <Dropdown
          options={['Saree for women', 'Suits for ladies', 'Toy gun', 'Dinner Set red', 'Crockery glasses', 'Pants for men', 'Shirts black']}
          selectedValue={''}
          barBorderColor={{ borderColor: 'black', paddingVertical: 10 }}
          alreadySelectedOptions={selectedTags}
          onValueChange={(item) => {
            let oldItems: any = [...selectedTags, item]
            setSelectedTags(oldItems)
          }}
        />
      </View>


      <View>
        <FlatList
          data={images1.length < 3 ? [...images1, "upload"] : images1}
          numColumns={3}
          keyExtractor={(item, index) => index?.toString()}
          style={{ alignSelf: 'center' }}
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
        title={'Post'}
        clickable={() => {
          setStateForUploadingModal({
            ...stateForUploadingModal,
            state: true
          })
          sendingTobackend();
        }}
        txtStyle={{ fontSize: 20 }}
        btnStyle={{ marginTop: 20, backgroundColor : Colors?.buttonPrimaryColor }}
      />

      {showViewer && <ShowMediaModal
        visible={showViewer}
        mediaData={mediaData}
        onClosePress={() => setShowViewer(false)}
      />}

      {stateForUploadingModal?.state &&
        <ProductUploadingModal
          data={stateForUploadingModal}
          setStateForUploadingModal={(newData: any) => {
            setStateForUploadingModal(newData)
          }} />
      }

    </View>
  );
};

export default AddingProduct;

const createStyles = (colors: any) =>
  StyleSheet.create({
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
    uploadImg: {
      height: "34%",
      width: "34%",
      resizeMode: "contain",

      overflow: "hidden",
    },
    uploadTxt: {
      color: colors.black2,
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
      color: colors?.white,
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
      backgroundColor: colors?.black,
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
      color: colors?.white,
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
      backgroundColor: colors?.black,
      width: "100%",
    },
    viewSty: {},
    subSty: {
      alignSelf: "center",
      backgroundColor: colors?.black,
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
    container: {
      flex: 1,
      backgroundColor: Colors?.PrimaryBackground,
    },
    dropdown: {
      padding: 12,
      borderWidth: 1,
      borderColor: Colors?.buttonPrimaryColor,
      borderRadius: 8,
    },
    scrollContainer: {
      flex: 1
    },
    profileImageContainer: {
      marginTop: 20,
      width: 100,
      height: 100,
      alignSelf: 'center'
    },
    profileImage: {
      width: 100,
      height: 100,
      alignSelf: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'grey'
    },
    editIcon: {
      width: 30,
      height: 30,
      position: 'absolute',
      bottom: -10,
      right: -10
    },
    inputContainer: {
      width: width * 0.9,
      alignSelf: 'center',
      marginTop: hp(1)
    },
    inputLabel: {
      fontFamily: AppFonts.Regular,
      fontSize: 16,
      marginLeft: wp(1),
      color: Colors?.DarkText
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap'
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
    bottomButton: {
      marginBottom: hp(5),
      marginTop: hp(5)
    }
  });
