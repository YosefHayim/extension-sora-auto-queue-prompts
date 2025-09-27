import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { initializeApp as initializeAdminApp } from "firebase-admin/app";
import { OAuth2Client } from "google-auth-library";
import { featureFlags } from "./lib/feature-flags";

export const config = {
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID_PROD,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_PROD,
    redirectUri: featureFlags.currentEnv === "production" ? process.env.GOOGLE_REDIRECT_URI : "http://localhost:3000/api/auth/google/callback",
  },
  ebay: {
    clientId: featureFlags.currentEnv === "production" ? process.env.EBAY_CLIENT_ID_PROD : process.env.EBAY_CLIENT_ID_SANDBOX,
    clientSecret: featureFlags.currentEnv === "production" ? process.env.EBAY_CLIENT_SECRET_ID_PROD : process.env.EBAY_CLIENT_SECRET_SANDBOX,
    redirectUri: featureFlags.currentEnv === "production" ? process.env.EBAY_REDIRECT_URI_PROD : process.env.EBAY_REDIRECT_URI_SANDBOX,
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    dbUrl: process.env.FIREBASE_DB_URL,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  },
};

export const oAuth2Client = new OAuth2Client({
  clientId: config.google.clientId,
  clientSecret: config.google.clientSecret,
  redirectUri: config.google.redirectUri,
});

const fireBaseConfig = {
  apiKey: config.firebase.apiKey,
  appId: config.firebase.appId,
  databaseURL: config.firebase.dbUrl,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  measurementId: config.firebase.measurementId,
};

const firebaseApp = initializeApp(fireBaseConfig);
export const fireBaseDb = getFirestore(firebaseApp);