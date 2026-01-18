import { getFirebaseAuth } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";


export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    .catch((error) => {
      console.error("Login failed for", email, ":", error.code, error.message);
      throw error;
    });
};

export const signup = (email: string, password: string) => {
  console.log("Signup attempt with email:", email);
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
    .then((result) => {
      console.log("Signup successful for:", email);
      return result;
    })
    .catch((error) => {
      console.error("Signup failed for", email, "- Code:", error.code, "Message:", error.message);
      throw error;
    });
};

export const logout = () => {
  console.log("Logout attempt");
  return signOut(getFirebaseAuth())
    .then(() => {
      console.log("Logout successful");
    })
    .catch((error) => {
      console.error("Logout failed - Code:", error.code, "Message:", error.message);
      throw error;
    });
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    console.log("Auth state changed - User:", user?.email || "None");
    callback(user);
  });
};
