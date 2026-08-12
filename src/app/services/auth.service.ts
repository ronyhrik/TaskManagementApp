import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import { getFirebaseAuth } from "../config/firebase";
import { logger } from "../utils/logger";

export type AppUser = {
  uid: string;
  email: string | null;
};

const toAppUser = (user: FirebaseAuthTypes.User | null): AppUser | null =>
  user ? { uid: user.uid, email: user.email } : null;

export const login = async (email: string, password: string): Promise<AppUser> => {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return toAppUser(credential.user)!;
};

export const signup = async (email: string, password: string): Promise<AppUser> => {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  return toAppUser(credential.user)!;
};

export const logout = async (): Promise<void> => {
  await signOut(getFirebaseAuth());
};

export const subscribeToAuthChanges = (callback: (user: AppUser | null) => void) => {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    logger.log("Auth state changed:", user?.email ?? "signed out");
    callback(toAppUser(user));
  });
};
