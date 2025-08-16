import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import FastImage from "@d11/react-native-fast-image";
import { useTheme } from "@react-navigation/native";
import { wp } from "../Keys/dimension";

const ShowMediaModal = ({ visible, mediaData, onClosePress }: any) => {
  const [show, setshow] = useState(false);
  const { colors } = useTheme() as any;
  const [mute, setMute] = useState<boolean>(true);

  const getMedia = () => {
    if (
      mediaData?.mime_type == "image/png" ||
      mediaData?.mime_type == "image/jpeg" ||
      mediaData?.mime == "image/png" ||
      mediaData?.mime == "image/jpeg" ||
      mediaData?.mime_type == "image/jpg" ||
      mediaData?.mime == "image/heic"
    ) {
      return "image";
    } else {
      return "video";
    }
  };

  useEffect(() => {
    getMedia();
  }, [mediaData]);
  

  return (
    <Modal transparent={true} visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors?.baseColor,
          justifyContent: "center",
          // alignItems:"center"
        }}
      >
        <Pressable
          hitSlop={30}
          onPress={onClosePress}
          style={{
            position: "absolute",
            top: Platform.OS == "ios" ? 70 : 40,
            right: 20,
            zIndex: 9999,
          }}
        >
          <Text maxFontSizeMultiplier={1.7} style={{ color: "white" }}>
            Close
          </Text>
        </Pressable>

        <View
          style={{
            height: wp(150),
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",            
          }}
        >
          {getMedia() == "image" ? (
            <FastImage
              style={styles.car}
              source={
                mediaData?.path
                  ? {
                      uri:
                        mediaData?.ServerImage == true
                          ? `${getEnvVars().fileUrl}${mediaData?.path}`
                          : mediaData?.path,
                    }
                  : { uri: getEnvVars().fileUrl + mediaData?.media_url }
              }
            />
          ) : (
            <>
              <Video
                removeClippedSubviews={true}
                source={
                  // {uri: sensitiveData?.devFileUrl+mediaData?.media_url}
                  mediaData?.path
                    ? { uri: mediaData?.path }
                    : { uri: getEnvVars().fileUrl + mediaData?.media_url }
                }
                style={[
                  styles.car,
                  {
                    borderColor: "transparent",
                    overflow: "hidden",
                  },
                ]}
                resizeMode="cover"
                repeat={true}
                muted={mute}
                controls={true}
                onLoadStart={() => setshow(true)}
                onReadyForDisplay={() => setshow(false)}
              ></Video>
              {show && (
                <ActivityIndicator
                  size={"small"}
                  color={"white"}
                  style={{ position: "absolute", top: 200, left: "50%" }}
                />
              )}
              
            </>
          )}
          {getMedia() != "image" && Platform?.OS==="android" && (
                <Pressable
                  onPress={() => {
                    setMute(!mute);
                  }}
                  style={styles?.mutePressable}
                >
                  <Text style={styles?.mute}>{mute ? "🔇" : "🔊"}</Text>
                </Pressable>
              )}
        </View>
      </View>
    </Modal>
  );
};

export default ShowMediaModal;

const styles = StyleSheet.create({
  car: {
    height: wp(150),
    width: "90%",
    alignSelf: "center",
    resizeMode: "cover",
    borderRadius: 10,
    overflow: "hidden",
  },
  mutePressable: {
    position: "absolute",
    top: 10,
    right: 30,
    // backgroundColor:'rgba(0,0,0,0.2)',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    height: 25,
    width: 25
  },
  mute: {
    alignSelf: "center",
    fontSize: 14
  }
});
