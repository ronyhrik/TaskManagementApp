import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import { ENV, validateEnv } from "./env";

let firebaseAuth: Auth | null = null;
let firestoreDB: Firestore | null = null;
let app: any = null;
let initPromise: Promise<void> | null = null;

export const initializeFirebase = async (): Promise<void> => {
  // Return existing promise if initialization is in progress
  if (initPromise) {
    return initPromise;
  }

  // Return immediately if already initialized
  if (firebaseAuth && firestoreDB) {
    return;
  }

  initPromise = (async () => {
    try {

      validateEnv();

      // Firebase config from env
      const firebaseConfig = {
        apiKey: ENV.FIREBASE_API_KEY,
        authDomain: ENV.FIREBASE_AUTH_DOMAIN,
        projectId: ENV.FIREBASE_PROJECT_ID,
        storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
        appId: ENV.FIREBASE_APP_ID,
      };

      //Initialize app if not already
      const existingApps = getApps();
      if (existingApps.length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = existingApps[0];
      }

      // Initialize Auth FIRST (before Firestore)
      firebaseAuth = getAuth(app);

      // Initialize Firestore AFTER Auth is ready
      try {
        firestoreDB = initializeFirestore(app, {
          experimentalForceLongPolling: true,
        });
      } catch (e) {
        // If Firestore already initialized, get the existing instance
        firestoreDB = getFirestore(app);
      }

      if (ENV.ENABLE_LOGS) {
        console.log("Firebase initialized successfully");
      }
    } catch (error) {
      console.error("Firebase initialization error:", error);
      initPromise = null; // Reset so next call tries again
      throw error;
    }
  })();

  return initPromise;
};

export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth not initialized. Call initializeFirebase() first.");
  }
  return firebaseAuth;
};

export const getFirestore_DB = (): Firestore => {
  if (!firestoreDB) {
    throw new Error("Firestore DB not initialized. Call initializeFirebase() first.");
  }
  return firestoreDB;
};

// Initialize on first import
initializeFirebase().catch((error) => {
  console.error("Failed to initialize Firebase:", error);
});

export { firebaseAuth, firestoreDB };
export default app;
