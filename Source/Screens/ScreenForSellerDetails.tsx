import { Dimensions, FlatList, Image, PermissionsAndroid, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native"
import Header from "../Components/Header"
import { hp, wp } from "../Keys/dimension";
import Dropdown from "../Components/DropDown";
import { useEffect, useState } from "react";
import { Country, State, City } from 'country-state-city';
import BottomButton from "../Components/BottomButton";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import keys from "../Routes/AppRoutes";
import Images from "../Keys/Images";
import FastImage from "@d11/react-native-fast-image";
import AppFonts from "../Functions/Fonts";
import Colors from "../Keys/colors";
import ImageCropPicker from "react-native-image-crop-picker";
import { setLoader } from "../Redux/Reducers/tempData";
import { gettingBusinessType, gettingProductType, updatingUserApi } from "../Api";
import AppRoutes from "../Routes/AppRoutes";
import { setProductType, setUserData } from "../Redux/Reducers/userData";
import Geolocation from "@react-native-community/geolocation";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const { width, height } = Dimensions.get('window')
const ScreenForUserDetails = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [selected, setSelected] = useState('18');
    const { user_id, productType: productTypes } = useSelector((state: any) => state.userData);
    const [selectedBusinessType, setSelectedBusinessType] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [nameForBusiness, setNameForBusiness] = useState('')
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState({
        code: 'PB',
        value: 'Punjab'
    });
    const [allBusinessType, setAllBusinessType] = useState([])
    const [allProductType, setAllProductType] = useState([]);
    const [profileImage, setProfileImage] = useState<any>(null);
    const [latLong, setLatLong] = useState<any>(null)
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('Kharar');
    const navigation = useNavigation();
    const ageOptions = Array.from({ length: 89 }, (_, i) => (i + 12).toString());
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const indianStates = State.getStatesOfCountry('IN');
        setStates(indianStates.map(s => `${s.name} (${s.isoCode})`));
        const citiesList = City.getCitiesOfState('IN', 'PB');
        setCities(citiesList.map(c => c.name));
    }, [])

    const handleStateChange = (value: string) => {
        const match: any = value.match(/^(.*)\s\((.*)\)$/);
        setSelectedStateCode({
            code: match[2],
            value: match[1]
        });
        const citiesList = City.getCitiesOfState('IN', match[2]);
        setCities(citiesList.map(c => c.name));
        setSelectedCity('');
    };

    const updatingData = (profile_picture: string) => {
        dispatch(setUserData({
            _id: user_id,
            businessName: nameForBusiness,
            businessType: selectedBusinessType,
            stateCode: selectedStateCode?.code,
            products: selectedProducts,
            state: selectedStateCode?.value,
            city: selectedCity,
            profile_picture: profile_picture,
        }));
    };

    useEffect(() => {
        if (productTypes && productTypes?.length > 0) {
            setAllProductType(productTypes)
        }
    }, [productTypes])

    const gettingDataProudctType = async () => {
        try {
            const res = await gettingProductType();
            if (res?.status == 200) {
                dispatch(setProductType(res?.data?.product_types))
            } else {
                dispatch(setProductType([]))
            }
        } catch (error) {
            dispatch(setProductType([]))
        }
    }

    const gettingDataBusinessType = async () => {
        try {
            const res = await gettingBusinessType();
            if (res?.status == 200) {
                setAllBusinessType(res?.data)
            } else {
            }
        } catch (error) {
        }
    }
    console.log("all busienss type is -", allBusinessType)

    useEffect(() => {
        gettingDataProudctType();
        gettingDataBusinessType();
    }, [])

    const ClickedOnContinue = async () => {
        setLoader(true)
        const fireUtils = useFireStoreUtil();
        let profile_picture: any = '';
        if (profileImage?.path) {
            profile_picture = await fireUtils.uploadMediaToFirebase(profileImage?.path);
        }
        const ref = await updatingUserApi({
            _id: user_id,
            businessName: nameForBusiness,
            businessType: selectedBusinessType,
            stateCode: selectedStateCode?.code,
            products: selectedProducts,
            state: selectedStateCode?.value,
            city: selectedCity,
            profile_picture: profile_picture,
            latitude: String(latLong?.latitude) ?? '',
            longtitude: String(latLong?.longtitude) ?? ''
        })

        if (ref?.status == 200) {
            navigation.reset({
                index: 0,
                routes: [{ name: AppRoutes?.BottomBar }],
            });
            updatingData(profile_picture);
        }
        setLoader(false)
    }

    const removeItem = (itemToRemove: string) => {
        setSelectedProducts(prevItems => prevItems.filter(item => item !== itemToRemove));
    };

    const openGallery = () => {
        try {
            ImageCropPicker.openPicker({
                width: 400,
                height: 400,
                cropping: false,
                mediaType: 'photo',
                multiple: false,
            }).then(async (image) => {
                setProfileImage(image);
            });
        } catch (error: any) {
            console.log("Error opening picker", error);
        }
    };

    async function reverseGeocode(lat: number, lng: number) {
        const apiKey = "AIzaSyDK1ouABQADC7bV9YrQt319jf4LVHmOfeQ";
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const components = data.results[0].address_components;
            const getComponent = (type: string) =>
                components.find((c: any) => c.types.includes(type))?.long_name;
            const city = getComponent("locality") || getComponent("administrative_area_level_2");
            const state = getComponent("administrative_area_level_1");
            setSelectedCity(city)
            const match = states.find(s => s.toLowerCase().includes(state.toLowerCase()));
            if (!match) return null;
            const regex = /(.*)\s\((.*)\)/;
            const [, name, code] = match.match(regex) || [];
            setSelectedStateCode({
                code: code,
                value: name
            })
            setLatLong({
                latitude: lat,
                longtitude: lng
            })
        } catch (err) {
            console.error("Geocoding error:", err);
        }
    }

    const saveSellerLocation = async () => {
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
                reverseGeocode(28.7041, 77.1025);
            },
            error => { },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const RenderItemForSelectedProduct = ({ item }: { item: any }) => {
        return (
            <View
                style={{
                    padding: 10,
                    paddingRight: 5,
                    margin: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#e0dedd',
                    borderRadius: 10,
                }}
            >
                <Text>{item}</Text>
                <Pressable onPress={() => { removeItem(item) }} style={{ paddingHorizontal: 5 }}>
                    <Image
                        source={Images?.Cancel}
                        style={{ width: 16, height: 16 }}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets?.top, paddingBottom: insets.bottom }}>
            <Header title={"Details"} />

            <ScrollView style={{ flex: 1 }}>
                <View style={styles.profileImageContainer}>
                    <FastImage
                        style={styles.profileImage}
                        source={(!profileImage && !profileImage?.path) ? Images?.person : { uri: profileImage.path }}
                    />
                    <Pressable onPress={openGallery}>
                        <FastImage source={Images?.EditForProductBlock} style={styles.editIcon} resizeMode="contain" />
                    </Pressable>
                </View>

                <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                    <Text style={styles.inputLabel}>Your Business Name</Text>
                    <View style={styles?.dropdown}>
                        <TextInput
                            value={nameForBusiness}
                            placeholder="Name"
                            placeholderTextColor={Colors?.DarkText}
                            onChangeText={setNameForBusiness}
                            style={{ fontFamily: AppFonts.Regular, fontSize: 16 }}
                        />
                    </View>
                </View>

                <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(1) }}>
                    <Text style={styles.inputLabel}>Business Type</Text>
                    <Dropdown
                        options={allBusinessType}
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


                <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(1) }}>
                    <Text style={styles.inputLabel}>Products</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {selectedProducts.map((item, index) => (
                            <RenderItemForSelectedProduct key={index} item={item} />
                        ))}
                    </View>
                    <Dropdown
                        options={allProductType}
                        selectedValue={''}
                        onValueChange={(item) => {
                            let oldItems: any = [...selectedProducts, item]
                            setSelectedProducts(oldItems)
                        }}
                        alreadySelectedOptions={selectedProducts}
                        removeItem={(item: any) => {
                            const newArr = selectedProducts.filter((items: any) => items !== item);
                            setSelectedProducts(newArr)
                        }}
                    />
                </View>

                <Pressable onPress={saveSellerLocation} style={[styles?.dropdown, { alignSelf: 'flex-start', marginTop: hp(1), marginLeft: wp(5) }]}>
                    <Text style={styles.inputLabel}>Get Your Current Location</Text>
                </Pressable>

                <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(1) }}>
                    <Text style={styles.inputLabel}>Select Your state</Text>
                    <Dropdown
                        options={states}
                        removeItem={(item: any) => {
                            const match: any = item.match(/^(.*)\s\((.*)\)$/);
                            if (match[1] == selectedStateCode?.value) {
                                setSelectedStateCode({
                                    code: "",
                                    value: ""
                                })
                            }
                        }}
                        alreadySelectedOptions={[`${selectedStateCode?.value} (${selectedStateCode?.code})`]}
                        selectedValue={selectedStateCode?.code ? `${selectedStateCode?.value}` : ''}
                        onValueChange={handleStateChange}
                    />
                </View>


                <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(1) }}>
                    <Text style={styles.inputLabel}>Select Your City</Text>
                    <Dropdown
                        label="Select City"
                        options={cities}
                        selectedValue={selectedCity}
                        removeItem={(item: any) => {
                            if (selectedCity == item) {
                                setSelectedCity('')
                            }
                        }}
                        alreadySelectedOptions={[selectedCity]}
                        onValueChange={setSelectedCity}
                    />
                </View>

            </ScrollView>



            <BottomButton
                btnStyle={{ marginBottom: wp(10), marginTop: hp(4), backgroundColor: Colors?.buttonPrimaryColor }}
                title={'Continue'}
                clickable={ClickedOnContinue}
            />

        </View>
    )
}

export default ScreenForUserDetails


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors?.PrimaryBackground,
    },
    dropdown: {
        paddingHorizontal: 12,
        height: wp(12),
        borderWidth: 1,
        justifyContent: 'center',
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