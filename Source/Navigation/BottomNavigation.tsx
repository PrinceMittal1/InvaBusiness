// BottomTabs.tsx or inside same file
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screens/Home';
import Products from '../Screens/Products';
import Chat from '../Screens/ChatListing';
import Profile from '../Screens/Profile';
import Images from '../Keys/Images';
import { Image } from 'react-native';
import ChatListing from '../Screens/ChatListing';
import { gettingProductType } from '../Api';
import { setProductType } from '../Redux/Reducers/userData';
import { useDispatch } from 'react-redux';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const dispatch = useDispatch();

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
  useEffect(() => {
    gettingDataProudctType();
  }, [])

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {},
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.home} style={{ width: 20, height: 20, tintColor: focused ? 'grey' : 'black' }} resizeMode={'contain'} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={Products}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.post} style={{ width: 20, height: 20, tintColor: focused ? 'grey' : 'black' }} resizeMode={'contain'} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatListing"
        component={ChatListing}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.chat} style={{ width: 20, height: 20, tintColor: focused ? 'grey' : 'black' }} resizeMode={'contain'} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.person} style={{ width: 20, height: 20, tintColor: focused ? 'grey' : 'black' }} resizeMode={'contain'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
