import FastImage from "@d11/react-native-fast-image";
import {
    Dimensions,
    Pressable,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    ScrollView
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp } from "../Keys/dimension";
import { useEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Images from "../Keys/Images";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "../Routes/AppRoutes";
import Header from "../Components/Header";
import { setUserData, setUserId } from "../Redux/Reducers/userData";
import AppFonts from "../Functions/Fonts";
import Colors from "../Keys/colors";
import { deleteUser, profileDetailApi } from "../Api"
import DeleteConfirmation from "../Modal/DeleteConfirmation";
import LogoutConfirmation from "../Modal/LogoutConfirmation";

const { width } = Dimensions.get("window");

const Profile = () => {
    const [profileImage, setProfileImage] = useState<any>(null);
    const navigation = useNavigation();
    const [nameForBusiness, setNameForBusiness] = useState('')
    const [loader, setLoader] = useState(false)
    const { user_id } = useSelector((state: any) => state.userData);
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
        const [showDeleteModal, setShowDeleteModal] = useState(false)
        const [showLogoutPopUp, setShowLogoutPopUp] = useState(false)
    const focus = useIsFocused();

    const gettingProfileDetail = async () => {
        try {
            const res = await profileDetailApi({ user_id: user_id })
            if (res?.status == 200) {
                dispatch(setUserData(res?.data?.seller))
                setProfileImage(res?.data?.seller?.profile_picture);
            }
        } catch (error) {
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        setLoader(true)
        focus && gettingProfileDetail();
    }, [focus]);

    const loggingOut = () => {
        dispatch(setUserData({}));
        dispatch(setUserId(""));
        navigation.reset({
            index: 0,
            routes: [{ name: AppRoutes?.Login }]
        });
    };

    const RenderItem = ({ item, onPress }:any) => {
        return (
            <Pressable
                style={styles.menuItem}
                onPress={onPress ? onPress : () => navigation.navigate(item?.navigationTitle)}
            >
                <Text>{item?.title}</Text>
                <FastImage
                    source={Images?.upArrow}
                    style={styles.arrowIcon}
                    tintColor={Colors?.buttonPrimaryColor}
                    resizeMode="contain"
                />
            </Pressable>
        )
    }

    const onDeleting = async() =>{
        const res = await deleteUser({ seller_id: user_id });
        if(res?.status == 200){
            loggingOut();
        }
    }

    return (
        <>
            {loader && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <Header title={"Profile"} rightIcon={Images?.logout} rightClick={()=>setShowLogoutPopUp(true)} />

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.profileImageWrapper}>
                        <FastImage
                            style={styles.profileImage}
                            source={
                                profileImage && !profileImage?.path
                                    ? { uri: profileImage }
                                    : !profileImage && !profileImage?.path
                                        ? Images?.person
                                        : { uri: profileImage.path }
                            }
                        />
                    </View>

                    <View style={{ alignSelf: 'center' }}>
                        <Text style={styles.profileName}>{nameForBusiness}</Text>
                    </View>

                    <View style={styles.menuWrapper}>
                        <RenderItem item={{ title: 'Edit Profile', navigationTitle: AppRoutes?.EditProfile }} />
                        <RenderItem item={{ title: 'Terms', navigationTitle: AppRoutes?.Terms }} />
                        <RenderItem item={{ title: 'Privacy Policy', navigationTitle: AppRoutes?.PrivacyPolicy }} />
                        <RenderItem item={{ title: 'Delete Account' }} onPress={()=>{
                            setShowDeleteModal(true)
                        }}/>
                    </View>
                </ScrollView>
            </View>
            {showDeleteModal &&
                <DeleteConfirmation visible={showDeleteModal} confimation={onDeleting} onClosePress={() => setShowDeleteModal(false)} message={"Are you sure you want to delete this account"} />
            }
            {
                showLogoutPopUp &&
                <LogoutConfirmation confimation={loggingOut} />
            }
        </>
    );
};

export default Profile;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "rgba(233, 174, 160, 0.1)"
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    },
    profileImageWrapper: {
        marginTop: 20,
        width: 150,
        height: 150,
        alignSelf: "center"
    },
    profileImage: {
        width: 150,
        height: 150,
        alignSelf: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "grey"
    },
    profileName: {
        fontFamily: AppFonts.Bold,
        fontSize: 16
    },
    menuWrapper: {
        borderWidth: 1,
        width: wp(90),
        alignSelf: 'center',
        borderColor: Colors.buttonPrimaryColor,
        borderRadius: wp(2)
    },
    menuItem: {
        borderBottomWidth: 1,
        flexDirection: 'row',
        height: wp(12),
        width: wp(90),
        borderColor: Colors?.buttonPrimaryColor,
        alignSelf: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(3),
    },
    arrowIcon: {
        width: wp(5),
        height: wp(5),
        transform: [{ rotate: '90deg' }],
    }
});
