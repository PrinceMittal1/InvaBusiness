import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  FlatList,
  ScrollView,
} from "react-native";
import RNFS from 'react-native-fs';
import storage from '@react-native-firebase/storage';
import { hp, wp } from "../Keys/dimension";
import { useDispatch, useSelector } from "react-redux";
import FastImage from "@d11/react-native-fast-image";
import ImageCropPicker from "react-native-image-crop-picker";
import ShowMediaModal from "./ShowMediaModal";
import Dropdown from "./DropDown";
import ProductUploadingModal from "../Modal/productUploadingModal";
import { creatingProduct } from "../Api";
import AppFonts from "../Functions/Fonts";
import Colors from "../Keys/colors";
import { showToast } from "../Functions/showToast";
import BottomButton from "./BottomButton";
import { setLoader } from "../Redux/Reducers/tempData";
import Images from "../Keys/Images";

interface props {
  cameraOnpress?: () => void;
  videoOnpress?: () => void;
  fetchingAllFeed?: any;
  ClickedOnPost?: any;
  ClosingModal?: any;
  productsaved?: any;
}

const AddingProduct: React.FC<props> = ({
  ClosingModal,
  productsaved,
}) => {
  const { user_id, userData } = useSelector((state: any) => state.userData);
  const { colors } = useTheme() as any;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [showViewer, setShowViewer] = useState<boolean>(false);
  const [mediaData, setMediaData] = useState<any>(null);
  const navigation: any = useNavigation();
  const [images1, setImages] = useState<any>([]);
  const [stateForUploadingModal, setStateForUploadingModal] = useState({
    percentage: '0',
    number: 1,
    total: 1,
    state: false
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const dispatch = useDispatch();
  const [productType, setProductType] = useState('');
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
      if (!fileExists) return;

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
        });
      });

      await task;
      return await uploadRef.getDownloadURL();
    } catch (err: any) {
      console.error('❌ Upload failed:', err.code, err.message);
    }
  };

  const allValidation = () => {
    if (!title?.trim()) {
      showToast("Title is required");
      return false;
    } else if (!description?.trim()) {
      showToast("Description is required");
      return false;
    } else if (!productType?.trim()) {
      showToast("Product type is required");
      return false;
    } else if (images1?.length < 1) {
      showToast("At least one photo is required");
      return false;
    }
    setStateForUploadingModal({ ...stateForUploadingModal, state: true });
    return true;
  };

  const sendingTobackend = async () => {
    try {
      if (allValidation()) {
        let urlOfImages: string[] = [];
        for (const [index, image] of images1.entries()) {
          const uploadedUrl = await uploadMediaToFirebase(image?.path, index + 1, images1.length);
          if (uploadedUrl) urlOfImages.push(uploadedUrl);
        }

        const sellerId = user_id;
        const sellerName = userData?.businessName;
        const sellerCity = userData?.city;
        const sellerState = userData?.state;
        const tags = selectedTags;

        const res = await creatingProduct({
          title,
          description,
          sellerName,
          sellerId,
          sellerCity,
          sellerState,
          tags,
          productType,
          price: Number(price.replace(/[^0-9.]/g, "")),
          images: urlOfImages
        });

        if (res.status == 200) {
          ClosingModal();
          productsaved();
          setStateForUploadingModal({ ...stateForUploadingModal, state: false });
        }
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
        multiple: allowMultiple,
        maxFiles: allowMultiple ? 3 - images1.length : 1,
        compressImageQuality: 0.8,
        forceJpg: true,
      }).then(async (images: any) => {
        const selectedFiles = Array.isArray(images) ? images : [images];
        const finalFiles = selectedFiles.slice(0, 3 - images1.length);
        if (finalFiles.length) setImages([...images1, ...finalFiles]);
      });
    } catch (error: any) {
      console.log("Error opening picker", error);
    }
  };

  const renderItem = ({ item, index }: any) => (
    <Pressable
      onPress={() => {
        setMediaData(item);
        setTimeout(() => setShowViewer(true), 200);
      }}
      style={styles.uploadPressable}
    >
      <FastImage source={{ uri: item?.path }} style={styles.image}>
        <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeBlock}>
          <FastImage source={Images?.delete} style={styles.play} resizeMode="contain" />
        </TouchableOpacity>
      </FastImage>
    </Pressable>
  );

  const removeItem = (itemToRemove: string) => {
    setSelectedTags(prevItems => prevItems.filter(item => item !== itemToRemove));
  };

  const changingPrice = (t: string) => {
    const clean = t.replace(/^\₹/, "");
    setPrice(clean.length > 0 ? `₹${clean}` : "");
  };

  const RenderItemForSelectedProduct = ({ item }: { item: any }) => (
    <View style={styles.tagItem}>
      <Text style={styles.tagText}>{item}</Text>
      <Pressable onPress={() => removeItem(item)} style={styles.tagRemoveButton}>
        <Image source={Images?.Cancel} style={styles.tagRemoveIcon} resizeMode="contain" />
      </Pressable>
    </View>
  );

  return (
    <ScrollView style={styles.msgVew} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.closeBtn} onPress={ClosingModal}>
        <FastImage source={Images?.Cancel} style={styles.closeIcon} resizeMode="contain" />
      </Pressable>

      {/* Title */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Title</Text>
        <View style={styles.dropdown}>
          <TextInput
            placeholder={'Title'}
            multiline
            value={title}
            style={styles.inputText}
            onChangeText={setTitle}
            placeholderTextColor={Colors?.DarkText}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Description */}
      <View style={styles.inputWrapperMargin}>
        <Text style={styles.inputLabel}>Description</Text>
        <View style={styles.dropdown}>
          <TextInput
            placeholder={'Description'}
            multiline
            value={description}
            style={styles.inputText}
            onChangeText={setDescription}
            placeholderTextColor={Colors?.DarkText}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Product Type */}
      <View style={styles.inputWrapperMargin}>
        <Text style={styles.inputLabel}>Products Type</Text>
        <Dropdown
          options={['Saree', 'Suits', 'Toys', 'Dinner Set', 'Crockery', 'Pants', 'Shirts']}
          selectedValue={productType}
          onValueChange={setProductType}
        />
      </View>

      <View style={styles.inputWrapperMarginSmall}>
        <Text style={styles.inputLabel}>Price</Text>
        <View style={styles.dropdown}>
          <TextInput
            placeholder={'Price'}
            multiline
            value={price}
            style={styles.inputPrice}
            keyboardType="numeric"
            onChangeText={changingPrice}
            placeholderTextColor={Colors?.DarkText}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Tags */}
      <View style={styles.inputWrapperMargin}>
        <Text style={styles.inputLabel}>Products Tags</Text>
        <View style={styles.tagsRow}>
          {selectedTags.map((item, index) => (
            <RenderItemForSelectedProduct key={index} item={item} />
          ))}
        </View>
        <Dropdown
          options={['Saree for women', 'Suits for ladies', 'Toy gun', 'Dinner Set red', 'Crockery glasses', 'Pants for men', 'Shirts black']}
          selectedValue={''}
          alreadySelectedOptions={selectedTags}
          onValueChange={(item) => setSelectedTags([...selectedTags, item])}
        />
      </View>

      {/* Images */}
      <FlatList
        data={images1.length < 3 ? [...images1, "upload"] : images1}
        numColumns={3}
        keyExtractor={(item, index) => index?.toString()}
        style={styles.imageList}
        renderItem={({ item, index }) =>
          item == "upload" ? (
            <Pressable key={index} onPress={openGallery} style={styles.uploadBtn}>
              <FastImage source={Images?.upload} style={styles.uploadImgBtn} resizeMode="contain" />
            </Pressable>
          ) : (
            renderItem({ item, index })
          )
        }
      />

      {/* Submit */}
      <BottomButton
        title={'Post'}
        clickable={sendingTobackend}
        txtStyle={styles.postBtnText}
        btnStyle={styles.postBtn}
      />

      {showViewer && (
        <ShowMediaModal
          visible={showViewer}
          mediaData={mediaData}
          onClosePress={() => setShowViewer(false)}
        />
      )}

      {stateForUploadingModal?.state && (
        <ProductUploadingModal
          data={stateForUploadingModal}
          setStateForUploadingModal={setStateForUploadingModal}
        />
      )}
    </ScrollView>
  );
};

