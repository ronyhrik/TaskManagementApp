import { getToken, onMessage, requestPermission, type FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { getFirebaseMessaging } from "../config/firebase";
import { setUserFcmToken } from "../datasources/task.remote.datasource";
import { logger } from "../utils/logger";

const FCM_CHANNEL_ID = "fcm-messages";

// Foreground pushes aren't auto-displayed by RNFB messaging — route them through Notifee ourselves.
export const initForegroundMessageHandler = () => {
  return onMessage(getFirebaseMessaging(), async (message: FirebaseMessagingTypes.RemoteMessage) => {
    if (!message.notification) return;

    await notifee.createChannel({
      id: FCM_CHANNEL_ID,
      name: "Push Notifications",
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: message.notification.title,
      body: message.notification.body,
      android: { channelId: FCM_CHANNEL_ID, pressAction: { id: "default" } },
    });
  });
};

// Requests permission, fetches the FCM device token, and stores it on the user's Firestore
// doc so a server / Cloud Function can target this device for push.
export const registerForPushNotifications = async (userId: string): Promise<void> => {
  try {
    const messaging = getFirebaseMessaging();
    await requestPermission(messaging);
    const token = await getToken(messaging);
    await setUserFcmToken(userId, token);
  } catch (error) {
    logger.warn("FCM registration failed:", (error as Error)?.message);
  }
};
