import { Dimensions, FlatList, Image, Platform, Pressable, SafeAreaView, StatusBar, Text, TextInput, View } from "react-native"
import Header from "../Components/Header"
import { hp } from "../Keys/dimension";
import Dropdown from "../Components/DropDown";
import { useEffect, useState } from "react";
import { Country, State, City } from 'country-state-city';
import BottomButton from "../Components/BottomButton";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import keys from "../Routes/AppRoutes";
import Images from "../Keys/Images";


const { width, height } = Dimensions.get('window')
const ScreenForUserDetails = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [selected, setSelected] = useState('18');
    const { user_id } = useSelector((state: any) => state.userData);
    const [selectedBusinessType, setSelectedBusinessType] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [nameForBusiness, setNameForBusiness] = useState('')
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState({
        code: 'PB',
        value: 'Punjab'
    });
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('Kharar');
    const navigation = useNavigation();
    const ageOptions = Array.from({ length: 89 }, (_, i) => (i + 12).toString());

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

    const ClickedOnContinue = async () => {
        const fireUtils = useFireStoreUtil();
        const ref: any = fireUtils.updatingCustomerUserDetail(user_id, nameForBusiness, selectedBusinessType, selectedProducts,  selectedStateCode?.code, selectedStateCode?.value, selectedCity)
        if (ref) {
            navigation.navigate(keys?.BottomBar)
        } else {
        }
    }

    const removeItem = (itemToRemove: string) => {
        console.log("called remove item again ", itemToRemove)
        setSelectedProducts(prevItems => prevItems.filter(item => item !== itemToRemove));
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
                    backgroundColor: 'grey',
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

    console.log("------------- screen for seller")

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
            <Header title={"Details"} />


            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                <Text>Your Business Name</Text>
                <TextInput
                    value={nameForBusiness}
                    placeholder="Name"
                    placeholderTextColor={'black'}
                    onChangeText={setNameForBusiness}
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, }} />
            </View>

            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                <Text>Business Type</Text>
                <Dropdown
                    options={['Garment Store', 'Toys Store', 'Antique Store', 'Saree Store', 'Ladies Suit Store', 'Crockery Store', 'Handloom Store']}
                    selectedValue={selectedBusinessType}
                    alreadySelectedOptions={[]}
                    onValueChange={setSelectedBusinessType}
                />
            </View>


            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                <Text>Products</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedProducts.map((item, index) => (
                        <RenderItemForSelectedProduct key={index} item={item} />
                    ))}
                </View>
                <Dropdown
                    options={['Saree', 'Suits', 'Toys', 'Dinner Set', 'Crockery', 'Pants', 'Shirts']}
                    selectedValue={''}
                    alreadySelectedOptions={selectedProducts}
                    onValueChange={(item) => {
                        let oldItems: any = [...selectedProducts, item]
                        setSelectedProducts(oldItems)
                    }}
                />
            </View>

            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                <Text>Select Your state</Text>
                <Dropdown
                    options={states}
                    alreadySelectedOptions={[]}
                    selectedValue={selectedStateCode?.code ? `${selectedStateCode?.value}` : ''}
                    onValueChange={handleStateChange}
                />
            </View>


            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                <Text>Select Your City</Text>
                <Dropdown
                    label="Select City"
                    options={cities}
                    alreadySelectedOptions={[]}
                    selectedValue={selectedCity}
                    onValueChange={setSelectedCity}
                />
            </View>

            <View style={{ flex: 1 }} />

            <BottomButton
                btnStyle={{ marginBottom: hp(5) }}
                title={'Continue'}
                clickable={ClickedOnContinue}
            />



        </SafeAreaView>
    )
}

export default ScreenForUserDetails