import { getFirebaseAuth } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";


export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(getFirebaseAuth(), email, password);

export const signup = (email: string, password: string) =>
  createUserWithEmailAndPassword(getFirebaseAuth(), email, password);

export const logout = () => signOut(getFirebaseAuth());

export const subscribeToAuthChanges = (callback: (user: User | null) => void) =>
  onAuthStateChanged(getFirebaseAuth(), callback);
