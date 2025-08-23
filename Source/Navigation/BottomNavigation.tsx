// BottomTabs.tsx or inside same file
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screens/Home';
import Products from '../Screens/Products';
import Chat from '../Screens/ChatListing';
import Profile from '../Screens/Profile';
import Images from '../Keys/Images';
import { Image } from 'react-native';
import ChatListing from '../Screens/ChatListing';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor :'rgba(233, 174, 160, 0.1)'},
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.home} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={Products}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.post} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
      <Tab.Screen
        name="ChatListing"
        component={ChatListing}
        options={{
          tabBarIcon: ({ focused }) => (
           <Image source={Images?.chat} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.person} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
