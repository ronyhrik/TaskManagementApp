import Config from "react-native-config";

export type AppEnv = "development" | "staging" | "production";

export const ENV = {
  APP_ENV: (Config.APP_ENV as AppEnv) || "development",
  API_URL: Config.API_URL ?? "",
  ENABLE_LOGS: Config.ENABLE_LOGS === "true",
};

export const validateEnv = () => {
  const required: Array<keyof typeof ENV> = ["APP_ENV", "API_URL"];

  required.forEach((key) => {
    if (!ENV[key]) {
      throw new Error(`Missing env variable: ${key}. Did you forget to set ENVFILE / rebuild native code after adding react-native-config?`);
    }
  });

  if (ENV.ENABLE_LOGS) {
    console.log("ENV loaded:", ENV.APP_ENV);
  }
};