export default AddingProduct;

const createStyles = (colors: any) =>
  StyleSheet.create({
    msgVew: {
      width: "95%",
      borderWidth: 1,
      borderColor: 'grey',
      height: hp(50),
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 1.84,
      marginTop: hp(1.4),
      padding: 8,
      alignSelf: "center",
      borderRadius: 10,
    },
    closeBtn: {
      alignSelf: 'flex-end',
      padding: 10,
      marginRight: 5,
    },
    closeIcon: {
      height: hp(4),
      width: wp(4),
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
      marginTop: hp(1),
    },
    inputText: {
      fontSize: 16,
    },
    inputPrice: {
      fontFamily: AppFonts.Regular,
      fontSize: 16,
    },
    inputLabel: {
      fontFamily: AppFonts.Regular,
      fontSize: 16,
      marginLeft: wp(1),
      color: Colors?.DarkText,
    },
    dropdown: {
      paddingHorizontal: 12,
      height: wp(12),
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors?.buttonPrimaryColor,
      borderRadius: 8,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    tagItem: {
      padding: 10,
      paddingRight: 5,
      marginBottom: 3,
      marginRight: 5,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e0dedd',
      borderRadius: 10,
    },
    tagText: {
      fontSize: 14,
      fontFamily: AppFonts.Regular,
    },
    tagRemoveButton: {
      paddingHorizontal: 5,
    },
    tagRemoveIcon: {
      width: 14,
      height: 14,
    },
    imageList: {
      alignSelf: 'center',
    },
    uploadPressable: {
      marginRight: 20,
      height: 93,
      width: 93,
      borderWidth: 1.4,
      borderRadius: 10,
      borderStyle: "dashed",
      marginTop: hp(2),
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },
    uploadBtn: {
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
    uploadImgBtn: {
      height: "40%",
      width: "40%",
    },
    play: {
      width: 25,
      height: 25,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
      justifyContent: "flex-end",
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
    postBtnText: {
      fontSize: 20,
    },
    postBtn: {
      marginVertical: 20,
      backgroundColor: Colors?.buttonPrimaryColor,
    },
  });
