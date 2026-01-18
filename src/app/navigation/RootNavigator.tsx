import React from "react";
import { useAppSelector } from "../store/hooks";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

export default function RootNavigator() {
  const user = useAppSelector(state => state.auth.user);
  return user ? <AppStack /> : <AuthStack />;
}
