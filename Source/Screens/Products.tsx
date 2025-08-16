import { useEffect, useState, useCallback } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { setLoader } from "../Redux/Reducers/tempData";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import firestore from '@react-native-firebase/firestore'; // If using react-native-firebase
import { useSelector } from "react-redux";
import ProductBlock from "../Components/ProductBlock";
import FireKeys from "../Functions/FireKeys";
import storage from '@react-native-firebase/storage';
import EditingProductModal from "../Modal/EditingProductModal";
import Header from "../Components/Header";


const PAGE_SIZE = 10;

const Products = () => {
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isEnd, setIsEnd] = useState<boolean>(false);
    const { user_id } = useSelector((state: any) => state.userData);
    const [showEditingProductModal, setShowEditingProductModal] = useState({
        state : false,
        data : {}
    })
    const fireUtils = useFireStoreUtil();

    const gettingProducts = useCallback(async (isInitial = false) => {
        if (loading || isEnd) return;
        setLoading(true);
        try {
            let query = firestore()
                .collection(FireKeys?.Products)
                .where('user_id', '==', user_id)
            // .orderBy('createdAt', 'desc')
            // .limit(PAGE_SIZE);

            if (!isInitial && lastDoc) {
                query = query.startAfter(lastDoc);
            }
            const snapshot = await query.get();
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (docs.length < PAGE_SIZE) {
                setIsEnd(true); // No more data to fetch
            }
            setAllProducts(prev => isInitial ? docs : [...prev, ...docs]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, [user_id, lastDoc, loading, isEnd]);

    const removeImages = async (allImages : any) => {
        for (const imageUrl of allImages) {
            const decodedUrl = decodeURIComponent(imageUrl);
            const match = decodedUrl.match(/\/o\/(.*?)\?/); // extract path between /o/ and ?
            if (match && match[1]) {
                const storagePath = match[1]; // this will be like "uploads/file_1751308870154.jpg"
                await storage().ref(storagePath).delete();
                console.log('Deleted image:', storagePath);
            }
        }
    }
    const deletingProduct = async (data: any, index: any) => {
        try {
            let allImages = [...data?.images]
            await firestore().collection(FireKeys?.Products).doc(data?.id).delete();
            setAllProducts(prev => prev.filter((_, i) => i !== index));
            removeImages(allImages)
        } catch (e) {
            // ToastAndroid("somegting went wrong")
        } finally {

        }
    }

    useEffect(() => {
        gettingProducts(true);
    }, []);


    const RenderItem = ({ item, index }: any) => {
        return (
            <ProductBlock item={item} onEditing={()=>{
                setShowEditingProductModal({
                    state : true,
                    data : item
                })
            }} onDeleting={() => deletingProduct(item, index)} />
        )
    }


    return (
        <View style={{ flex: 1, marginTop: 25 }}>
             <Header title={'Products'} />

            <FlatList
                data={allProducts}
                renderItem={RenderItem}
                keyExtractor={(item) => item.id}
                // onEndReached={() => gettingProducts(false)}
                // onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator size="small" color="blue" /> : null}
            />

            {
                showEditingProductModal?.state &&
                <EditingProductModal data={showEditingProductModal} onClosePress={()=>{
                    setShowEditingProductModal({
                        ...showEditingProductModal,
                        state : false
                    })
                }}/>
            }
        </View>
    );
};

export default Products;
