import { useEffect, useState, useCallback } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import ProductBlock from "../Components/ProductBlock";
import FireKeys from "../Functions/FireKeys";
import storage from "@react-native-firebase/storage";
import EditingProductModal from "../Modal/EditingProductModal";
import Header from "../Components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Dropdown from "../Components/DropDown";
import { wp } from "../Keys/dimension";
import { fetchingMostPopularProduct } from "../Api";
import CommentModal from "../Components/Comments/CommentModal";

const PAGE_SIZE = 5;

const Products = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const { user_id } = useSelector((state: any) => state.userData);
  const [showEditingProductModal, setShowEditingProductModal] = useState({
    state: false,
    data: {},
  });
  const [showComment, setShowComment] = useState({
    state: false,
    id: ''
  })
  const [selectedFilter, setSelectedFilter] = useState("newest");
  const insets = useSafeAreaInsets();

  const gettingProducts = useCallback(
    async (isInitial = false, selectedFilterS : string) => {
      if (loading || (isEnd && !isInitial)) return;
      setLoading(true);
      try {
        let seller_id = user_id;
        let filter = selectedFilterS == 'Most Popular' ? 'mostPopular' : selectedFilterS == 'All' ? 'all' : "newest";

        const res = await fetchingMostPopularProduct({
          seller_id,
          filter,
          page: isInitial ? 1 : page,
          limit: PAGE_SIZE,
        });

        const newProducts = res?.data?.products || [];

        console.log("filters are ------ ",filter, "----- ", newProducts?.[0]?.title, "======", isInitial)

        if (isInitial) {
          setAllProducts(newProducts);
          setPage(2); // next page
          setIsEnd(newProducts.length < PAGE_SIZE);
        } else {
          setAllProducts((prev) => [...prev, ...newProducts]);
          setPage((prev) => prev + 1);
          if (newProducts.length < PAGE_SIZE) setIsEnd(true);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [user_id, page, loading, isEnd]
  );


  const removeImages = async (allImages: any) => {
    for (const imageUrl of allImages) {
      const decodedUrl = decodeURIComponent(imageUrl);
      const match = decodedUrl.match(/\/o\/(.*?)\?/);
      if (match && match[1]) {
        const storagePath = match[1];
        await storage().ref(storagePath).delete();
        console.log("Deleted image:", storagePath);
      }
    }
  };

  const deletingProduct = async (data: any, index: any) => {
    try {
      let allImages = [...data?.images];
      await firestore().collection(FireKeys?.Products).doc(data?.id).delete();
      setAllProducts((prev) => prev.filter((_, i) => i !== index));
      removeImages(allImages);
    } catch (e) {
      console.log("Error deleting product", e);
    }
  };

  useEffect(() => {
    gettingProducts(true, selectedFilter);
  }, [selectedFilter]);

  const RenderItem = ({ item, index }: any) => {
    return (
      <ProductBlock
        item={item}
        onEditing={() => {
          setShowEditingProductModal({
            state: true,
            data: item,
          });
        }}
        onCommentPress={() => {
          setShowComment({
            state: true,
            id: item?._id
          })
        }}
        onDeleting={() => deletingProduct(item, index)}
      />
    );
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(233, 174, 160, 0.1)",
          paddingTop: insets.top,
        }}
      >
        <Header title={"Products"} />

        <FlatList
          data={allProducts}
          renderItem={RenderItem}
          keyExtractor={(item, index) => `${item._id}-${index}-${item.title}`}
          ListHeaderComponent={() => (
            <Dropdown
              options={["Most Popular", "Newest", "All"]}
              selectedValue={selectedFilter}
              label={"Filter"}
              selectedTextStyle={{ textAlign: "center" }}
              containerStyle={{
                width: wp(35),
                alignSelf: "flex-end",
                marginRight: wp(5),
                marginTop:10
              }}
              onValueChange={(val) => {
                setSelectedFilter(val);
                setIsEnd(false);
                setPage(1);
                gettingProducts(true, val);
              }}
            />
          )}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color="blue" style={{ margin: 10 }} />
            ) : isEnd ? (
              <Text style={{ textAlign: "center", margin: 10 }}>No more products</Text>
            ) : null
          }
          onEndReached={() => gettingProducts(false, selectedFilter)}
          onEndReachedThreshold={0.5}
        />

        {showEditingProductModal?.state && (
          <EditingProductModal
            data={showEditingProductModal}
            onClosePress={() => {
              setShowEditingProductModal({
                ...showEditingProductModal,
                state: false,
              });
            }}
          />
        )}
      </View>
      {showComment?.state && (
        <CommentModal
          productId={showComment?.id}
          visible={showComment?.state}
          onCrossPress={() => setShowComment({
            state: false,
            id: ''
          })}
        />
      )}
    </>
  );
};

export default Products;
