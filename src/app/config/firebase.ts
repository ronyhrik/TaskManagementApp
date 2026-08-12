import { getApp } from "@react-native-firebase/app";
import { getAuth, type FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getFirestore, type FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { getMessaging, type FirebaseMessagingTypes } from "@react-native-firebase/messaging";

export const getFirebaseAuth = (): FirebaseAuthTypes.Module => getAuth(getApp());

export const getFirestoreDB = (): FirebaseFirestoreTypes.Module => getFirestore(getApp());

export const getFirebaseMessaging = (): FirebaseMessagingTypes.Module => getMessaging(getApp());
