import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";

import { store } from "./src/app/store";
import RootNavigator from "./src/app/navigation/RootNavigator";
import { initDB } from "./src/app/database/sqlite";
import { syncTasks } from "./src/app/database/sync.service";
import { startNetworkListener, stopNetworkListener } from "./src/app/services/network.service";
import { initNotifications } from "./src/app/services/notification.service";
import { subscribeToAuthChanges } from "./src/app/services/auth.service";
import { setUser } from "./src/app/store/slices/auth.slice";
import { initializeFirebase } from "./src/app/config/firebase";

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // 0️⃣ Initialize Firebase first
        await initializeFirebase();

        // 1️⃣ Init local DB
        initDB();

        // 2️⃣ Init notifications
        await initNotifications();

        // 3️⃣ Listen to Firebase auth changes (persist session)
        const unsubscribeAuth = subscribeToAuthChanges((user) => {
          store.dispatch(setUser(user));
          // Sync tasks automatically when user is logged in
          if (user) {
            syncTasks(user.uid);
          }
        });

        // 4️⃣ Start network listener
        startNetworkListener(() => {
          const user = store.getState().auth.user;
          if (user) {
            syncTasks(user.uid);
          }
        });

        setIsInitialized(true);

        // 5️⃣ Cleanup on unmount
        return () => {
          unsubscribeAuth();       // stop listening auth
          stopNetworkListener();   // stop network listener
        };
      } catch (error) {
        console.error("App initialization error:", error);
        setInitError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    const cleanup = setupApp();
    return () => {
      cleanup.then((c) => c?.());
    };
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {initError ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#ff0000" />
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator size="small" color="#ff0000" />
            </View>
          </View>
        ) : (
          <ActivityIndicator size="large" color="#007AFF" />
        )}
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
