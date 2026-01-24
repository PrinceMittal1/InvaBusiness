import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import Header from "../Components/Header";
import AddingProduct from "../Components/AddingProduct";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../Keys/colors";
import { wp } from "../Keys/dimension";
import AppFonts from "../Functions/Fonts";
import { useSelector } from "react-redux";
import { deleteProduct, fetchingMostPopularProduct } from "../Api";
import ProductBlock from "../Components/ProductBlock";
import CommentModal from "../Components/Comments/CommentModal";

const Home = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const insets = useSafeAreaInsets();
  const { user_id } = useSelector((state: any) => state.userData);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showComment, setShowComment] = useState({
    state: false,
    id: ''
  })
  const limit = 5;

  const fetchingHomeProduct = async (pageNumber = 1, append = false) => {
    try {
      setLoading(true);
      const res = await fetchingMostPopularProduct({
        seller_id: user_id,
        page: pageNumber,
        limit,
      });
      if (res?.status === 200) {
        const newProducts = res?.data?.products || [];
        setHasMore(newProducts.length === limit);
        if (append) {
          setAllProducts((prev) => [...prev, ...newProducts]);
        } else {
          setAllProducts(newProducts);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchingHomeProduct(1, false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchingHomeProduct(nextPage, true);
    }
  };

  const deletingProduct = async (data: any, index: any) => {
    try {
      const res = await deleteProduct({ product_id: data?._id });
      if (res.status === 200) {
        setAllProducts((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (error) { }
  };

  const RenderItem = ({ item, index }: any) => (
    <ProductBlock
      item={item}
      onDeleting={() => deletingProduct(item, index)}
      onCommentPress={() => {
        setShowComment({
          state: true,
          id: item?._id
        })
      }}
    />
  );

  return (
    <>

      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
        }}
      >
        <Header title={"Home"} showbackIcon={false}/>
        {
          showPicker ? (
              <AddingProduct
                ClosingModal={() => setShowPicker(false)}
                productsaved={() => fetchingHomeProduct(1, false)}
              />
            ) : (
              <Pressable
                onPress={() => setShowPicker(true)}
                style={{
                  backgroundColor: Colors?.buttonPrimaryColor,
                  width: wp(95),
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 15,
                  marginTop: 10,
                  borderRadius: wp(2),
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors?.DarkText,
                    fontFamily: AppFonts.Regular,
                  }}
                >
                  Add Product +
                </Text>
              </Pressable>
            )
        }

        <FlatList
          data={allProducts}
          renderItem={RenderItem}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color="blue" style={{ margin: 10 }} />
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
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
export default Home;
