/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import App from './App';
import { name as appName } from './app.json';
import { enableScreens } from "react-native-screens";

enableScreens(true);

// Must be registered outside the App component, before AppRegistry.registerComponent,
// so RNFB can invoke it even when the app process is not currently running.
setBackgroundMessageHandler(getMessaging(getApp()), async () => {});

AppRegistry.registerComponent(appName, () => App);
