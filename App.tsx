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
        await initializeFirebase();
        initDB();
        await initNotifications();
        const unsubscribeAuth = subscribeToAuthChanges((user) => {
          if (user) {
            store.dispatch(setUser(user));
            syncTasks(user.uid);
          } else {
            store.dispatch(setUser(null));
          }
        });
        startNetworkListener(() => {
          const user = store.getState().auth.user;
          if (user) {
            syncTasks(user.uid);
          }
        });
        setIsInitialized(true);
        return () => {
          unsubscribeAuth();
          stopNetworkListener();
        };
      } catch (error) {
        console.error("❌ [APP] App initialization error:", error);
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
