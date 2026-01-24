// App.tsx (InvaBusiness)
import '@react-native-firebase/app';
import React, { useEffect } from 'react';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import { Provider } from "react-redux";
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import MainStack from './Source/Navigation/Stack'; // adjust if needed
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from './Source/Redux/store';
import { PersistGate } from "redux-persist/integration/react";
import Toast from "react-native-toast-message";
import notifee, { AndroidImportance, EventType as NotifeeEventType } from '@notifee/react-native';
import { navigationRef, navigate } from "./NavigationRef"
import AppRoutes from './Source/Routes/AppRoutes';
import { updatingFCM } from './Source/Api';

// Request Android 13+ notification permission
async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

// Show local notification for foreground messages (attach data)
async function handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  try {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title ?? 'New Notification',
      body: remoteMessage.notification?.body ?? '',
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher', // ensure this exists in android resources
        pressAction: { id: 'default' },
      },
      data: remoteMessage.data ?? {}
    });
  } catch (err) {
    console.warn('Error showing foreground notification', err);
  }
}

// Normalize incoming data keys and navigate accordingly
function handleNotificationNavigationFromData(data: { [k: string]: any }) {
  if (!data) return;

  // accept several key formats (camelCase / snake_case)
  const productId = data.productId ?? data.product_id ?? null;
  const orderId = data.orderId ?? data.order_id ?? null;
  const screen = data.screen ?? data.targetScreen ?? null;
  const userId = data.userId ?? data.user_id ?? null;

  console.log('Business app notification routing -> screen:', screen, 'productId:', productId, 'orderId:', orderId, 'userId:', userId);

  // typical business routes mapping (adjust names to your navigator)
  if (screen === 'product_detail') {
    if (productId && productId !== 'none' && productId !== 'null') {
      navigate(AppRoutes?.productDetail, { productId: productId });
      return;
    }
  } else if (screen === 'chat') {
    // Example: open chat with user or order
    navigate(AppRoutes?.Chat, { userId, orderId });
    return;
  }

  // fallback: if backend sends screen name that directly matches route
  if (screen) {
    try {
      const params = data.params ? JSON.parse(data.params) : undefined;
      navigate(screen, params);
    } catch (e) {
      console.warn('Failed to navigate to screen from notification (fallback):', e);
    }
  }
}

function App(): React.JSX.Element {
  const linking = {
    prefixes: ["invabusiness://", "https://business.inva.net.in"],
    config: {
      screens: {
        ProductDetail: "product/:id",
        OrderDetail: "order/:id",
        // add other deep links if needed
      },
    },
  };

  useEffect(() => {
    let unsubOnMessage: (() => void) | null = null;
    let notifeeForegroundUnsub: (() => void) | null = null;

    (async () => {
      try {
        // request permission
        const ok = await requestNotificationPermission();
        if (!ok) {
          Alert.alert(
            'You declined notification permission',
            'To receive important updates, please enable notifications in your device settings.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Allow Notifications',
                onPress: () => {
                  // Open app settings
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
          return; // Exit early since permission is denied
        }

        // create default channel for android
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        try {
          const token = await messaging().getToken();
          const state: any = store.getState();
          if (
            token &&
            state?.userData?.userData?._id &&
            state?.userData?.userData?._id?.length > 0
          ) {
            let notification_token = token;
            let seller_id = state?.userData?.userData?._id;
            const res = await updatingFCM({
              seller_id,
              notification_token,
            });
          }
        } catch (err) {
          console.warn('Failed to get FCM token', err);
        }

        // foreground handler: show local notification and log payload
        unsubOnMessage = messaging().onMessage(async (remoteMessage) => {
          console.log(
            'FCM onMessage (foreground) FULL:',
            JSON.stringify(remoteMessage, null, 2)
          );
          await handleForegroundMessage(remoteMessage);
        });

        // background: user tapped notification while app was backgrounded
        messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log(
            'onNotificationOpenedApp FULL (business):',
            JSON.stringify(remoteMessage, null, 2)
          );
          const data = remoteMessage?.data ?? {};
          handleNotificationNavigationFromData(data);
        });

        // killed -> opened via notification
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log(
            'getInitialNotification FULL (business):',
            JSON.stringify(initialNotification, null, 2)
          );
          // small delay to allow navigation to initialize
          setTimeout(() => {
            handleNotificationNavigationFromData(initialNotification.data ?? {});
          }, 500);
        }

        // Notifee foreground press listener
        notifeeForegroundUnsub = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === NotifeeEventType.PRESS) {
            console.log(
              'Notifee PRESS event (business) FULL:',
              JSON.stringify(detail, null, 2)
            );
            const data = detail.notification?.data ?? {};
            handleNotificationNavigationFromData(data);
          }
        });

        // Notifee initial (killed -> open via notifee)
        const initialNotifee = await notifee.getInitialNotification();
        if (initialNotifee?.notification) {
          console.log(
            'Notifee initial notification (business) FULL:',
            JSON.stringify(initialNotifee, null, 2)
          );
          setTimeout(() => {
            handleNotificationNavigationFromData(
              initialNotifee.notification.data ?? {}
            );
          }, 500);
        }
      } catch (err) {
        console.warn('Notification setup error (business):', err);
      }
    })();

    return () => {
      if (unsubOnMessage) unsubOnMessage();
      if (notifeeForegroundUnsub) notifeeForegroundUnsub();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer linking={linking} ref={navigationRef}>
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
