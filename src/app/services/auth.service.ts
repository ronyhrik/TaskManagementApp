import { getFirebaseAuth } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";


export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    .catch((error) => {
      console.error("❌ [AUTH] Login failed for", email, ":", error.message);
      throw error;
    });
};

export const signup = (email: string, password: string) => {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
    .catch((error) => {
      console.error("❌ [AUTH] Signup failed for", email, ":", error.message);
      throw error;
    });
};

export const logout = () => {
  return signOut(getFirebaseAuth())
    .catch((error) => {
      console.error("❌ [AUTH] Logout failed:", error.message);
      throw error;
    });
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    callback(user);
  });
};
