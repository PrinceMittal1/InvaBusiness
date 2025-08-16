import FastImage from "@d11/react-native-fast-image";
import {
    Dimensions,
    Image,
    Platform,
    Pressable,
    StatusBar,
    Text,
    View,
    PermissionsAndroid,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown from "../Components/DropDown";
import { hp, wp } from "../Keys/dimension";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Images from "../Keys/Images";
import ImageCropPicker from "react-native-image-crop-picker";
import BottomButton from "../Components/BottomButton";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "../Routes/AppRoutes";
import { Country, State, City } from "country-state-city";
import Header from "../Components/Header";
import { setUserData, setUserId } from "../Redux/Reducers/userData";
import Geolocation from "@react-native-community/geolocation";
import AppFonts from "../Functions/Fonts";
import Colors from "../Keys/colors";
import {updatingUserApi} from "../Api"

const { width, height } = Dimensions.get("window");

const Profile = () => {
    const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
    const [profileImage, setProfileImage] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState("Kharar");
    const navigation = useNavigation();
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState<any>({
        code: "PB",
        value: "Punjab"
    });
    const [loader, setLoader] = useState(false)
    const [selectedTags, setSelectedTags] = useState([]);
    const { user_id, userData } = useSelector((state: any) => state.userData);

    const dispatch = useDispatch();

    async function reverseGeocode(lat: number, lng: number) {
        const apiKey = "YOUR_API_KEY";
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const components = data.results[0].address_components;
            const getComponent = (type: string) =>
                components.find((c: any) => c.types.includes(type))?.long_name;
            const city = getComponent("locality") || getComponent("administrative_area_level_2");
            const state = getComponent("administrative_area_level_1");
            const country = getComponent("country");
            const postalCode = getComponent("postal_code");
            console.log({ city, state, country, postalCode });
        } catch (err) {
            console.error("Geocoding error:", err);
        }
    }

    async function getUserLocation() {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn("Location permission denied");
                return;
            }
        }

        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                reverseGeocode(latitude, longitude);
            },
            error => { },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    useEffect(() => {
        setLoader(true)
        setSelectedStateCode({
            code: userData?.stateCode,
            value: userData?.state
        });
        setProfileImage(userData?.profile_picture);
        setSelectedTags(userData?.interest);
        setSelectedCity(userData?.city);
        const indianStates = State.getStatesOfCountry("IN");
        setStates(indianStates.map(s => `${s.name} (${s.isoCode})`));
        const citiesList = City.getCitiesOfState("IN", userData?.stateCode ?? "PB");
        setCities(citiesList.map(c => c.name));
        getUserLocation();
        setLoader(false)
    }, [userData]);

    const openGallery = () => {
        try {
            ImageCropPicker.openPicker({
                width: 400,
                height: 400,
                cropping: false,
                mediaType: "photo",
                multiple: false
            }).then(async image => {
                setProfileImage(image);
            });
        } catch (error: any) {
            console.log("Error opening picker", error);
        }
    };

    const ClickedOnContinue = async () => {
        const fireUtils = useFireStoreUtil();
        var profile_picture: any = profileImage;
        if (profileImage?.path) {
            profile_picture = await fireUtils.uploadMediaToFirebase(profileImage?.path);
        }
        const ref = await updatingUserApi({
            user_id: user_id,
            age: null,
            gender: null,
            stateCode: selectedStateCode?.code,
            state: selectedStateCode?.value,
            city: selectedCity,
            profile_picture: profile_picture,
            interest: selectedTags
        })


        if (ref) {
            dispatch(setUserData({
                ...userData,
                stateCode: selectedStateCode?.code,
                state: selectedStateCode?.value,
                city: selectedCity,
                profile_picture: profile_picture,
                interest: selectedTags
            }))
            navigation.goBack();
        }
    };

    const handleStateChange = (value: string) => {
        const match: any = value.match(/^(.*)\s\((.*)\)$/);
        setSelectedStateCode({
            code: match[2],
            value: match[1]
        });
        const citiesList = City.getCitiesOfState("IN", match[2]);
        setCities(citiesList.map(c => c.name));
        setSelectedCity("");
    };

    const loggingOut = () => {
        dispatch(setUserData({}));
        dispatch(setUserId(""));
        navigation.reset({
            index: 0,
            routes: [{ name: AppRoutes?.Login }]
        });
    };

    const removeItem = (itemToRemove: string) => {
        setSelectedTags(prevItems => prevItems.filter(item => item !== itemToRemove));
    };

    const RenderItemForSelectedProduct = ({ item }: { item: any }) => {
        return (
            <View style={styles.tagItem}>
                <Text>{item}</Text>
                <Pressable onPress={() => removeItem(item)} style={styles.tagRemoveButton}>
                    <Image source={Images?.Cancel} style={styles.tagRemoveIcon} resizeMode="contain" />
                </Pressable>
            </View>
        );
    };

    return (
        <>
            {loader && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 999
                }}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
            <SafeAreaView style={[styles.safeArea, { marginTop: statusBarHeight }]}>
                <Header title={"Profile"} rightIcon={Images?.logout} rightClick={loggingOut} />

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
                    <Pressable onPress={openGallery}>
                        <FastImage
                            source={Images?.EditForProductBlock}
                            style={styles.editIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>

                <View style={[styles.dropdownWrapper, { marginTop: hp(3) }]}>
                    <Text style={styles.inputLabel}>Select Your state</Text>
                    <Dropdown
                        options={states}
                        selectedValue={selectedStateCode?.code ? `${selectedStateCode?.value}` : ""}
                        onValueChange={handleStateChange}
                    />
                </View>

                <View style={[styles.dropdownWrapper]}>
                    <Text style={styles.inputLabel}>Select Your City</Text>
                    <Dropdown
                        label="Select City"
                        options={cities}
                        selectedValue={selectedCity}
                        onValueChange={setSelectedCity}
                    />
                </View>

                <View style={styles.dropdownWrapper}>
                    <Text style={styles.inputLabel}>Interest</Text>
                    <View style={styles.tagsContainer}>
                        {selectedTags?.map((item, index) => (
                            <RenderItemForSelectedProduct key={index} item={item} />
                        ))}
                    </View>
                    <Dropdown
                        options={["Saree", "Suits", "Toy gun", "Crockery", "Pants", "Shirts"]}
                        selectedValue={""}
                        barBorderColor={{ borderColor: "black", paddingVertical: 10 }}
                        alreadySelectedOptions={selectedTags}
                        onValueChange={item => {
                            if (!selectedTags.includes(item)) {
                                setSelectedTags([...selectedTags, item]);
                            }
                        }}
                    />
                </View>

                <View style={styles.flexSpacer} />

                <BottomButton btnStyle={styles.bottomButton} title={"Continue"} clickable={ClickedOnContinue} />
            </SafeAreaView>
        </>
    );
};

export default Profile;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "rgba(233, 174, 160, 0.1)"
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
    editIcon: {
        width: 30,
        height: 30,
        position: "absolute",
        bottom: -10,
        right: -10
    },
    dropdownWrapper: {
        width: width * 0.9,
        alignSelf: "center",
        marginTop: hp(1)
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
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
    tagRemoveButton: {
        paddingHorizontal: 5
    },
    tagRemoveIcon: {
        width: 14,
        height: 14
    },
    flexSpacer: {
        flex: 1
    },
    bottomButton: {
        marginTop: hp(5),
        marginBottom: hp(5)
    },
    inputLabel: {
        fontFamily: AppFonts.Regular,
        fontSize: 16,
        marginLeft: wp(1),
        color: Colors?.DarkText
    },
});
