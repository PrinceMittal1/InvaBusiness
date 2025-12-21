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
    ActivityIndicator,
    TextInput,
    ScrollView
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Dropdown from "../Components/DropDown";
import { hp, wp } from "../Keys/dimension";
import { useEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
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
import { profileDetailApi, updatingUserApi } from "../Api"

const { width, height } = Dimensions.get("window");

const EditProfile = () => {
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
    const [selectedBusinessType, setSelectedBusinessType] = useState('');
    const [nameForBusiness, setNameForBusiness] = useState('')
    const [loader, setLoader] = useState(false)
    const [selectedTags, setSelectedTags] = useState([]);
    const { user_id } = useSelector((state: any) => state.userData);
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const focus = useIsFocused();

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

    const gettingProfileDetail = async () => {
        try {
            const res = await profileDetailApi({ user_id: user_id })
            if (res?.status == 200) {
                setUserData(res?.data?.seller)
                setSelectedStateCode({
                    code: res?.data?.seller?.stateCode,
                    value: res?.data?.seller?.state
                });
                setProfileImage(res?.data?.seller?.profile_picture);
                setSelectedTags(res?.data?.seller?.products);
                setSelectedCity(res?.data?.seller?.city);
                setNameForBusiness(res?.data?.seller?.businessName)
                setSelectedBusinessType(res?.data?.seller?.businessType)
                const indianStates = State.getStatesOfCountry("IN");
                setStates(indianStates.map(s => `${s.name} (${s.isoCode})`));
                const citiesList = City.getCitiesOfState("IN", res?.data?.seller?.stateCode ?? "PB");
                setCities(citiesList.map(c => c.name));
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
        try {
            setLoader(true)
            const fireUtils = useFireStoreUtil();
            var profile_picture: any = profileImage;
            if (profileImage?.path) {
                profile_picture = await fireUtils.uploadMediaToFirebase(profileImage?.path);
            }
            const ref = await updatingUserApi({
                _id: user_id,
                businessName: nameForBusiness,
                businessType: selectedBusinessType,
                stateCode: selectedStateCode?.code,
                products: selectedTags,
                state: selectedStateCode?.value,
                city: selectedCity,
                profile_picture: profile_picture,
            })

            if (ref) {
                navigation.goBack();
            }
        } catch (e) {

        } finally {
            setLoader(false)
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
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <Header title={"Edit Profile"} />

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
                        <Pressable onPress={openGallery}>
                            <FastImage
                                source={Images?.EditForProductBlock}
                                style={styles.editIcon}
                                resizeMode="contain"
                            />
                        </Pressable>
                    </View>

                    <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(3) }}>
                        <Text style={styles.inputLabel}>Your Business Name</Text>
                        <View style={styles?.dropdown}>
                            <TextInput
                                value={nameForBusiness}
                                placeholder="Name"
                                placeholderTextColor={Colors?.DarkText}
                                onChangeText={setNameForBusiness}
                                style={{ fontSize: 16, height: wp(11) }}
                            />
                        </View>
                    </View>

                    <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(1) }}>
                        <Text style={styles.inputLabel}>Business Type</Text>
                        <Dropdown
                            options={['Garment Store', 'Toys Store', 'Antique Store', 'Saree Store', 'Ladies Suit Store', 'Crockery Store', 'Handloom Store']}
                            selectedValue={selectedBusinessType}
                            removeItem={(item: any) => {
                                if (item == selectedBusinessType) {
                                    setSelectedBusinessType('')
                                }
                            }}
                            alreadySelectedOptions={[selectedBusinessType]}
                            onValueChange={setSelectedBusinessType}
                        />
                    </View>

                    <View style={[styles.dropdownWrapper, { marginTop: hp(1) }]}>
                        <Text style={styles.inputLabel}>Select Your state</Text>
                        <Dropdown
                            options={states}
                            alreadySelectedOptions={[`${selectedStateCode?.value} (${selectedStateCode?.code})`]}
                            selectedValue={selectedStateCode?.code ? `${selectedStateCode?.value}` : ""}
                            onValueChange={handleStateChange}
                            removeItem={(item: any) => {
                                const match: any = item.match(/^(.*)\s\((.*)\)$/);
                                if (match[1] == selectedStateCode?.value) {
                                    setSelectedStateCode({
                                        code: "",
                                        value: ""
                                    })
                                }
                            }}
                        />
                    </View>

                    <View style={[styles.dropdownWrapper, { marginTop: hp(1) }]}>
                        <Text style={styles.inputLabel}>Select Your City</Text>
                        <Dropdown
                            label="Select City"
                            options={cities}
                            alreadySelectedOptions={[selectedCity]}
                            selectedValue={selectedCity}
                            removeItem={(item: any) => {
                                if (selectedCity == item) {
                                    setSelectedCity('')
                                }
                            }}
                            onValueChange={setSelectedCity}
                        />
                    </View>

                    <View style={[styles.dropdownWrapper, { marginTop: hp(1) }]}>
                        <Text style={styles.inputLabel}>Products</Text>
                        <View style={styles.tagsContainer}>
                            {selectedTags?.map((item, index) => (
                                <RenderItemForSelectedProduct key={index} item={item} />
                            ))}
                        </View>
                        <Dropdown
                            options={["Saree", "Suits", "Toy gun", "Crockery", "Pants", "Shirts"]}
                            selectedValue={""}
                            alreadySelectedOptions={selectedTags}
                            removeItem={(item: any) => {
                                removeItem(item)
                            }}
                            onValueChange={item => {
                                if (!selectedTags.includes(item)) {
                                    setSelectedTags([...selectedTags, item]);
                                }
                            }}
                        />
                    </View>

                    <View style={styles.flexSpacer} />

                    <BottomButton btnStyle={styles.bottomButton} txtStyle={{ color: '#FFFFFF' }} title={"Continue"} clickable={ClickedOnContinue} />

                </ScrollView>
            </View>
        </>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "rgba(233, 174, 160, 0.1)"
    },
    dropdown: {
        paddingHorizontal: 12,
        height: wp(11),
        borderWidth: 1,
        borderColor: Colors?.buttonPrimaryColor,
        borderRadius: 8,
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
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    tagItem: {
        padding: 10,
        marginRight: 5,
        marginBottom: 3,
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
        marginBottom: hp(5),
        backgroundColor: Colors?.buttonPrimaryColor,
    },
    inputLabel: {
        fontFamily: AppFonts.Regular,
        fontSize: 16,
        marginLeft: wp(1),
        color: Colors?.DarkText
    },
});
