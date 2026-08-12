import NetInfo from "@react-native-community/netinfo";
import { logger } from "../utils/logger";

let unsubscribe: (() => void) | null = null;


 //Start listening to network changes

export const startNetworkListener = (onConnected: () => void) => {
  stopNetworkListener(); // safety

  unsubscribe = NetInfo.addEventListener((state) => {
    logger.log("Network state changed:", state.isConnected);
    if (state.isConnected === true) {
      onConnected();
    }
  });
};


//Stop listening to network changes

export const stopNetworkListener = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};
