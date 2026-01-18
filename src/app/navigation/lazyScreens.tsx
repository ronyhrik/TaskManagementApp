import React, { ReactNode } from "react";
import { View, ActivityIndicator } from "react-native";


export const LazyScreenFallback = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);


export const LazyScreen = (Component: React.ComponentType<any>) => (props: any) => (
  <React.Suspense fallback={<LazyScreenFallback />}>
    <Component {...props} />
  </React.Suspense>
);
