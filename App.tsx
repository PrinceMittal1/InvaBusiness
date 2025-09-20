import { Provider } from "react-redux";
import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import PhoneAuth from './Source/Screens/PhoneAuth';
import messaging from '@react-native-firebase/messaging';
import MainStack from './Source/Navigation/Stack';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from './Source/Redux/store';
import { PersistGate } from "redux-persist/integration/react";
import Toast from "react-native-toast-message";
import notifee, {AndroidImportance} from '@notifee/react-native';

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

function App(): React.JSX.Element {

   useEffect(() => {
    (async () => {
      const ok = await requestNotificationPermission();
      if (!ok) {
        Alert.alert('Notifications disabled', 'User declined notification permission');
      }

      // create a default channel for android
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      // get FCM token
      const token = await messaging().getToken();
      console.log('FCM token:', token);
      // send this token to your server so you can target this device

      // foreground message handler
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('Foreground message:', remoteMessage);
        // show notification in foreground
        await notifee.displayNotification({
          title: remoteMessage.notification?.title ?? 'Message',
          body: remoteMessage.notification?.body ?? '',
          android: {channelId: 'default', smallIcon: 'ic_launcher'},
        });
      });

      return () => unsubscribe();
    })();
  }, []);



  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <MainStack />
          <Toast />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
