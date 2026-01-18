


const AppConfig = {
  APP_ENV: "dev",
  FIREBASE_API_KEY: "AIzaSyBoGypMr51up1MBwg_jdPtFUy7F5V8udro",
  FIREBASE_AUTH_DOMAIN: "taskmanagementapp-41745.firebaseapp.com",
  FIREBASE_PROJECT_ID: "taskmanagementapp-41745",
  FIREBASE_STORAGE_BUCKET: "taskmanagementapp-41745.firebasestorage.app",
  FIREBASE_MESSAGING_SENDER_ID: "701366155468",
  FIREBASE_APP_ID: "1:701366155468:android:afd70caae19d729de06a69",
  API_URL: "https://dev.api.taskmanager.com",
  ENABLE_LOGS: true,
};

//Centralized environment config
export const ENV = {
  APP_ENV: AppConfig.APP_ENV as "dev" | "staging" | "prod",

  FIREBASE_API_KEY: AppConfig.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: AppConfig.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: AppConfig.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: AppConfig.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: AppConfig.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: AppConfig.FIREBASE_APP_ID,

  API_URL: AppConfig.API_URL,
  ENABLE_LOGS: AppConfig.ENABLE_LOGS,
};


export const validateEnv = () => {
  const required = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
  ];

  required.forEach((key) => {
    if (!(AppConfig as any)[key]) {
      throw new Error(`Missing env variable: ${key}`);
    }
  });

  if (ENV.ENABLE_LOGS) {
    console.log("ENV Loaded:", ENV.APP_ENV);
  }
};
