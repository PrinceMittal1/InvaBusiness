import React, { useContext } from 'react';
import {
  Modal,
  StyleSheet,
  Pressable,
  View,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
// import ImagePicker from 'react-native-image-crop-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { hp } from '../Keys/dimension';

interface ImagePickerModalProps {
  visible: boolean;
  attachments?: (image: Image) => void;
  pressHandler?: () => void;
  maxFilesAllwdToadd?: any;
  openCamera: () => any;
  mutipleNotAllowed?: any;
  type: any,
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  attachments,
  pressHandler,
  maxFilesAllwdToadd,
  openCamera,
  mutipleNotAllowed,
  type
}) => {
  const { colors, images } = useTheme() as any;
  const styles = createStyles(colors);

  // console.log("maxFilesAllwdToadd maxFilesAllwdToadd ", maxFilesAllwdToadd)

  const openGallery = () => {
    try {
      ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: false,
        mediaType: type,
        multiple: mutipleNotAllowed ? false : true,
        maxFiles: maxFilesAllwdToadd ? maxFilesAllwdToadd : 6,
      }).then(async (images: Image[] | Image) => {
        const selectedFiles = Array.isArray(images) ? images : [images];

        const validFiles: any = [];

        for (const file of selectedFiles) {
          if (file?.mime?.startsWith('video') && file?.duration > 30000) {
          } if (file?.mime?.startsWith('video') && file?.duration < 5000) {
          } else {
            validFiles.push(file);
          }
        }
        const finalFiles = validFiles.slice(0, maxFilesAllwdToadd ? maxFilesAllwdToadd : 6);

        if (finalFiles.length) {
          attachments(finalFiles);
        }
        pressHandler();
      });
    } catch (error: any) {
      
    }
  };


  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}>
      <Pressable onPress={pressHandler} style={styles.modalScreen}>
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.chooseMedia}>{'Choose Media'}</Text>
            <Pressable style={{ position: "absolute", right: 0 }} onPress={pressHandler}>
              <Image source={images?.crossBlack} style={styles?.crossIcon} />
            </Pressable>
          </View>
          <View style={styles.optionsContainer}>
            <View>
              <Pressable style={styles?.uploadView} onPress={openCamera}>
                <Image source={images?.cameraIcon2} style={styles?.cameraIcon} />
              </Pressable>
              <Text maxFontSizeMultiplier={1.5} style={styles.options}>
                {'Camera'}
              </Text>
            </View>

            <View>
              <Pressable style={styles?.uploadView} onPress={openGallery}>
                <Image source={images?.gallery} style={styles?.cameraIcon} />
              </Pressable>
              <Text maxFontSizeMultiplier={1.5} style={styles.options}>
                {"Gallery"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  modalScreen: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors?.black2,
    width: "90%",
    alignSelf: "center",
    paddingVertical: 10,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  chooseMedia: {
    fontSize: 18,
    // fontFamily: AppFonts?.SemiBold,
    alignSelf: "center",
    textAlign: "center",
    color: colors?.white,
  },
  options: {
    fontSize: hp(1.7),
    color: colors?.white,
    // fontFamily: AppFonts?.Medium,
    textAlign: "center",
    marginTop: hp(1),
    marginBottom: hp(1.5),
  },
  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: hp(3),
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(0.5),
  },
  uploadView: {
    height: hp(10),
    width: hp(10),
    backgroundColor: colors?.lightGray3,
    borderColor: colors?.orange,
    borderWidth: 1.5,
    borderRadius: 10,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    height: hp(3.4),
    width: hp(3.4),
    resizeMode: "contain",
  },
  crossIcon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
});

export default ImagePickerModal;