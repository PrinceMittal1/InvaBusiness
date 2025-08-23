import FastImage from '@d11/react-native-fast-image';
import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Images from '../Keys/Images';
import LottieView from 'lottie-react-native';

type ProductUploadingModalProps = {
  data: any;
  setStateForUploadingModal : any
};

const { width: screen_Width, height: screen_Height } = Dimensions.get('window')

const ProductUploadingModal = ({ data, setStateForUploadingModal }: ProductUploadingModalProps) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
    >
      <TouchableWithoutFeedback onPress={()=>{
        setStateForUploadingModal({
          ...data,
          state : false
        })
      }}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <LottieView
              source={Images?.productUploadingAnimation}
              autoPlay
              loop
              style={{ width: screen_Width * 0.6, height: screen_Width * 0.6 }}
            />

            <Text style={{fontSize:20, alignSelf:'center'}}>{Math.round(data?.percentage)}%</Text>
            <Text style={{fontSize:20, marginTop:10, alignSelf:'center'}}>{`${data?.number}/${data?.total}`}</Text>
            <Text style={styles.message}>{"Uploading product"}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ProductUploadingModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center'
  }
});
