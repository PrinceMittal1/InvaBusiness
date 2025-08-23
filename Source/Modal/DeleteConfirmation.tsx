import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import { hp, wp } from "../Keys/dimension"
import FastImage from "@d11/react-native-fast-image"
import BottomButton from "../Components/BottomButton"
import Images from '../Keys/Images';
import Colors from "../Keys/colors";


const DeleteConfirmation = ({onClosePress, visible, confimation} : any) =>{
    return(
        <Modal
            transparent
            animationType="fade"
            visible={visible}
        >
            <TouchableWithoutFeedback onPress={() => {

            }}>
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


                        <View style={{ alignItems:'center', marginHorizontal:wp(10)}}>
                            <FastImage source={Images?.delete} style={{width:wp(20), height:wp(20)}}/>
                            <Text style={{textAlign:'center', fontSize:20, color:Colors?.DarkText, marginTop:hp(2)}}>Are you want to delete this product</Text>
                        </View>

                        
                        <BottomButton
                            title={'Delete'}
                            clickable={confimation}
                            txtStyle={{ fontSize: 20, color:'#FFFFFF' }}
                            btnStyle={{ marginTop: 20, backgroundColor: Colors?.buttonPrimaryColor, width: wp(80) }}
                        />

                        <BottomButton
                            title={'Cancel'}
                            clickable={onClosePress}
                            txtStyle={{ fontSize: 20, color:'#FFFFFF' }}
                            btnStyle={{ marginTop: 20,  backgroundColor: Colors?.buttonPrimaryColor, width: wp(80) }}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default DeleteConfirmation

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: wp(90),
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