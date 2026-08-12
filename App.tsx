import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";

import { store } from "./src/app/store";
import RootNavigator from "./src/app/navigation/RootNavigator";
import { initDB } from "./src/app/database/sqlite";
import { syncTasksThunk } from "./src/app/store/slices/task.slice";
import { hydrateThemeThunk } from "./src/app/store/slices/theme.slice";
import { startNetworkListener, stopNetworkListener } from "./src/app/services/network.service";
import { initNotifications } from "./src/app/services/notification.service";
import { registerForPushNotifications, initForegroundMessageHandler } from "./src/app/services/messaging.service";
import { subscribeToAuthChanges } from "./src/app/services/auth.service";
import { setUser } from "./src/app/store/slices/auth.slice";
import { logger } from "./src/app/utils/logger";

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeForegroundMessages: (() => void) | undefined;

    const setupApp = async () => {
      try {
        initDB();
        await initNotifications();
        await store.dispatch(hydrateThemeThunk());

        unsubscribeForegroundMessages = initForegroundMessageHandler();

        unsubscribeAuth = subscribeToAuthChanges((user) => {
          store.dispatch(setUser(user));
          if (user) {
            store.dispatch(syncTasksThunk(user.uid));
            registerForPushNotifications(user.uid);
          }
        });

        startNetworkListener(() => {
          const user = store.getState().auth.user;
          if (user) {
            store.dispatch(syncTasksThunk(user.uid));
          }
        });

        setIsInitialized(true);
      } catch (error) {
        logger.error("App initialization error:", error);
        setInitError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    setupApp();

    return () => {
      unsubscribeAuth?.();
      unsubscribeForegroundMessages?.();
      stopNetworkListener();
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
